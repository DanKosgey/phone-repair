import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface BarChartProps {
    data: number[];
    labels: string[];
    title?: string;
    width?: number;
    height?: number;
    yAxisLabel?: string;
    yAxisSuffix?: string;
    color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
    data,
    labels,
    title,
    width = Dimensions.get('window').width - Spacing.xl * 2,
    height = 220,
    yAxisLabel = '',
    yAxisSuffix = '',
    color = Colors.light.secondary,
}) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: data,
            },
        ],
    };

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <RNBarChart
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
});
