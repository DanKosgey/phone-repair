import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface PieData {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
}

interface PieChartProps {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
    title?: string;
    width?: number;
    height?: number;
    accessor?: string;
}

// Calculate responsive dimensions
const getResponsivePieDimensions = (providedWidth?: number) => {
    const screenWidth = Dimensions.get('window').width;
    const width = providedWidth || (screenWidth - Spacing.lg * 2);

    if (screenWidth < 360) {
        return {
            width: width,
            height: 160,
            legendFontSize: 10,
        };
    } else if (screenWidth < 500) {
        return {
            width: width,
            height: 200,
            legendFontSize: 11,
        };
    } else {
        return {
            width: width,
            height: 220,
            legendFontSize: 12,
        };
    }
};

export const PieChart: React.FC<PieChartProps> = ({
    data,
    title,
    width = Dimensions.get('window').width - Spacing.lg * 2,
    height = 220,
}) => {
    const responsiveDims = getResponsivePieDimensions(width);

    const chartData: PieData[] = data.map((item) => ({
        name: item.label,
        population: item.value,
        color: item.color,
        legendFontColor: Colors.light.textSecondary,
        legendFontSize: responsiveDims.legendFontSize,
    }));

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={styles.chartWrapper}>
                <RNPieChart
                    data={chartData}
                    width={responsiveDims.width}
                    height={responsiveDims.height}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="0"
                    absolute={false}
                    hasLegend
                    center={[0, 0]}
                />
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
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.sm,
        overflow: 'hidden',
    },
    title: {
        ...Typography.h3,
        color: Colors.light.text,
        marginBottom: Spacing.sm,
        alignSelf: 'flex-start',
    },
});
