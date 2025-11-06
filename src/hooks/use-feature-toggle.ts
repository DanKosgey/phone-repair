// src/hooks/use-feature-toggle.ts
import { useState, useEffect } from 'react';
import { getFeatureSettings, type FeatureSettings, addFeatureToggleListener, removeFeatureToggleListener } from '@/lib/feature-toggle';

export function useFeatureToggle() {
  const [featureSettings, setFeatureSettings] = useState<FeatureSettings>({
    enableSecondHandProducts: true,
    enableTracking: true,
    enableShop: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatureSettings = async () => {
      try {
        setLoading(true);
        const settings = await getFeatureSettings();
        setFeatureSettings(settings);
      } catch (error) {
        console.error('Error loading feature settings:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load initial settings
    loadFeatureSettings();

    // Add listener for feature toggle changes
    const handleFeatureToggleChange = (settings: FeatureSettings) => {
      setFeatureSettings(settings);
    };

    addFeatureToggleListener(handleFeatureToggleChange);

    // Clean up listener on unmount
    return () => {
      removeFeatureToggleListener(handleFeatureToggleChange);
    };
  }, []);

  return { ...featureSettings, loading };
}