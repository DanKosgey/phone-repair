import { getSupabaseBrowserClient } from '@/server/supabase/client'

export const storageService = {
  /**
   * Upload a file to a Supabase storage bucket
   * @param file The file to upload
   * @param bucket The bucket name
   * @param filePath Optional file path within the bucket
   * @returns The public URL of the uploaded file
   */
  async uploadFile(file: File, bucket: string, filePath?: string): Promise<string> {
    try {
      const supabase = getSupabaseBrowserClient()
      
      // Generate file name if not provided
      const fileName = filePath || `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`)
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  /**
   * Delete a file from a Supabase storage bucket
   * @param filePath The path of the file to delete
   * @param bucket The bucket name
   */
  async deleteFile(filePath: string, bucket: string): Promise<void> {
    try {
      const supabase = getSupabaseBrowserClient()
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  },

  /**
   * Get the public URL of a file in a Supabase storage bucket
   * @param filePath The path of the file
   * @param bucket The bucket name
   * @returns The public URL of the file
   */
  getFileUrl(filePath: string, bucket: string): string {
    try {
      const supabase = getSupabaseBrowserClient()
      
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error getting file URL:', error)
      throw error
    }
  },

  /**
   * List files in a Supabase storage bucket
   * @param bucket The bucket name
   * @param prefix Optional prefix to filter files
   * @returns Array of file objects
   */
  async listFiles(bucket: string, prefix?: string): Promise<any[]> {
    try {
      const supabase = getSupabaseBrowserClient()
      
      let query = supabase.storage.from(bucket).list()
      
      if (prefix) {
        query = query.match({ prefix })
      }
      
      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  }
}