import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface LineChartProps {
    data: number[];
    labels: string[];
    title?: string;
    width?: number;
    height?: number;
    yAxisLabel?: string;
    yAxisSuffix?: string;
    color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
    data,
    labels,
    title,
    width = Dimensions.get('window').width - Spacing.xl * 2,
    height = 220,
    yAxisLabel = '',
    yAxisSuffix = '',
    color = Colors.light.primary,
}) => {
    // Ensure we have valid data/labels alignment and filter out invalid values
    const validData = data.filter(value => 
        typeof value === 'number' && 
        !isNaN(value) && 
        isFinite(value)
    );
    
    const validLabels = labels.slice(0, validData.length);

    const chartData = {
        labels: validLabels,
        datasets: [
            {
                data: validData,
                color: (opacity = 1) => color,
                strokeWidth: 2,
            },
        ],
    };

    // Don't render chart if no valid data
    if (validData.length === 0) {
        return (
            <View style={styles.container}>
                {title && <Text style={styles.title}>{title}</Text>}
                <View style={[styles.chart, { width, height, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={styles.noDataText}>No data available</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <RNLineChart
                data={chartData}
                width={width}
                height={height}
                yAxisLabel={yAxisLabel}
                yAxisSuffix={yAxisSuffix}
                chartConfig={{
                    backgroundColor: Colors.light.surface,
                    backgroundGradientFrom: Colors.light.surface,
                    backgroundGradientTo: Colors.light.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => color,
                    labelColor: (opacity = 1) => Colors.light.textSecondary,
                    style: {
                        borderRadius: BorderRadius.md,
                    },
                    propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: color,
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    title: {
        ...Typography.h3,
        color: Colors.light.text,
        marginBottom: Spacing.md,
        alignSelf: 'flex-start',
    },
    chart: {
        marginVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
    },
    noDataText: {
        ...Typography.body,
        color: Colors.light.textSecondary,
    },
});