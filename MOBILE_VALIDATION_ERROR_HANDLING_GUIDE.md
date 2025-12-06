# Mobile App Validation and Error Handling Consistency Guide

This document outlines the validation and error handling patterns to ensure consistency across all forms and data entry screens in the mobile app.

## Validation Principles

### 1. Client-Side Validation
- Validate all required fields before submission
- Provide immediate feedback for invalid inputs
- Use appropriate keyboard types for different input types
- Implement real-time validation where appropriate

### 2. Server-Side Validation
- Always validate data on the server
- Handle server errors gracefully
- Display meaningful error messages to users

## Validation Patterns

### Required Field Validation
```typescript
// Check if required fields are filled
if (!fieldName.trim()) {
    Alert.alert('Error', 'Field name is required');
    return false;
}
```

### Email Validation
```typescript
// Basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (email && !emailRegex.test(email)) {
    Alert.alert('Error', 'Please enter a valid email address');
    return false;
}
```

### Phone Number Validation
```typescript
// Basic phone number validation
const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
if (phone && !phoneRegex.test(phone)) {
    Alert.alert('Error', 'Please enter a valid phone number');
    return false;
}
```

### Password Validation
```typescript
// Password validation
if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters');
    return false;
}

// Password confirmation
if (password !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match');
    return false;
}
```

### Numeric Validation
```typescript
// Numeric validation
if (isNaN(parseFloat(value))) {
    Alert.alert('Error', 'Please enter a valid number');
    return false;
}
```

## Error Handling Patterns

### Form Submission Errors
```typescript
try {
    setLoading(true);
    // Perform operation
    const { data, error } = await supabase.operation();
    
    if (error) throw error;
    
    // Success handling
    Alert.alert('Success', 'Operation completed successfully');
} catch (error: any) {
    console.error('Operation failed:', error);
    Alert.alert('Error', error.message || 'An unexpected error occurred');
} finally {
    setLoading(false);
}
```

### Confirmation Dialogs
```typescript
Alert.alert(
    'Confirm Action',
    'Are you sure you want to perform this action?',
    [
        { text: 'Cancel', style: 'cancel' },
        {
            text: 'Confirm',
            style: 'destructive',
            onPress: async () => {
                // Perform action
            }
        }
    ]
);
```

## Input Field Best Practices

### Text Input Configuration
```jsx
<TextInput
    style={styles.input}
    placeholder="Enter value"
    value={value}
    onChangeText={setValue}
    keyboardType="default" // or "email-address", "numeric", "phone-pad"
    autoCapitalize="none" // or "words", "sentences"
    autoComplete="off" // or specific autocomplete types
    secureTextEntry={false} // for passwords
/>
```

### Multiline Text Inputs
```jsx
<TextInput
    style={[styles.input, styles.textArea]}
    placeholder="Enter description"
    value={value}
    onChangeText={setValue}
    multiline
    numberOfLines={4}
    textAlignVertical="top"
/>
```

## Loading States

### Button Loading State
```jsx
<TouchableOpacity
    style={[styles.button, loading && styles.buttonDisabled]}
    onPress={handleSubmit}
    disabled={loading}
>
    {loading ? (
        <ActivityIndicator color="#fff" />
    ) : (
        <Text style={styles.buttonText}>Submit</Text>
    )}
</TouchableOpacity>
```

### Full Screen Loading
```jsx
if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
    );
}
```

## Success Feedback

### Success Alerts
```typescript
Alert.alert(
    'Success',
    'Operation completed successfully!',
    [{ text: 'OK', onPress: () => navigation.goBack() }]
);
```

### Success with Multiple Options
```typescript
Alert.alert(
    'Success',
    `Ticket #${ticketNumber} created successfully!`,
    [
        {
            text: 'View Ticket',
            onPress: () => navigation.replace('TicketDetail', { id: ticketId }),
        },
        {
            text: 'Create Another',
            onPress: () => {
                // Reset form
            },
        },
    ]
);
```

## Specific Validation Rules

### Customer Forms
- Name: Required, minimum 2 characters
- Email: Optional but must be valid if provided
- Phone: Optional but must be valid if provided

### Product Forms
- Name: Required
- Price: Required, numeric, positive
- Stock: Optional, numeric, non-negative
- Description: Optional

### Ticket Forms
- Customer: Required (selected from search)
- Device Type: Required
- Device Brand: Required
- Device Model: Required
- Issue Description: Required
- Estimated Cost: Optional, numeric
- Priority: Optional, defaults to "medium"

### Authentication Forms
- Email: Required, valid email format
- Password: Required, minimum 6 characters
- Full Name: Required for registration

## Error Message Guidelines

### Clarity
- Use clear, concise language
- Explain what went wrong and how to fix it
- Avoid technical jargon

### Consistency
- Use the same terminology throughout the app
- Maintain consistent capitalization and punctuation
- Use imperative mood ("Enter a valid email" not "Invalid email")

### Examples
- ✅ "Please enter a valid email address"
- ✅ "Password must be at least 6 characters"
- ✅ "Passwords do not match"
- ❌ "Invalid input"
- ❌ "Error occurred"

## Accessibility Considerations

### Visual Feedback
- Use appropriate colors for error states
- Ensure sufficient contrast ratios
- Provide visual indicators in addition to text

### Screen Reader Support
- Use appropriate accessibility labels
- Ensure form fields are properly labeled
- Provide meaningful error announcements

## Implementation Checklist

### For Each Form Screen:
1. [ ] Validate all required fields
2. [ ] Implement appropriate input types and keyboards
3. [ ] Add real-time validation where beneficial
4. [ ] Handle server errors gracefully
5. [ ] Show loading states during submissions
6. [ ] Provide clear success feedback
7. [ ] Test edge cases and error scenarios
8. [ ] Ensure accessibility compliance
9. [ ] Maintain consistent styling with UI guide
10. [ ] Follow platform-specific conventions

This guide ensures a consistent, user-friendly experience across all forms and data entry points in the mobile application.