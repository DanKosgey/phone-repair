// src/__tests__/feature-toggle.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { useFeatureToggle } from '@/hooks/use-feature-toggle';
import * as featureToggleLib from '@/lib/feature-toggle';

// Mock the feature toggle library
jest.mock('@/lib/feature-toggle', () => ({
  getFeatureSettings: jest.fn(),
}));

// Test component that uses the hook
const TestComponent = () => {
  const { enableShop, enableTracking, enableSecondHandProducts, loading } = useFeatureToggle();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div data-testid="shop-feature">{enableShop ? 'Shop Enabled' : 'Shop Disabled'}</div>
      <div data-testid="tracking-feature">{enableTracking ? 'Tracking Enabled' : 'Tracking Disabled'}</div>
      <div data-testid="secondhand-feature">{enableSecondHandProducts ? 'SecondHand Enabled' : 'SecondHand Disabled'}</div>
    </div>
  );
};

describe('Feature Toggle Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load default feature settings', async () => {
    // Mock the function to return default settings
    (featureToggleLib.getFeatureSettings as jest.Mock).mockResolvedValue({
      enableShop: true,
      enableTracking: true,
      enableSecondHandProducts: true,
    });

    render(<TestComponent />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('shop-feature')).toBeInTheDocument();
    });

    expect(screen.getByTestId('shop-feature')).toHaveTextContent('Shop Enabled');
    expect(screen.getByTestId('tracking-feature')).toHaveTextContent('Tracking Enabled');
    expect(screen.getByTestId('secondhand-feature')).toHaveTextContent('SecondHand Enabled');
  });

  test('should load custom feature settings with shop disabled', async () => {
    // Mock the function to return custom settings
    (featureToggleLib.getFeatureSettings as jest.Mock).mockResolvedValue({
      enableShop: false,
      enableTracking: true,
      enableSecondHandProducts: true,
    });

    render(<TestComponent />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('shop-feature')).toBeInTheDocument();
    });

    expect(screen.getByTestId('shop-feature')).toHaveTextContent('Shop Disabled');
    expect(screen.getByTestId('tracking-feature')).toHaveTextContent('Tracking Enabled');
    expect(screen.getByTestId('secondhand-feature')).toHaveTextContent('SecondHand Enabled');
  });

  test('should load custom feature settings with all features disabled', async () => {
    // Mock the function to return custom settings
    (featureToggleLib.getFeatureSettings as jest.Mock).mockResolvedValue({
      enableShop: false,
      enableTracking: false,
      enableSecondHandProducts: false,
    });

    render(<TestComponent />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('shop-feature')).toBeInTheDocument();
    });

    expect(screen.getByTestId('shop-feature')).toHaveTextContent('Shop Disabled');
    expect(screen.getByTestId('tracking-feature')).toHaveTextContent('Tracking Disabled');
    expect(screen.getByTestId('secondhand-feature')).toHaveTextContent('SecondHand Disabled');
  });
});