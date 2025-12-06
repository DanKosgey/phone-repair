# Mobile App UI/UX Consistency Guide

This document outlines the UI/UX patterns and design principles to ensure consistency across all screens in the mobile app, aligning with the web app's design language.

## Color Palette

### Primary Colors
- Primary: `#4f46e5` (Indigo)
- Primary Dark: `#4338ca` (Dark Indigo)
- Secondary: `#10b981` (Emerald)
- Background: `#f8fafc` (Light Gray)
- Surface: `#ffffff` (White)
- Text: `#1e293b` (Slate 900)
- Text Secondary: `#64748b` (Slate 500)
- Border: `#e2e8f0` (Slate 200)

### Status Colors
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Info: `#3b82f6` (Blue)

## Typography

### Font Sizes
- H1: 24px, Semi Bold
- H2: 20px, Semi Bold
- H3: 18px, Semi Bold
- Body: 16px, Regular
- Body Small: 14px, Regular
- Caption: 12px, Regular

### Font Weights
- Regular: 400
- Semi Bold: 600
- Bold: 700

## Spacing System

### Standard Spacing Values
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

## Border Radius

### Standard Radius Values
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 999px

## Component Patterns

### Headers
- Background: Primary color
- Text Color: White
- Padding: lg (16px)
- Title: H2, White, Bold
- Subtitle: Body, White/Secondary, Regular

### Cards
- Background: Surface
- Border: 1px solid Border
- Border Radius: lg (12px)
- Padding: md (12px) to lg (16px)
- Shadow: Subtle (elevation 2)

### Buttons
#### Primary Button
- Background: Primary
- Text Color: White
- Border Radius: md (8px)
- Padding: Vertical md (12px), Horizontal lg (16px)
- Font Weight: Semi Bold

#### Secondary Button
- Background: Surface
- Border: 1px solid Border
- Text Color: Primary
- Border Radius: md (8px)
- Padding: Vertical md (12px), Horizontal lg (16px)
- Font Weight: Semi Bold

#### Icon Button
- Width/Height: 48px
- Background: Primary
- Border Radius: full (circle)
- Icon Size: 24px
- Color: White

### Input Fields
- Height: 48px
- Background: Surface
- Border: 1px solid Border
- Border Radius: md (8px)
- Padding: Horizontal lg (16px)
- Font Size: Body (16px)

### Lists
- Background: Surface
- Border Radius: lg (12px)
- Item Divider: Border color
- Item Padding: md (12px)

## Screen Layout Patterns

### Standard Screen Layout
1. Header (if applicable)
2. Content Area with padding: lg (16px)
3. Bottom Spacing: xl (24px)

### Form Screens
1. Header
2. Form Container with padding: lg (16px)
3. Input Groups with margin bottom: lg (16px)
4. Action Button
5. Secondary Actions (if any)

### Dashboard Screens
1. Header
2. Stats/Metrics Section
3. Quick Actions Section
4. Content Sections with SectionHeader
5. Bottom Spacing

## Navigation Patterns

### Tab Navigation
- Active Tint Color: Primary
- Inactive Tint Color: Text Secondary
- Background: Surface
- Border Top: 1px solid Border

### Stack Navigation
- Header Background: Primary
- Header Text Color: White
- Header Title Style: Semi Bold

## Feedback Patterns

### Loading States
- Activity Indicator Color: Primary
- Size: Large
- Centered in container

### Empty States
- Icon Size: 48px
- Title: H3, Text
- Subtitle: Body Small, Text Secondary
- Action Button (if applicable): Primary

### Error States
- Background: Error with 20% opacity
- Text Color: Error
- Padding: md (12px)
- Border Radius: md (8px)

## Icons and Emojis

### Standard Icons
- Size: 24px for regular icons
- Size: 48px for large icons
- Color: Primary for primary actions
- Color: Text Secondary for secondary actions

### Emojis
- Size: 24px for regular emojis
- Size: 30px for action emojis
- Size: 48px for large emojis

## Animations and Transitions

### Standard Animations
- Entry Animations: Fade in with slight slide up
- Button Press: Scale down 5%
- Card Hover (web): Subtle shadow increase

### Refresh Control
- Color: Primary
- Size: Default

## Accessibility

### Contrast Ratios
- Text on Primary: Minimum 4.5:1
- Text on Background: Minimum 4.5:1
- Text on Surface: Minimum 4.5:1

### Touch Targets
- Minimum Size: 48px x 48px
- Spacing Between Targets: Minimum 8px

## Responsive Design

### Orientation Handling
- Portrait: Standard layout
- Landscape: Adjust grid layouts to accommodate wider screen

### Screen Size Adaptation
- Small Screens (< 360px): Reduce padding slightly
- Large Screens (> 768px): Increase touch targets appropriately

## Implementation Guidelines

### Consistent Imports
```typescript
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
```

### StyleSheet Organization
1. Container Styles
2. Header/Title Styles
3. Content Styles
4. Component-Specific Styles
5. Utility Styles

### Reusable Components
- Create components for repeated patterns
- Use props for customization
- Maintain consistent styling through theme constants