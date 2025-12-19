/**
 * Utility functions for handling photo uploads with better error handling and retries
 */

import { File } from 'expo-file-system'; // Use the new File class
import { checkNetworkConnectivity, waitForNetwork } from './networkUtils';

export interface UploadResult {
  url: string;
  fileName: string;
}

/**
 * Force log to ensure visibility
 */
function forceLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  // Try multiple logging methods to ensure visibility
  console.log(logMessage);
  console.info(logMessage);
  console.warn(logMessage); // Also use warn to make more visible
  
  // Also try error logging which might be more visible
  if (data) {
    console.log(`${logMessage}`, data);
    console.info(`${logMessage}`, data);
    console.warn(`${logMessage}`, data);
  } else {
    // Even without data, make sure message is visible
    console.warn(`${logMessage}`);
  }
  
  // Try to force output in different ways
  try {
    // Force a network request to trigger logging flush
    fetch('http://localhost:3000/__log__', {
      method: 'POST',
      body: JSON.stringify({ message: logMessage, data }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {}); // Ignore errors
  } catch (e) {
    // Ignore any errors
  }
}

/**
 * Upload a photo using the new Expo File API (Cleaner approach)
 */
export async function uploadPhoto(uri: string, maxRetries: number = 3): Promise<UploadResult> {
  forceLog('[PHOTO_UPLOAD] Starting upload via new Expo File API', { uri });

  try {
    // Check network connectivity first
    forceLog('[PHOTO_UPLOAD] Checking network connectivity');
    const isOnline = await checkNetworkConnectivity();
    forceLog('[PHOTO_UPLOAD] Network connectivity check result', { isOnline });
    
    if (!isOnline) {
      forceLog('[PHOTO_UPLOAD] No network connectivity, waiting for connection');
      const networkRestored = await waitForNetwork(45000); // Wait up to 45 seconds
      forceLog('[PHOTO_UPLOAD] Network wait result', { networkRestored });
      
      if (!networkRestored) {
        forceLog('[PHOTO_UPLOAD] Network connectivity not restored within timeout');
        throw new Error('No network connectivity. Please check your internet connection and try again.');
      }
      forceLog('[PHOTO_UPLOAD] Network connectivity restored');
    }
    
    // 1. Create a File reference and get the ArrayBuffer directly
    forceLog('[PHOTO_UPLOAD] Creating File reference and getting ArrayBuffer');
    const file = new File(uri);
    const arrayBuffer = await file.arrayBuffer(); 
    forceLog('[PHOTO_UPLOAD] Got ArrayBuffer successfully', { byteLength: arrayBuffer.byteLength });
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    forceLog('[PHOTO_UPLOAD] Generated filename', { fileName });

    // Import supabase here to avoid circular dependencies
    const { supabase } = require('../services/supabase');

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        forceLog(`[PHOTO_UPLOAD] Upload attempt ${attempt + 1}/${maxRetries}`);
        
        const { data, error } = await supabase.storage
          .from('ticket-photos')
          .upload(fileName, arrayBuffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (error) {
          forceLog('[PHOTO_UPLOAD] Supabase upload returned error', { 
            error: error.message || String(error),
            fileName
          });
          throw error;
        }

        forceLog('[PHOTO_UPLOAD] Photo uploaded to Supabase successfully', { fileName, data });

        const { data: urlData } = supabase.storage
          .from('ticket-photos')
          .getPublicUrl(fileName);

        forceLog('[PHOTO_UPLOAD] Generated public URL', { publicUrl: urlData.publicUrl, fileName });
        return { url: urlData.publicUrl, fileName };

      } catch (uploadError: any) {
        attempt++;
        forceLog(`[PHOTO_UPLOAD] Upload attempt ${attempt} failed`, { 
          error: uploadError.message || String(uploadError),
          fileName,
          attemptsLeft: maxRetries - attempt
        });
        
        // If it's a network error, check connectivity and wait
        const errorMessage = uploadError.message || String(uploadError);
        if (errorMessage && (errorMessage.includes('Network request failed') || 
                             errorMessage.includes('network') ||
                             errorMessage.includes('Failed to fetch') ||
                             errorMessage.includes('timeout') ||
                             errorMessage.includes('ECONNREFUSED'))) {
          forceLog('[PHOTO_UPLOAD] Network error detected, checking connectivity');
          const isOnline = await checkNetworkConnectivity();
          forceLog('[PHOTO_UPLOAD] Network check during error', { isOnline });
          
          if (!isOnline) {
            forceLog('[PHOTO_UPLOAD] Network lost, waiting for restoration');
            const networkRestored = await waitForNetwork(45000); // Wait up to 45 seconds
            forceLog('[PHOTO_UPLOAD] Network restoration wait result', { networkRestored });
            
            if (!networkRestored) {
              throw new Error('Network connection lost. Please check your internet connection and try again.');
            }
            forceLog('[PHOTO_UPLOAD] Network restored, continuing upload');
          }
          
          // Add a longer delay for network errors
          const delay = Math.pow(2, attempt) * 3000; // Longer delays for network issues
          forceLog(`[PHOTO_UPLOAD] Waiting ${delay}ms for network recovery`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        if (attempt >= maxRetries) {
          forceLog('[PHOTO_UPLOAD] All upload attempts exhausted', { 
            maxRetries, 
            finalError: errorMessage 
          });
          throw new Error(`Failed to upload photo after ${maxRetries} attempts: ${errorMessage}`);
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 2000; // 2^attempt * 2000ms
        forceLog(`[PHOTO_UPLOAD] Waiting ${delay}ms before retry attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } catch (error: any) {
    forceLog('[PHOTO_UPLOAD] Critical error in uploadPhoto function', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // This should never be reached
  forceLog('[PHOTO_UPLOAD] Unexpected code path reached');
  throw new Error('Unexpected upload error');
}

/**
 * Upload multiple photos in parallel with individual retry mechanisms
 */
export async function uploadMultiplePhotos(uris: string[], maxRetries: number = 3): Promise<UploadResult[]> {
  forceLog('[PHOTO_UPLOAD] Starting multiple photo upload process', { 
    count: uris.length, 
    maxRetries 
  });
  
  if (uris.length === 0) {
    forceLog('[PHOTO_UPLOAD] No photos to upload');
    return [];
  }
  
  try {
    // Check network connectivity first
    forceLog('[PHOTO_UPLOAD] Checking network connectivity for batch upload');
    const isOnline = await checkNetworkConnectivity();
    forceLog('[PHOTO_UPLOAD] Network connectivity check for batch upload', { isOnline });
    
    if (!isOnline) {
      forceLog('[PHOTO_UPLOAD] No network connectivity for batch upload, waiting for connection');
      const networkRestored = await waitForNetwork(45000); // Wait up to 45 seconds
      forceLog('[PHOTO_UPLOAD] Network wait result for batch upload', { networkRestored });
      
      if (!networkRestored) {
        forceLog('[PHOTO_UPLOAD] Network connectivity not restored for batch upload');
        throw new Error('No network connectivity. Please check your internet connection and try again.');
      }
      forceLog('[PHOTO_UPLOAD] Network connectivity restored for batch upload');
    }
    
    // Upload all photos sequentially (more stable than parallel for mobile networks)
    forceLog('[PHOTO_UPLOAD] Starting sequential upload of all photos');
    const results: UploadResult[] = [];
    
    for (let i = 0; i < uris.length; i++) {
      try {
        forceLog(`[PHOTO_UPLOAD] Starting upload of photo ${i + 1}/${uris.length}`, { uri: uris[i] });
        const result = await uploadPhoto(uris[i], maxRetries);
        results.push(result);
        forceLog(`[PHOTO_UPLOAD] Successfully uploaded photo ${i + 1}`, { 
          fileName: result.fileName, 
          url: result.url 
        });
      } catch (error: any) {
        forceLog(`[PHOTO_UPLOAD] Failed to upload photo ${i + 1}`, { 
          error: error.message || String(error),
          uri: uris[i]
        });
        throw error;
      }
    }
    
    forceLog('[PHOTO_UPLOAD] All photos uploaded successfully', { count: results.length });
    return results;
  } catch (error) {
    forceLog('[PHOTO_UPLOAD] Critical error in uploadMultiplePhotos function', { 
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}