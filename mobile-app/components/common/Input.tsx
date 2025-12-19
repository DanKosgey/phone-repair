import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    icon?: React.ReactNode;
    required?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    autoCorrect = false,
    multiline = false,
    numberOfLines = 1,
    icon,
    required = false,
    accessibilityLabel,
    accessibilityHint,
}) => {
    return (
        <View style={styles.container}>
            {label && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.label}>
                        {label}
                    </Text>
                    {required && <Text style={styles.required}>*</Text>}
                </View>
            )}
            
            <View style={[styles.inputContainer, error && styles.errorBorder]}>
                {icon && <View style={styles.icon}>{icon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        icon ? styles.inputWithIcon : {},
                        multiline && styles.multilineInput
                    ]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    placeholderTextColor={Colors.light.textTertiary}
                    accessibilityLabel={accessibilityLabel || label}
                    accessibilityHint={accessibilityHint}
                    accessibilityRole="text"
                    accessibilityState={{ disabled: false, selected: false }}
                />
            </View>
            
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        ...Typography.labelLarge,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    required: {
        color: Colors.light.error,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    errorBorder: {
        borderColor: Colors.light.error,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        ...Typography.bodyLarge,
        color: Colors.light.text,
        paddingVertical: 0,
    },
    inputWithIcon: {
        paddingLeft: Spacing.sm,
    },
    multilineInput: {
        textAlignVertical: 'top',
    },
    errorText: {
        ...Typography.caption,
        color: Colors.light.error,
        marginTop: Spacing.xs,
    },
});