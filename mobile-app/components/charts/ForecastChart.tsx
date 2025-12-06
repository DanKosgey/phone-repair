import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface ForecastData {
    period: string;
    predicted_tickets: number;
    predicted_revenue: number;
    ticket_confidence_lower: number;
    ticket_confidence_upper: number;
    revenue_confidence_lower: number;
    revenue_confidence_upper: number;
}

interface ForecastChartProps {
    data: ForecastData[];
    title?: string;
    width?: number;
    height?: number;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
    data,
    title = 'Forecast Analysis',
    width = Dimensions.get('window').width - Spacing.xl * 2,
    height = 250,
}) => {
    // Prepare data for the chart
    const chartData = {
        labels: data.map(item => item.period),
        datasets: [
            {
                data: data.map(item => item.predicted_tickets),
                color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`, // Purple color for tickets
                strokeWidth: 2,
            },
            {
                data: data.map(item => item.predicted_revenue),
                color: (opacity = 1) => `rgba(130, 202, 157, ${opacity})`, // Green color for revenue
                strokeWidth: 2,
            },
            {
                data: data.map(item => item.ticket_confidence_lower),
                color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`, // Purple color for lower bound
                strokeWidth: 1,
                dashedLine: [6, 6],
            },
            {
                data: data.map(item => item.ticket_confidence_upper),
                color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`, // Purple color for upper bound
                strokeWidth: 1,
                dashedLine: [6, 6],
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>Predicted ticket volumes and revenue</Text>
            
            {data.length > 0 ? (
                <RNLineChart
                    data={chartData}
                    width={width}
                    height={height}
                    chartConfig={{
                        backgroundColor: Colors.light.surface,
                        backgroundGradientFrom: Colors.light.surface,
                        backgroundGradientTo: Colors.light.surface,
                        decimalPlaces: 0,
                        color: (opacity = 1) => Colors.light.text,
                        labelColor: (opacity = 1) => Colors.light.textSecondary,
                        propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                        },
                        propsForBackgroundLines: {
                            strokeDasharray: '', // solid lines
                            stroke: Colors.light.border,
                            strokeWidth: 0.5,
                        }
                    }}
                    bezier
                    style={styles.chart}
                    withInnerLines={true}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No forecast data available</Text>
                </View>
            )}
            
            <Text style={styles.confidenceText}>
                Forecast Accuracy: 95% Confidence Interval
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
    chart: {
        marginVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
    },
    emptyState: {
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.light.textSecondary,
    },
    confidenceText: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
});