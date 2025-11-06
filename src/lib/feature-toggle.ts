// src/lib/feature-toggle.ts

// Define types for feature settings
export interface FeatureSettings {
  enableSecondHandProducts: boolean
  enableTracking: boolean
  enableShop: boolean
}

// Default feature settings
const DEFAULT_FEATURE_SETTINGS: FeatureSettings = {
  enableSecondHandProducts: true,
  enableTracking: true,
  enableShop: true
}

// Event emitter for feature toggle changes
type FeatureToggleListener = (settings: FeatureSettings) => void
const listeners: FeatureToggleListener[] = []

// Add a listener for feature toggle changes
export function addFeatureToggleListener(listener: FeatureToggleListener): void {
  listeners.push(listener)
}

// Remove a listener for feature toggle changes
export function removeFeatureToggleListener(listener: FeatureToggleListener): void {
  const index = listeners.indexOf(listener)
  if (index > -1) {
    listeners.splice(index, 1)
  }
}

// Notify all listeners of feature toggle changes
function notifyListeners(settings: FeatureSettings): void {
  listeners.forEach(listener => listener(settings))
}

// Get feature settings from localStorage or return defaults
export async function getFeatureSettings(): Promise<FeatureSettings> {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Try to get feature settings from localStorage
      const storedSettings = localStorage.getItem('featureSettings')
      if (storedSettings) {
        return { ...DEFAULT_FEATURE_SETTINGS, ...JSON.parse(storedSettings) }
      }
    }
    
    return DEFAULT_FEATURE_SETTINGS
  } catch (error) {
    console.error('Error fetching feature settings:', error)
    return DEFAULT_FEATURE_SETTINGS
  }
}

// Save feature settings
export async function saveFeatureSettings(settings: Partial<FeatureSettings>): Promise<void> {
  try {
    // In a real implementation, this would save to a database
    // For now, we'll save to localStorage
    if (typeof window !== 'undefined') {
      const currentSettings = await getFeatureSettings()
      const newSettings = { ...currentSettings, ...settings }
      localStorage.setItem('featureSettings', JSON.stringify(newSettings))
      
      // Notify all listeners of the change
      notifyListeners(newSettings)
    }
  } catch (error) {
    console.error('Error saving feature settings:', error)
    throw error
  }
}

// Get a specific feature setting value
export async function getFeatureSetting<K extends keyof FeatureSettings>(key: K): Promise<FeatureSettings[K]> {
  const settings = await getFeatureSettings()
  return settings[key]
}