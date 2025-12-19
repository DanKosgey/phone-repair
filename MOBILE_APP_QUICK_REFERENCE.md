# Mobile App Quick Style Reference

## Quick Copy-Paste Patterns

### Standard Header (All Screens)
```tsx
<View style={styles.header}>
    <Text style={styles.title}>Your Screen Title</Text>
    <Text style={styles.subtitle}>Your screen description</Text>
</View>

// Add to styles:
header: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.lg,
},
title: {
    ...Typography.h2,
    color: '#fff',
    fontWeight: '700',
    marginBottom: Spacing.xs,
},
subtitle: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
},
```

### Header with Action Button
```tsx
<View style={styles.header}>
    <Text style={styles.title}>Your Title</Text>
    <Text style={styles.subtitle}>Your subtitle</Text>
    <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleAction}
    >
        <Text style={styles.actionButtonText}>+ Action</Text>
    </TouchableOpacity>
</View>

// Add to styles:
actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
},
actionButtonText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
},
```

### Two-Column Grid
```tsx
<View style={styles.gridContainer}>
    <View style={styles.gridRow}>
        <View style={[styles.gridItem, !isSmallScreen && { flex: 1, marginRight: Spacing.md }]}>
            <Card title="Item 1" />
        </View>
        <View style={[styles.gridItem, !isSmallScreen && { flex: 1 }]}>
            <Card title="Item 2" />
        </View>
    </View>
</View>

// Add to styles:
gridContainer: {
    padding: Spacing.lg,
},
gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
},
gridItem: {
    flex: 1,
},
```

### Search Bar
```tsx
<View style={styles.searchContainer}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={Colors.light.textSecondary}
    />
    {searchQuery && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
    )}
</View>

// Add to styles:
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
clearIcon: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    padding: Spacing.xs,
},
```

### Filter Tabs
```tsx
<View style={styles.tabsContainer}>
    {filters.map((filter) => (
        <TouchableOpacity
            key={filter.id}
            style={[
                styles.tab,
                selectedFilter === filter.id && styles.tabActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
        >
            <Text style={[
                styles.tabText,
                selectedFilter === filter.id && styles.tabTextActive
            ]}>
                {filter.label} ({filter.count})
            </Text>
        </TouchableOpacity>
    ))}
</View>

// Add to styles:
tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
},
tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
},
tabActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
},
tabText: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
},
tabTextActive: {
    color: '#fff',
},
```

### Card Container
```tsx
<View style={styles.card}>
    <Text style={styles.cardTitle}>Card Title</Text>
    <View style={styles.cardContent}>
        {/* Content goes here */}
    </View>
</View>

// Add to styles:
card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.md,
},
cardTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
},
cardContent: {
    // Content styling
},
```

### FAB (Floating Action Button)
```tsx
<TouchableOpacity
    style={styles.fab}
    onPress={handleAction}
    activeOpacity={0.8}
>
    <Text style={styles.fabIcon}>+</Text>
</TouchableOpacity>

// Add to styles:
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

## Color Quick Reference

```typescript
// Use these colors:
Colors.light.primary        // #3b82f6 - Main blue (headers, buttons)
Colors.light.secondary      // #8b5cf6 - Purple (accents)
Colors.light.background     // #ffffff - White (main background)
Colors.light.surface        // #f8fafc - Light gray (cards)
Colors.light.text           // #0f172a - Dark blue (text)
Colors.light.textSecondary  // #64748b - Medium gray (secondary text)
Colors.light.border         // #e2e8f0 - Light gray (borders)
Colors.light.success        // #10b981 - Green
Colors.light.warning        // #f59e0b - Amber
Colors.light.error          // #ef4444 - Red
Colors.light.info           // #3b82f6 - Blue
```

## Spacing Quick Reference

```typescript
Spacing.xs   // 4px  - Tiny gaps
Spacing.sm   // 8px  - Small padding
Spacing.md   // 16px - Standard padding
Spacing.lg   // 24px - Section padding
Spacing.xl   // 32px - Large gaps
Spacing.xxl  // 48px - Extra large spacing
```

## Typography Quick Reference

```typescript
// Use these from Typography:
Typography.h1       // 32px, 700 weight - Page titles
Typography.h2       // 24px, 600 weight - Section titles (HEADERS)
Typography.h3       // 20px, 600 weight - Subsections
Typography.body     // 16px, 400 weight - Normal text (COMMON)
Typography.bodySmall // 14px, 400 weight - Small text
Typography.caption  // 12px, 400 weight - Tiny text

// Usage:
title: {
    ...Typography.h2,
    color: '#fff',
}

text: {
    ...Typography.body,
    color: Colors.light.text,
}

small: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
}
```

## Responsive Sizing

```typescript
// Check screen size:
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 350;
const isLargeScreen = SCREEN_WIDTH > 768;

// Use in styles:
style={[
    styles.item,
    !isSmallScreen && { flex: 1, marginRight: Spacing.md }
]}
```

## Quick Checklist for New Screens

- [ ] Import theme constants
- [ ] Add header with primary color background
- [ ] Use Typography.h2 for title
- [ ] Use Typography.body for subtitle
- [ ] Add white text color to header
- [ ] Use Spacing constants (not hardcoded numbers)
- [ ] Use Colors constants (not hex codes)
- [ ] Add border radius to cards
- [ ] Add 1px border to cards
- [ ] Test on small and large screens
- [ ] Ensure buttons are touchable (min 44pt)
- [ ] Use consistent padding (Spacing.md)

## Header Colors

```typescript
// All headers use:
backgroundColor: Colors.light.primary,  // Blue
color: '#fff',                          // White text
// Subtitle slightly transparent:
color: 'rgba(255, 255, 255, 0.9)',
```

## Button Types

```typescript
// Primary Action (in headers):
backgroundColor: 'rgba(255, 255, 255, 0.25)'
color: '#fff'

// Secondary Action:
backgroundColor: Colors.light.background
borderWidth: 1
borderColor: Colors.light.border
color: Colors.light.text

// Active/Selected:
backgroundColor: Colors.light.primary
borderColor: Colors.light.primary
color: '#fff'
```

## Common Mistakes to Avoid

❌ Don't hardcode colors (use Colors.light.*)
❌ Don't hardcode spacing (use Spacing.*)
❌ Don't forget to import theme constants
❌ Don't use different header styles
❌ Don't forget marginBottom on cards
❌ Don't forget borderRadius on containers
❌ Don't use white text on light backgrounds
❌ Don't forget to test on small screens

✅ Always use theme system
✅ Always match header pattern
✅ Always test responsive layout
✅ Always use proper spacing
✅ Always ensure good contrast
✅ Always make buttons touchable
✅ Always add borders to cards
✅ Always use consistent colors

## File Locations

**Theme Constants**: `/mobile-app/constants/theme.ts`
**Reusable Components**: `/mobile-app/components/`
**Screen Components**: `/mobile-app/screens/` and `/mobile-app/screens/admin/`

## Need to Add a New Admin Screen?

1. Copy this header template:
```tsx
const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.light.primary,
        padding: Spacing.lg,
    },
    title: {
        ...Typography.h2,
        color: '#fff',
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
    },
});
```

2. Add to your screen JSX:
```tsx
<View style={styles.header}>
    <Text style={styles.title}>Your Title</Text>
    <Text style={styles.subtitle}>Your Subtitle</Text>
</View>
```

3. Follow the patterns above for other components
4. Test on small and large screens
5. Done!

---

**Last Updated**: December 8, 2025
**Mobile App Version**: Current
**Design System**: Aligned with Web App v1.0
