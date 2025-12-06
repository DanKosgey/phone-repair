import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const AdvancedForecastingMethods: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Advanced Forecasting Methods</Text>
            <Text style={styles.description}>Comparison of different forecasting approaches</Text>
            
            <View style={styles.content}>
                <Ionicons 
                    name="construct-outline" 
                    size={48} 
                    color={Colors.light.textSecondary} 
                />
                <Text style={styles.heading}>Advanced forecasting methods visualization</Text>
                <Text style={styles.subheading}>Coming soon</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    title: {
        ...Typography.h3,
        color: Colors.light.text,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    description: {
        ...Typography.body,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.md,
    },
    content: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginBottom: Spacing.md,
    },
    heading: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    subheading: {
        ...Typography.body,
        color: Colors.light.textSecondary,
    },
});