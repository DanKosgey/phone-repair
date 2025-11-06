import { useEffect } from 'react'
import { useTheme } from 'next-themes'

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  primaryColor: string
  secondaryColor: string
}

// Convert hex color to HSL
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  // Remove # if present
  hex = hex.replace('#', '')

  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  // Find min and max values
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    
    h = h * 60
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

export function useAppearanceSettings() {
  const { setTheme } = useTheme()

  useEffect(() => {
    // Load appearance settings from localStorage
    const loadAppearanceSettings = () => {
      if (typeof window !== 'undefined') {
        const storedSettings = localStorage.getItem('appearanceSettings')
        if (storedSettings) {
          try {
            const settings: AppearanceSettings = JSON.parse(storedSettings)
            
            // Apply theme
            setTheme(settings.theme)
            
            // Apply custom colors
            applyCustomColors(settings.primaryColor, settings.secondaryColor)
          } catch (error) {
            console.error('Error parsing appearance settings:', error)
          }
        }
      }
    }

    // Apply custom colors to CSS variables
    const applyCustomColors = (primaryColor: string, secondaryColor: string) => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        
        // Convert hex to HSL for CSS variables
        const primaryHsl = hexToHsl(primaryColor)
        const secondaryHsl = hexToHsl(secondaryColor)
        
        // Apply custom colors as HSL values
        root.style.setProperty('--custom-primary', `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`)
        root.style.setProperty('--custom-secondary', `${secondaryHsl.h} ${secondaryHsl.s}% ${secondaryHsl.l}%`)
      }
    }

    loadAppearanceSettings()

    // Listen for storage changes to update settings across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appearanceSettings' && e.newValue) {
        try {
          const settings: AppearanceSettings = JSON.parse(e.newValue)
          setTheme(settings.theme)
          applyCustomColors(settings.primaryColor, settings.secondaryColor)
        } catch (error) {
          console.error('Error parsing appearance settings from storage event:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [setTheme])

  return null
}