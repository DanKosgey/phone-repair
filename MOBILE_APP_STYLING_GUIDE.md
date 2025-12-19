# Mobile App Styling Guide - Implementation Details

## Standard Header Pattern

All admin screens now follow this header pattern:

### Header Structure
```tsx
{/* Header with primary background */}
<View style={styles.header}>
    <Text style={styles.title}>Screen Title</Text>
    <Text style={styles.subtitle}>Screen Subtitle/Description</Text>
    {/* Optional: Action buttons or controls */}
</View>
```

### Header Styles
```typescript
header: {
    backgroundColor: Colors.light.primary,      // Blue background
    padding: Spacing.lg,                         // 24px padding
},
title: {
    ...Typography.h2,                           // 24px, 600 weight
    color: '#fff',                              // White text
    fontWeight: '700',
    marginBottom: Spacing.xs,                   // 4px bottom margin
},
subtitle: {
    ...Typography.body,                         // 16px, 400 weight
    color: 'rgba(255, 255, 255, 0.9)',         // Slightly transparent white
    marginBottom: Spacing.md,                   // 16px bottom margin
},
```

### Color Usage
- **Header Background**: Colors.light.primary (#3b82f6)
- **Text in Header**: #ffffff (white)
- **Subtitle Text**: rgba(255, 255, 255, 0.9)
- **Secondary Text**: Colors.light.textSecondary (#64748b)

## Responsive Grid Layouts

### Two-Column Layout (for metrics/actions)
```tsx
// Row layout
<View style={styles.actionItemRow}>
    <View style={[styles.actionItem, !isSmallScreen && { flex: 1, marginRight: Spacing.md }]}>
        {/* Card 1 */}
    </View>
    <View style={[styles.actionItem, !isSmallScreen && { flex: 1 }]}>
        {/* Card 2 */}
    </View>
</View>

// Styles
actionItemRow: {
    flexDirection: 'row',
    gap: Spacing.md,                    // 16px gap between items
    marginBottom: Spacing.md,
},
actionItem: {
    flex: 1,
},
```

### Container for Multiple Rows
```tsx
<View style={styles.quickActionsGrid}>
    <View style={styles.actionItemRow}>
        {/* Row 1 */}
    </View>
    <View style={styles.actionItemRow}>
        {/* Row 2 */}
    </View>
</View>

// Styles
quickActionsGrid: {
    marginTop: Spacing.md,
},
actionItemRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
},
```

## Button Styling Patterns

### Primary Action Button (in header)
```tsx
<TouchableOpacity 
    style={styles.addCustomerButton}
    onPress={handleAddCustomer}
>
    <Text style={styles.addCustomerText}>+ Add Customer</Text>
</TouchableOpacity>

// Styles
addCustomerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',  // Semi-transparent white
    paddingVertical: Spacing.sm,                   // 8px
    paddingHorizontal: Spacing.md,                 // 16px
    borderRadius: BorderRadius.md,                 // 8px
    alignSelf: 'flex-start',
},
addCustomerText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
},
```

### Secondary Button (view mode, filters)
```tsx
<TouchableOpacity 
    style={styles.viewModeButton}
    onPress={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
>
    <Text style={styles.viewModeText}>
        {viewMode === 'card' ? '📋 Table' : '🃏 Card'}
    </Text>
</TouchableOpacity>

// Styles
viewModeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',   // More transparent
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
},
viewModeText: {
    ...Typography.caption,                         // Smaller text
    color: '#fff',
    fontWeight: '600',
},
```

## Search Bar Pattern

### Search Component Structure
```tsx
<View style={styles.searchContainer}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
        style={styles.searchInput}
        placeholder="Search customers..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={Colors.light.textSecondary}
    />
    {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>✕</Text>
        </TouchableOpacity>
    )}
</View>

// Styles
searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
},
searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
},
searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
    paddingVertical: Spacing.sm,
},
clearButton: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    padding: Spacing.xs,
},
```

## Filter Tabs Pattern

### Filter Tab Navigation
```tsx
<View style={styles.filtersList}>
    {filters.map(filter => (
        <TouchableOpacity
            key={filter.id}
            style={[
                styles.filterTab,
                isSelected && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
        >
            <Text style={[
                styles.filterTabText,
                isSelected && styles.filterTabTextActive,
            ]}>
                {filter.label}
            </Text>
            <View style={[
                styles.filterBadge,
                isSelected && styles.filterBadgeActive,
            ]}>
                <Text style={[
                    styles.filterBadgeText,
                    isSelected && styles.filterBadgeTextActive,
                ]}>
                    {filterWithCount?.count || 0}
                </Text>
            </View>
        </TouchableOpacity>
    ))}
</View>

// Styles
filtersList: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
},
filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,              // Pill-shaped
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
},
filterTabActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
},
filterTabText: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
    marginRight: Spacing.xs,
},
filterTabTextActive: {
    color: '#fff',
},
filterBadge: {
    backgroundColor: Colors.light.border,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 24,
    alignItems: 'center',
},
filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
},
filterBadgeText: {
    ...Typography.caption,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 11,
},
filterBadgeTextActive: {
    color: '#fff',
},
```

## Card Component Pattern

### Standard Card Container
```tsx
<View style={styles.card}>
    <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Card Title</Text>
    </View>
    <View style={styles.cardContent}>
        {/* Content */}
    </View>
</View>

// Styles
card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.md,
},
cardHeader: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: Spacing.md,
},
cardTitle: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
},
cardContent: {
    padding: 0,
},
```

## Section Spacing Pattern

### Main Content Container
```tsx
<View style={styles.section}>
    <SectionHeader title="Overview Metrics" icon="📊" />
    {/* Section content */}
</View>

// Styles
section: {
    padding: Spacing.lg,                           // 24px padding
},
```

## Metric Cards Grid

### Two-Metric Row
```tsx
<View style={styles.metricRow}>
    <View style={[styles.metricItem, !isSmallScreen && { flex: 1, marginRight: Spacing.md }]}>
        <StatCard
            title="Tickets"
            value={stats.totalTickets}
            icon="🎫"
            color={Colors.light.primary}
            subtitle="+0% from last month"
        />
    </View>
    <View style={[styles.metricItem, !isSmallScreen && { flex: 1 }]}>
        <StatCard
            title="Customers"
            value={stats.totalCustomers}
            icon="👥"
            color={Colors.light.secondary}
            subtitle="+0% from last month"
        />
    </View>
</View>

// Styles
metricsContainer: {
    marginTop: Spacing.md,
},
metricRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
},
metricItem: {
    flex: 1,
},
```

## FAB (Floating Action Button) Pattern

### Floating Action Button
```tsx
<TouchableOpacity
    style={styles.fab}
    onPress={() => navigation.navigate('CreateTicket')}
    activeOpacity={0.8}
>
    <Text style={styles.fabIcon}>+</Text>
</TouchableOpacity>

// Styles
fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
},
fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
},
```

## Typography Hierarchy Usage

### Large Section Headers
```tsx
title: {
    ...Typography.h2,              // 24px, 600 weight
    color: '#fff',
    fontWeight: '700',
    marginBottom: Spacing.xs,
}
```

### Card Titles
```tsx
cardTitle: {
    ...Typography.body,            // 16px, 400 weight
    fontWeight: '600',
    color: Colors.light.text,
}
```

### Secondary Text
```tsx
subtitle: {
    ...Typography.body,            // 16px, 400 weight
    color: 'rgba(255, 255, 255, 0.9)',
}
```

### Small Text/Labels
```tsx
caption: {
    ...Typography.caption,         // 12px, 400 weight
    color: Colors.light.textSecondary,
}
```

## Spacing Reference

| Variable | Value | Usage |
|----------|-------|-------|
| `Spacing.xs` | 4px | Small gaps, thin padding |
| `Spacing.sm` | 8px | Button padding, minimal spacing |
| `Spacing.md` | 16px | Standard card padding, medium gaps |
| `Spacing.lg` | 24px | Section padding, large spacing |
| `Spacing.xl` | 32px | Major sections |
| `Spacing.xxl` | 48px | Bottom spacing, large gaps |

## Border Radius Reference

| Variable | Value | Usage |
|----------|-------|-------|
| `BorderRadius.sm` | 4px | Small UI elements |
| `BorderRadius.md` | 8px | Buttons, inputs |
| `BorderRadius.lg` | 12px | Cards, larger containers |
| `BorderRadius.xl` | 16px | Large containers |
| `BorderRadius.full` | 9999 | Circular/pill shapes |

## Common Color Patterns

### Active/Inactive States
```typescript
// Active button
backgroundColor: Colors.light.primary

// Inactive button  
backgroundColor: Colors.light.background
borderColor: Colors.light.border

// Hover/Pressed (use opacity)
opacity: 0.8
```

### Text Hierarchy
```typescript
// Primary text
color: Colors.light.text

// Secondary text
color: Colors.light.textSecondary

// In white backgrounds (header)
color: '#fff'
```

### Backgrounds
```typescript
// Main background
backgroundColor: Colors.light.background

// Card background
backgroundColor: Colors.light.surface
```

## Example: Complete Screen Header

```tsx
// Full header implementation
<View style={styles.header}>
    <Text style={styles.title}>Admin Dashboard</Text>
    <Text style={styles.subtitle}>Monitor and manage your shop operations</Text>
    <View style={styles.headerControls}>
        <View style={styles.headerTopRow}>
            <Text style={styles.lastUpdated}>
                Last refreshed: {lastRefreshed?.toLocaleTimeString() || 'Never'}
            </Text>
            <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleManualRefresh}
                disabled={refreshing}
            >
                {refreshing ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.refreshButtonText}>Refresh Data</Text>
                )}
            </TouchableOpacity>
        </View>
        <View style={styles.timeframeSelector}>
            <Text style={styles.timeframeLabel}>Timeframe:</Text>
            <View style={styles.timeframeButtons}>
                {(['daily', 'weekly', 'monthly'] as Timeframe[]).map((tf) => (
                    <TouchableOpacity
                        key={tf}
                        style={[
                            styles.timeframeButton,
                            timeframe === tf && styles.activeTimeframeButton
                        ]}
                        onPress={() => handleTimeframeChange(tf)}
                    >
                        <Text>{tf.charAt(0).toUpperCase() + tf.slice(1)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    </View>
</View>
```

## Testing Consistency

### Things to verify:
- [ ] All headers use primary color background
- [ ] All headers have consistent title styling
- [ ] All buttons use consistent sizing
- [ ] Spacing between elements is consistent
- [ ] Colors match the theme system
- [ ] Text hierarchy is maintained
- [ ] Cards have consistent padding and borders
- [ ] Search bars follow the same pattern
- [ ] Filter tabs are styled consistently
- [ ] FABs (if used) are positioned consistently

## Notes for Future Updates

1. When adding new screens, use this header pattern
2. For cards, follow the established structure
3. Always use theme constants instead of hardcoded values
4. Test responsive layouts on different screen sizes
5. Maintain consistent spacing using Spacing constants
6. Use Typography constants for text styling
7. Apply Colors from the theme system

This guide ensures all new screens maintain consistency with the updated design system.
