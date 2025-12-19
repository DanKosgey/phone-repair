import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, Spacing, Typography, BorderRadius, Elevation } from '../../constants/theme';

interface TicketStatusData {
    status: string;
    count: number;
    color: string;
}

interface TicketStatusChartProps {
    data: TicketStatusData[];
    title: string;
}

const screenWidth = Dimensions.get('window').width;

// Calculate responsive dimensions based on screen width
const getResponsiveDimensions = (width: number) => {
    if (width < 360) {
        return {
            chartWidth: width - 40,
            chartHeight: 180,
            paddingLeft: "10",
            fontSize: 10,
        };
    } else if (width < 500) {
        return {
            chartWidth: width - 40,
            chartHeight: 200,
            paddingLeft: "15",
            fontSize: 12,
        };
    } else {
        return {
            chartWidth: width - 40,
            chartHeight: 240,
            paddingLeft: "20",
            fontSize: 13,
        };
    }
};

const responsiveDims = getResponsiveDimensions(screenWidth);

const chartConfig = {
    backgroundColor: Colors.light.surface,
    backgroundGradientFrom: Colors.light.surface,
    backgroundGradientTo: Colors.light.surface,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
};

export const TicketStatusChart: React.FC<TicketStatusChartProps> = ({ data, title }) => {
    // Transform data for react-native-chart-kit
    const chartData = {
        labels: data.map(item => item.status),
        datasets: [{
            data: data.map(item => item.count),
            colors: data.map(item => () => item.color),
        }]
    };

    // Calculate total tickets
    const totalTickets = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.total}>Total Active Tickets: {totalTickets}</Text>
            
            {totalTickets > 0 ? (
                <View style={styles.chartWrapper}>
                    <View style={styles.chartContainer}>
                        <PieChart
                            data={chartData.datasets[0].data.map((value, index) => ({
                                name: chartData.labels[index],
                                population: value,
                                color: data[index].color,
                                legendFontColor: Colors.light.text,
                                legendFontSize: Math.max(10, responsiveDims.fontSize - 2),
                            }))}
                            width={responsiveDims.chartWidth}
                            height={responsiveDims.chartHeight}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft={responsiveDims.paddingLeft}
                            center={[10, 10]}
                            absolute
                            hasLegend={true}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No ticket data available</Text>
                </View>
            )}
            
            {/* Status Legend */}
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>
                            {item.status}: {item.count}
                        </Text>
                    </View>
                ))}
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
        ...Elevation.level2,
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.md,
        overflow: 'hidden',
    },
    chartContainer: {
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        backgroundColor: Colors.light.background,
        ...Elevation.level1,
    },
    title: {
        ...Typography.headlineSmall,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        textAlign: 'center',
        color: Colors.light.text,
    },
    total: {
        ...Typography.bodyMedium,
        textAlign: 'center',
        marginBottom: Spacing.md,
        color: Colors.light.textSecondary,
    },
    emptyState: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...Typography.bodyMedium,
        color: Colors.light.textSecondary,
    },
    legendContainer: {
        marginTop: Spacing.md,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.xs,
        marginVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.light.border,
        ...Elevation.level1,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: Spacing.xs,
    },
    legendText: {
        ...Typography.caption,
        color: Colors.light.text,
        fontSize: 11,
    },
});