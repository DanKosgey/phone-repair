// src/__tests__/feature-removal-verification.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import ClientHomePage from '@/app/ClientHomePage';
import * as featureToggleHook from '@/hooks/use-feature-toggle';

// Mock the useFeatureToggle hook
jest.mock('@/hooks/use-feature-toggle', () => ({
  useFeatureToggle: jest.fn(),
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

describe('Feature Removal Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should completely remove all feature sections when all features are disabled', async () => {
    // Mock the hook to return all features disabled
    (featureToggleHook.useFeatureToggle as jest.Mock).mockReturnValue({
      enableShop: false,
      enableTracking: false,
      enableSecondHandProducts: false,
      loading: false,
    });

    render(<ClientHomePage />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    // Verify that feature sections are completely removed from the DOM
    expect(screen.queryByTestId('featured-products-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('secondhand-products-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('track-ticket-cta')).not.toBeInTheDocument();

    // Verify that non-feature sections are still present
    expect(screen.getByTestId('enhanced-background')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('homepage-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('why-choose-us-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });

  test('should completely remove only the shop feature when disabled', async () => {
    // Mock the hook to return only shop feature disabled
    (featureToggleHook.useFeatureToggle as jest.Mock).mockReturnValue({
      enableShop: false,
      enableTracking: true,
      enableSecondHandProducts: true,
      loading: false,
    });

    render(<ClientHomePage />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    // Verify that only the shop feature section is removed
    expect(screen.queryByTestId('featured-products-section')).not.toBeInTheDocument();
    
    // Verify that other feature sections are still present
    expect(screen.getByTestId('secondhand-products-section')).toBeInTheDocument();
    expect(screen.getByTestId('track-ticket-cta')).toBeInTheDocument();

    // Verify that non-feature sections are still present
    expect(screen.getByTestId('enhanced-background')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('homepage-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('why-choose-us-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });

  test('should completely remove only the tracking feature when disabled', async () => {
    // Mock the hook to return only tracking feature disabled
    (featureToggleHook.useFeatureToggle as jest.Mock).mockReturnValue({
      enableShop: true,
      enableTracking: false,
      enableSecondHandProducts: true,
      loading: false,
    });

    render(<ClientHomePage />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    // Verify that only the tracking feature section is removed
    expect(screen.queryByTestId('track-ticket-cta')).not.toBeInTheDocument();
    
    // Verify that other feature sections are still present
    expect(screen.getByTestId('featured-products-section')).toBeInTheDocument();
    expect(screen.getByTestId('secondhand-products-section')).toBeInTheDocument();

    // Verify that non-feature sections are still present
    expect(screen.getByTestId('enhanced-background')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('homepage-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('why-choose-us-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });

  test('should completely remove only the secondhand feature when disabled', async () => {
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

    // Verify that only the secondhand feature section is removed
    expect(screen.queryByTestId('secondhand-products-section')).not.toBeInTheDocument();
    
    // Verify that other feature sections are still present
    expect(screen.getByTestId('featured-products-section')).toBeInTheDocument();
    expect(screen.getByTestId('track-ticket-cta')).toBeInTheDocument();

    // Verify that non-feature sections are still present
    expect(screen.getByTestId('enhanced-background')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('homepage-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('why-choose-us-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });

  test('should keep all feature sections when all features are enabled', async () => {
    // Mock the hook to return all features enabled
    (featureToggleHook.useFeatureToggle as jest.Mock).mockReturnValue({
      enableShop: true,
      enableTracking: true,
      enableSecondHandProducts: true,
      loading: false,
    });

    render(<ClientHomePage />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    // Verify that all feature sections are present
    expect(screen.getByTestId('featured-products-section')).toBeInTheDocument();
    expect(screen.getByTestId('secondhand-products-section')).toBeInTheDocument();
    expect(screen.getByTestId('track-ticket-cta')).toBeInTheDocument();

    // Verify that non-feature sections are still present
    expect(screen.getByTestId('enhanced-background')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('homepage-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('why-choose-us-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });
});