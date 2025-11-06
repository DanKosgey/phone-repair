// src/lib/config-service.ts

// Define types for our configuration
export interface BusinessConfig {
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  businessWebsite: string
  businessDescription: string
  copyrightText: string
  primaryColor: string
  secondaryColor: string
}

// Default configuration values
const DEFAULT_CONFIG: BusinessConfig = {
  businessName: "Jay's Shop",
  businessEmail: "info@devicecaretaker.com",
  businessPhone: "+254700123456",
  businessAddress: "123 Tech Street, Nairobi, Kenya",
  businessWebsite: "https://devicecaretaker.com",
  businessDescription: "Professional phone repair services and quality products.",
  copyrightText: "2024 Jay's Shop. All rights reserved.",
  primaryColor: "#3b82f6",
  secondaryColor: "#8b5cf6"
}

// Get configuration from database or return defaults
export async function getBusinessConfig(): Promise<BusinessConfig> {
  try {
    // In a real implementation, this would fetch from a database
    // For now, we'll return the default configuration
    const config = DEFAULT_CONFIG
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Try to get config from localStorage
      const storedConfig = localStorage.getItem('businessConfig')
      if (storedConfig) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) }
      }
    }
    
    return config
  } catch (error) {
    console.error('Error fetching business config:', error)
    return DEFAULT_CONFIG
  }
}

// Save configuration
export async function saveBusinessConfig(config: Partial<BusinessConfig>): Promise<void> {
  try {
    // In a real implementation, this would save to a database
    // For now, we'll save to localStorage
    if (typeof window !== 'undefined') {
      const currentConfig = await getBusinessConfig()
      const newConfig = { ...currentConfig, ...config }
      localStorage.setItem('businessConfig', JSON.stringify(newConfig))
    }
  } catch (error) {
    console.error('Error saving business config:', error)
    throw error
  }
}

// Get a specific configuration value
export async function getConfigValue<K extends keyof BusinessConfig>(key: K): Promise<BusinessConfig[K]> {
  const config = await getBusinessConfig()
  return config[key]
}