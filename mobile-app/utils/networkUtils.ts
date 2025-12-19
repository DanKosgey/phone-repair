/**
 * Network utilities for checking connectivity
 */

/**
 * Simple network connectivity check with multiple fallback methods
 */
export async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    console.log('[NETWORK_CHECK] Starting network connectivity check');
    
    // Method 1: Try to fetch a reliable endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const isConnected = response.ok;
    console.log('[NETWORK_CHECK] HTTP check result', { isConnected, status: response.status });
    return isConnected;
  } catch (error) {
    console.warn('[NETWORK_CHECK] HTTP check failed', { error: String(error) });
    
    // Method 2: Try a different endpoint
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const isConnected = response.ok;
      console.log('[NETWORK_CHECK] Google check result', { isConnected, status: response.status });
      return isConnected;
    } catch (error2) {
      console.warn('[NETWORK_CHECK] Google check failed', { error: String(error2) });
      
      // Method 3: Check if we can reach our own backend (if configured)
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        if (apiUrl) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          const response = await fetch(apiUrl, {
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          const isConnected = response.ok;
          console.log('[NETWORK_CHECK] API check result', { isConnected, status: response.status });
          return isConnected;
        }
      } catch (error3) {
        console.warn('[NETWORK_CHECK] API check failed', { error: String(error3) });
      }
    }
  }
  
  // If all methods fail, assume no connectivity
  console.log('[NETWORK_CHECK] All network checks failed, assuming no connectivity');
  return false;
}

/**
 * Wait for network connectivity with timeout and progressive checking
 */
export async function waitForNetwork(timeoutMs: number = 45000): Promise<boolean> {
  console.log('[NETWORK_WAIT] Waiting for network connectivity', { timeoutMs });
  const startTime = Date.now();
  
  // Check immediately first
  const isConnected = await checkNetworkConnectivity();
  if (isConnected) {
    console.log('[NETWORK_WAIT] Network already connected');
    return true;
  }
  
  // Progressive checking with increasing intervals
  let checkInterval = 1000; // Start with 1 second
  
  while (Date.now() - startTime < timeoutMs) {
    console.log('[NETWORK_WAIT] Checking network connectivity', { elapsed: Date.now() - startTime });
    const isConnected = await checkNetworkConnectivity();
    if (isConnected) {
      console.log('[NETWORK_WAIT] Network connectivity restored');
      return true;
    }
    
    // Wait before checking again with progressive interval
    console.log('[NETWORK_WAIT] Network not available, waiting', { checkInterval });
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    
    // Increase interval up to 5 seconds
    if (checkInterval < 5000) {
      checkInterval += 500;
    }
  }
  
  console.log('[NETWORK_WAIT] Timeout reached without network connectivity');
  return false;
}