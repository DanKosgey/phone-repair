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

export const PieChart: React.FC<PieChartProps> = ({
    data,
    title,
    width = Dimensions.get('window').width - Spacing.lg * 2,
    height = 220,
}) => {
    const chartData: PieData[] = data.map(item => ({
        name: item.label,
        population: item.value,
        color: item.color,
        legendFontColor: Colors.light.textSecondary,
        legendFontSize: 12,
    }));

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <RNPieChart
                data={chartData}
                width={width}
                height={height}
                chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute={false}
                hasLegend={true}
                center={[0, 0]}
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
        marginBottom: Spacing.sm,
        alignSelf: 'flex-start',
    },
});
