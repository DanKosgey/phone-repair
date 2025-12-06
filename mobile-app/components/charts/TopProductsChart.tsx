import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface TopProduct {
    name: string;
    total_revenue: number;
    total_quantity_sold: number;
}

interface TopProductsChartProps {
    data: TopProduct[];
    title?: string;
    width?: number;
    height?: number;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({
    data,
    title = 'Top Selling Products',
    width = Dimensions.get('window').width - Spacing.xl * 2,
    height = 250,
}) => {
    // Prepare data for the chart
    const chartData = {
        labels: data.map(item => item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name),
        datasets: [
            {
                data: data.map(item => item.total_revenue),
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>Best performing products by revenue</Text>
            
            {data.length > 0 ? (
                <RNBarChart
                    data={chartData}
                    width={width}
                    height={height}
                    yAxisLabel="KSh "
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundColor: Colors.light.surface,
                        backgroundGradientFrom: Colors.light.surface,
                        backgroundGradientTo: Colors.light.surface,
                        decimalPlaces: 0,
                        color: (opacity = 1) => Colors.light.primary,
                        labelColor: (opacity = 1) => Colors.light.textSecondary,
                        barPercentage: 0.7,
                        propsForBackgroundLines: {
                            strokeWidth: 0.5,
                            stroke: Colors.light.border,
                        }
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                    fromZero={true}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No product data available</Text>
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