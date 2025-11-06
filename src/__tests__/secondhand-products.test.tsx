// src/__tests__/secondhand-products.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { useFeatureToggle } from '@/hooks/use-feature-toggle';
import ClientHomePage from '@/app/ClientHomePage';
import * as featureToggleHook from '@/hooks/use-feature-toggle';

// Mock the useFeatureToggle hook
jest.mock('@/hooks/use-feature-toggle', () => ({
  useFeatureToggle: jest.fn(),
  ...jest.requireActual('@/hooks/use-feature-toggle'),
}));

// Mock dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any) => {
    const component = fn();
    if (component.then) {
      return component.then((mod: any) => mod.default || mod);
    }
    return component.default || component;
  },
}));

// Mock the components that are dynamically imported
jest.mock('@/components/homepage/EnhancedBackground', () => ({
  EnhancedBackground: () => <div data-testid="enhanced-background">Background</div>,
}));

jest.mock('@/components/homepage/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));

jest.mock('@/components/homepage/ServicesSection', () => ({
  ServicesSection: () => <div data-testid="services-section">Services Section</div>,
}));

jest.mock('@/components/homepage/WhyChooseUsSection', () => ({
  WhyChooseUsSection: () => <div data-testid="why-choose-us-section">Why Choose Us Section</div>,
}));

jest.mock('@/components/homepage/FeaturedProductsSection', () => ({
  FeaturedProductsSection: () => <div data-testid="featured-products-section">Featured Products Section</div>,
}));

jest.mock('@/components/homepage/SecondHandProductsSection', () => ({
  SecondHandProductsSection: () => <div data-testid="secondhand-products-section">Second Hand Products Section</div>,
}));

jest.mock('@/components/homepage/TrackTicketCTA', () => ({
  TrackTicketCTA: () => <div data-testid="track-ticket-cta">Track Ticket CTA</div>,
}));

// Mock layout components
jest.mock('@/components/layout/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock('@/components/layout/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('@/components/layout/MobileBottomNav', () => ({
  MobileBottomNav: () => <div data-testid="mobile-bottom-nav">Mobile Bottom Nav</div>,
}));

jest.mock('@/components/homepage/HomePageSidebar', () => ({
  HomePageSidebar: () => <div data-testid="homepage-sidebar">Homepage Sidebar</div>,
}));

describe('Second-Hand Products Feature Toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show SecondHandProductsSection when secondhand feature is enabled', async () => {
    // Mock the hook to return secondhand feature enabled
    (featureToggleHook.useFeatureToggle as jest.Mock).mockReturnValue({
      enableShop: true,
      enableTracking: true,
      enableSecondHandProducts: true,
      loading: false,
    });

    render(<ClientHomePage />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByTestId('secondhand-products-section')).toBeInTheDocument();
    });

    // Check that the SecondHandProductsSection is rendered
    expect(screen.getByTestId('secondhand-products-section')).toBeInTheDocument();
  });

  test('should hide SecondHandProductsSection when secondhand feature is disabled', async () => {
    // Mock the hook to return secondhand feature disabled
    (featureToggleHook.useFeatureToggle as jest.Mock).mockReturnValue({
      enableShop: true,
      enableTracking: true,
      enableSecondHandProducts: false,
      loading: false,
    });

    render(<ClientHomePage />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    // Check that the SecondHandProductsSection is not rendered
    expect(screen.queryByTestId('secondhand-products-section')).not.toBeInTheDocument();
  });

  test('should only hide SecondHandProductsSection when secondhand is disabled but other features remain', async () => {
    // Mock the hook to return only secondhand feature disabled
    (featureToggleHook.useFeatureToggle as jest.Mock).mockReturnValue({
      enableShop: true,
      enableTracking: true,
      enableSecondHandProducts: false,
      loading: false,
    });

    render(<ClientHomePage />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    // Check that the SecondHandProductsSection is not rendered
    expect(screen.queryByTestId('secondhand-products-section')).not.toBeInTheDocument();
    
    // Check that other feature sections are still rendered
    expect(screen.getByTestId('featured-products-section')).toBeInTheDocument();
    expect(screen.getByTestId('track-ticket-cta')).toBeInTheDocument();
  });
});