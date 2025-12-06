import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface TicketVolumeAnalysisProps {
    trendDirection: 'up' | 'down' | 'stable';
    volatility: string;
    standardDeviation: string;
    coefficientOfVariation: string;
    correlation: string;
    slope: number;
    intercept: number;
    dataPoints: number;
}

export const TicketVolumeAnalysis: React.FC<TicketVolumeAnalysisProps> = ({
    trendDirection,
    volatility,
    standardDeviation,
    coefficientOfVariation,
    correlation,
    slope,
    intercept,
    dataPoints,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ticket Volume Analysis</Text>
            <Text style={styles.description}>Statistical analysis of ticket volume trends with enhanced moving averages</Text>
            
            <View style={styles.grid}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Trend</Text>
                    <View style={styles.trendContainer}>
                        <Text style={styles.trendEmoji}>
                            {trendDirection === 'up' ? '↗️' : trendDirection === 'down' ? '↘️' : '➡️'}
                        </Text>
                        <Text style={styles.trendText}>{trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}</Text>
                    </View>
                </View>
                
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Volatility</Text>
                    <Text style={styles.statValue}>{volatility}</Text>
                    <Text style={styles.statSubLabel}>Standard Deviation</Text>
                </View>
                
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Coefficient of Variation</Text>
                    <Text style={styles.statValue}>{coefficientOfVariation}%</Text>
                    <Text style={styles.statSubLabel}>Volatility Relative to Mean</Text>
                </View>
                
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Tickets vs Revenue Correlation</Text>
                    <Text style={styles.statValue}>{correlation}</Text>
                </View>
            </View>
            
            <View style={styles.regressionCard}>
                <Text style={styles.statLabel}>Regression Analysis</Text>
                <Text style={styles.statValue}>Slope: {slope.toFixed(4)}</Text>
                <Text style={styles.regressionSubLabel}>Y-axis Intercept: {intercept.toFixed(2)}</Text>
                <Text style={styles.statSubLabel}>Ticket Trend Slope</Text>
            </View>
            
            <Text style={styles.dataPoints}>
                Data Points: {dataPoints} | Time Periods Analyzed
            </Text>
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statCard: {
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        width: '48%',
        minHeight: 80,
        justifyContent: 'center',
    },
    statLabel: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
    },
    statValue: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    statSubLabel: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    trendEmoji: {
        fontSize: 16,
    },
    trendText: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.light.text,
    },
    regressionCard: {
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        marginBottom: Spacing.md,
    },
    regressionSubLabel: {
        ...Typography.body,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
    },
    dataPoints: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
});