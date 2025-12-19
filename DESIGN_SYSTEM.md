# Jay's Shop Design System

## Color Palette

### Primary Colors
- **Primary**: `hsl(195, 100%, 50%)` - Vibrant cyan-blue
- **Primary Foreground**: `hsl(0, 0%, 100%)` - White

### Secondary Colors
- **Secondary**: `hsl(210, 40%, 97%)` - Very light blue-gray
- **Secondary Foreground**: `hsl(222.2, 47.4%, 8%)` - Dark gray

### Background & Surface Colors
- **Background**: `hsl(0, 0%, 99%)` - Almost white
- **Foreground**: `hsl(222.2, 84%, 2%)` - Very dark gray
- **Card**: `hsl(0, 0%, 100%)` - Pure white
- **Card Foreground**: `hsl(222.2, 84%, 2%)` - Very dark gray

### Status Colors
- **Success**: `hsl(142, 76%, 27%)` - Green
- **Warning**: `hsl(48, 96%, 43%)` - Yellow
- **Error**: `hsl(0, 84%, 50%)` - Red
- **Info**: `hsl(195, 100%, 50%)` - Same as primary

### State Colors
- **Muted**: `hsl(210, 40%, 97%)` - Very light blue-gray
- **Muted Foreground**: `hsl(215.4, 16.3%, 35%)` - Medium gray
- **Accent**: `hsl(210, 40%, 97%)` - Very light blue-gray
- **Accent Foreground**: `hsl(222.2, 47.4%, 8%)` - Dark gray
- **Destructive**: `hsl(0, 84.2%, 45%)` - Red
- **Destructive Foreground**: `hsl(0, 0%, 100%)` - White

### Border & Outline Colors
- **Border**: `hsl(214.3, 31.8%, 92%)` - Light gray
- **Input**: `hsl(214.3, 31.8%, 92%)` - Light gray
- **Ring**: `hsl(195, 100%, 50%)` - Same as primary

## Typography

### Font Family
- **Primary**: Inter, system UI fonts

### Font Sizes
- **H1**: 2.25rem (36px) on desktop, 1.875rem (30px) on mobile
- **H2**: 1.875rem (30px) on desktop, 1.5rem (24px) on mobile
- **H3**: 1.5rem (24px) on desktop, 1.25rem (20px) on mobile
- **H4**: 1.25rem (20px) on desktop, 1.125rem (18px) on mobile
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

## Spacing

### Base Unit
- **Base**: 0.25rem (4px)

### Common Spacing Values
- **XXS**: 0.25rem (4px)
- **XS**: 0.5rem (8px)
- **SM**: 0.75rem (12px)
- **MD**: 1rem (16px)
- **LG**: 1.5rem (24px)
- **XL**: 2rem (32px)
- **XXL**: 3rem (48px)
- **XXXL**: 4rem (64px)

## Borders & Radius

### Border Radius
- **SM**: 0.375rem (6px)
- **MD**: 0.5rem (8px)
- **LG**: 0.75rem (12px)
- **XL**: 1rem (16px)
- **Full**: 9999px

### Border Width
- **Default**: 1px
- **Thick**: 2px

## Shadows

### Shadow Levels
- **SM**: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- **MD**: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
- **LG**: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
- **XL**: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
- **Inner**: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)

## Components

### Buttons
- **Padding**: SM vertical, MD horizontal for default size
- **Border Radius**: LG
- **Transition**: All properties 300ms ease
- **Shadow**: MD by default, XL on hover

### Cards
- **Padding**: LG
- **Border Radius**: LG
- **Shadow**: SM by default, MD on hover
- **Border**: 1px solid Border color

### Inputs
- **Padding**: MD
- **Border Radius**: MD
- **Border**: 1px solid Input color
- **Focus State**: 2px solid Ring color with offset

## Animation

### Durations
- **Fast**: 150ms
- **Normal**: 300ms
- **Slow**: 500ms

### Easings
- **Standard**: ease-in-out
- **Entrance**: ease-out
- **Exit**: ease-in

## Responsive Breakpoints

- **SM**: 640px
- **MD**: 768px
- **LG**: 1024px
- **XL**: 1280px
- **2XL**: 1536px