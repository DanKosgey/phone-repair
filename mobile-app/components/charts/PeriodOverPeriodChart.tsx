import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface PeriodData {
    period: string;
    current_period_tickets: number;
    previous_period_tickets: number;
    current_period_revenue: number;
    previous_period_revenue: number;
    ticket_growth_rate: number;
    revenue_growth_rate: number;
}

interface PeriodOverPeriodChartProps {
    data: PeriodData[];
    title?: string;
    width?: number;
    height?: number;
}

export const PeriodOverPeriodChart: React.FC<PeriodOverPeriodChartProps> = ({
    data,
    title = 'Period-over-Period Comparison',
    width = Dimensions.get('window').width - Spacing.xl * 2,
    height = 250,
}) => {
    // Prepare data for the chart
    const chartData = {
        labels: data.map(item => item.period),
        datasets: [
            {
                data: data.map(item => item.ticket_growth_rate),
                color: (opacity = 1) => `rgba(0, 196, 159, ${opacity})`, // Teal color for tickets
            },
            {
                data: data.map(item => item.revenue_growth_rate),
                color: (opacity = 1) => `rgba(255, 187, 40, ${opacity})`, // Yellow color for revenue
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>Ticket and revenue growth compared to previous period</Text>
            
            {data.length > 0 ? (
                <RNBarChart
                    data={chartData}
                    width={width}
                    height={height}
                    chartConfig={{
                        backgroundColor: Colors.light.surface,
                        backgroundGradientFrom: Colors.light.surface,
                        backgroundGradientTo: Colors.light.surface,
                        decimalPlaces: 2,
                        color: (opacity = 1) => Colors.light.text,
                        labelColor: (opacity = 1) => Colors.light.textSecondary,
                        barPercentage: 0.7,
                        propsForBackgroundLines: {
                            strokeWidth: 0.5,
                            stroke: Colors.light.border,
                        }
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                    fromZero={false}
                    yAxisLabel=""
                    yAxisSuffix="%"
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No period-over-period data available</Text>
                </View>
            )}
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
});