import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { dashboardService } from '../../services/dashboard';
import { LineChart, PieChart, BarChart } from '../../components';
import { StatCard, SectionHeader } from '../../components';
import { TicketVolumeAnalysis } from '../../components/analytics/TicketVolumeAnalysis';
import { PeriodOverPeriodChart } from '../../components/charts/PeriodOverPeriodChart';
import { ForecastChart } from '../../components/charts/ForecastChart';
import { AdvancedForecastingMethods } from '../../components/analytics/AdvancedForecastingMethods';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function AnalyticsScreen() {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('daily'); // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    const [revenueType, setRevenueType] = useState<'all' | 'paid'>('all'); // 'all', 'paid'
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    // Data states
    const [ticketStats, setTicketStats] = useState({
        total: 0,
        completed: 0,
        revenue: 0,
    });

    // Chart data
    const [trendData, setTrendData] = useState({
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        data: [0, 0, 0, 0, 0, 0, 0],
    });

    const [statusData, setStatusData] = useState([]);

    const [deviceData, setDeviceData] = useState<{
        labels: string[];
        data: number[];
    }>({
        labels: [],
        data: [],
    });

    // New data states for additional sections
    const [ticketVolumeAnalysis, setTicketVolumeAnalysis] = useState({
        trendDirection: 'stable' as 'up' | 'down' | 'stable',
        volatility: '0',
        standardDeviation: '0',
        coefficientOfVariation: '0',
        correlation: '0',
        slope: 0,
        intercept: 0,
        dataPoints: 0,
    });

    const [periodOverPeriodData, setPeriodOverPeriodData] = useState<any[]>([]);

    const [forecastData, setForecastData] = useState<any[]>([]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange, revenueType]);

    const refreshMaterializedViews = async () => {
        const result = await dashboardService.refreshMaterializedViews();
        if (!result.success) {
            throw result.error;
        }
    };

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);

            // Refresh materialized views to ensure data is up to date
            await refreshMaterializedViews();

            // Fetch real data from materialized views
            await fetchRealAnalyticsData();
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRealAnalyticsData = async () => {
        try {
            // Fetch ticket stats from admin_dashboard_metrics materialized view
            const metricsResult = await dashboardService.getAdminMetrics();
            if (!metricsResult.success) throw metricsResult.error;

            if (metricsResult.data) {
                setTicketStats({
                    total: metricsResult.data.total_tickets || 0,
                    completed: metricsResult.data.completed_tickets || 0,
                    revenue: metricsResult.data.total_revenue || 0,
                });
            }

            // Fetch ticket trends data based on selected timeframe
            const trendsResult = await dashboardService.getTicketTrends();
            if (!trendsResult.success) throw trendsResult.error;
            
            let trendsData: any[] = trendsResult.data || [];
            
            // For non-daily timeframes, we need to aggregate data
            if (timeRange !== 'daily') {
                trendsData = aggregateTrendsData(trendsData, timeRange);
            }

            // Format trend data for chart
            const labels = trendsData.map((item: any) => formatPeriodLabel(item.date || item.period, timeRange));
            const ticketCounts = trendsData.map((item: any) => item.ticket_count || 0);
            
            setTrendData({
                labels,
                data: ticketCounts
            });

            // Fetch ticket status distribution from materialized view
            const statusResult = await dashboardService.getTicketStatusDistribution();
            if (!statusResult.success) throw statusResult.error;
            
            const pieData = statusResult.data!.map(item => ({
                label: item.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                value: item.count,
                color: getStatusColor(item.status),
            }));
            
            setStatusData(pieData as any);

            // Calculate statistical analysis
            if (trendsData.length > 0) {
                const ticketCounts = trendsData.map((item: any) => item.ticket_count || 0);
                const revenues = trendsData.map((item: any) => item.total_revenue || 0);
                
                // Calculate volatility metrics
                const mean = ticketCounts.reduce((sum: number, count: number) => sum + count, 0) / ticketCounts.length;
                const variance = ticketCounts.reduce((sum: number, count: number) => sum + Math.pow(count - mean, 2), 0) / ticketCounts.length;
                const stdDev = Math.sqrt(variance);
                const coefficientOfVariation = mean > 0 ? (stdDev / mean * 100).toFixed(2) : '0';
                
                // Calculate correlation between tickets and revenue
                let correlation = '0';
                let slope = 0;
                let intercept = 0;
                
                if (ticketCounts.length > 1) {
                    const n = ticketCounts.length;
                    const sumX = ticketCounts.reduce((sum: number, x: number) => sum + x, 0);
                    const sumY = revenues.reduce((sum: number, y: number) => sum + y, 0);
                    const sumXY = ticketCounts.reduce((sum: number, x: number, i: number) => sum + x * revenues[i], 0);
                    const sumX2 = ticketCounts.reduce((sum: number, x: number) => sum + x * x, 0);
                    const sumY2 = revenues.reduce((sum: number, y: number) => sum + y * y, 0);
                    
                    const numerator = n * sumXY - sumX * sumY;
                    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
                    
                    if (denominator !== 0) {
                        correlation = (numerator / denominator).toFixed(4);
                        
                        // Simple regression calculation
                        slope = numerator / (n * sumX2 - sumX * sumX);
                        intercept = (sumY - slope * sumX) / n;
                    }
                }
                
                setTicketVolumeAnalysis({
                    trendDirection: calculateTrendDirection(ticketCounts),
                    volatility: stdDev.toFixed(2),
                    standardDeviation: stdDev.toFixed(2),
                    coefficientOfVariation,
                    correlation,
                    slope,
                    intercept,
                    dataPoints: ticketCounts.length,
                });
            }

            // Fetch period-over-period data
            const periodOverPeriod = calculatePeriodOverPeriod(trendsData);
            setPeriodOverPeriodData(periodOverPeriod);

            // Calculate forecast data
            const forecast = calculateForecast(trendsData, timeRange);
            setForecastData(forecast);

            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Error fetching real analytics data:', error);
            throw error;
        }
    };

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'received': return Colors.light.warning;
            case 'diagnosing': return '#FFA500'; // Orange
            case 'awaiting_parts': return Colors.light.info;
            case 'repairing': return '#FF6B6B'; // Red
            case 'quality_check': return '#9B59B6'; // Purple
            case 'ready': return Colors.light.success;
            case 'completed': return '#27AE60'; // Dark Green
            case 'cancelled': return Colors.light.textSecondary;
            default: return Colors.light.textSecondary;
        }
    };

    // Helper function to format period labels based on timeframe
    const formatPeriodLabel = (dateString: string, timeframe: string) => {
        const date = new Date(dateString);
        switch (timeframe) {
            case 'daily':
                return date.toLocaleDateString('en-US', { weekday: 'short' });
            case 'weekly':
                return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            case 'monthly':
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            case 'quarterly': {
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                return `Q${quarter} ${date.getFullYear()}`;
            }
            case 'yearly':
                return date.getFullYear().toString();
            default:
                return dateString;
        }
    };

    // Helper function to aggregate trends data based on timeframe
    const aggregateTrendsData = (data: any[], timeframe: string) => {
        if (!data || data.length === 0) return [];
        
        const aggregated: Record<string, any> = {};
        
        data.forEach(item => {
            const date = new Date(item.date);
            let periodKey: string;
            let periodLabel: string;
            
            switch (timeframe) {
                case 'weekly': {
                    // Get Monday of the week
                    const day = date.getDay();
                    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                    const monday = new Date(date);
                    monday.setDate(diff);
                    periodKey = monday.toISOString().split('T')[0];
                    periodLabel = `Week of ${monday.toLocaleDateString()} `;
                    break;
                }
                case 'monthly':
                    periodKey = `${date.getFullYear()}-${date.getMonth()}`;
                    periodLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    break;
                case 'quarterly': {
                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                    periodKey = `${date.getFullYear()}-Q${quarter}`;
                    periodLabel = `Q${quarter} ${date.getFullYear()}`;
                    break;
                }
                case 'yearly':
                    periodKey = date.getFullYear().toString();
                    periodLabel = date.getFullYear().toString();
                    break;
                default: // daily
                    periodKey = date.toISOString().split('T')[0];
                    periodLabel = date.toLocaleDateString();
            }
            
            if (!aggregated[periodKey]) {
                aggregated[periodKey] = {
                    period: periodLabel,
                    ticket_count: 0,
                    unique_customers: 0,
                    total_revenue: 0
                };
            }
            
            aggregated[periodKey].ticket_count += item.ticket_count || 0;
            aggregated[periodKey].unique_customers += item.unique_customers || 0;
            aggregated[periodKey].total_revenue += item.total_revenue || 0;
        });
        
        return Object.values(aggregated);
    };

    // Helper function to calculate trend direction
    const calculateTrendDirection = (data: number[]) => {
        if (data.length < 2) return 'stable';
        
        const last = data[data.length - 1];
        const previous = data[data.length - 2];
        
        if (last > previous * 1.05) {
            return 'up';
        } else if (last < previous * 0.95) {
            return 'down';
        } else {
            return 'stable';
        }
    };

    // Helper function to calculate period-over-period data
    const calculatePeriodOverPeriod = (data: any[]) => {
        const result = [];
        
        for (let i = 1; i < data.length; i++) {
            const currentPeriod = data[i];
            const previousPeriod = data[i - 1];
            
            // Calculate growth rates
            const ticketGrowthRate = previousPeriod.ticket_count !== 0 
                ? parseFloat(((currentPeriod.ticket_count - previousPeriod.ticket_count) / previousPeriod.ticket_count * 100).toFixed(2))
                : (currentPeriod.ticket_count > 0 ? 100 : 0);
                
            const revenueGrowthRate = previousPeriod.total_revenue !== 0
                ? parseFloat(((currentPeriod.total_revenue - previousPeriod.total_revenue) / previousPeriod.total_revenue * 100).toFixed(2))
                : (currentPeriod.total_revenue > 0 ? 100 : 0);
            
            result.push({
                period: currentPeriod.period || new Date(currentPeriod.date).toLocaleDateString(),
                current_period_tickets: currentPeriod.ticket_count || 0,
                previous_period_tickets: previousPeriod.ticket_count || 0,
                current_period_revenue: currentPeriod.total_revenue || 0,
                previous_period_revenue: previousPeriod.total_revenue || 0,
                ticket_growth_rate: ticketGrowthRate,
                revenue_growth_rate: revenueGrowthRate
            });
        }
        
        return result;
    };

    // Helper function to calculate forecast data
    const calculateForecast = (data: any[], timeframe: string) => {
        if (data.length < 3) return [];
        
        // Extract ticket counts and revenue for regression analysis
        const ticketCounts = data.map((item: any) => item.ticket_count || 0);
        const revenues = data.map((item: any) => item.total_revenue || 0);
        const periods = data.map((item: any, index: number) => index + 1); // 1-indexed periods
        
        // Calculate linear regression
        const n = periods.length;
        const sumX = periods.reduce((sum: number, x: number) => sum + x, 0);
        const sumY = ticketCounts.reduce((sum: number, y: number) => sum + y, 0);
        const sumXY = periods.reduce((sum: number, x: number, i: number) => sum + x * ticketCounts[i], 0);
        const sumX2 = periods.reduce((sum: number, x: number) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Calculate confidence intervals (simplified)
        const avgTicketCount = ticketCounts.reduce((sum: number, count: number) => sum + count, 0) / ticketCounts.length;
        const ticketVariance = ticketCounts.reduce((sum: number, count: number) => sum + Math.pow(count - avgTicketCount, 2), 0) / ticketCounts.length;
        const ticketStdDev = Math.sqrt(ticketVariance);
        
        // Generate forecast for next 3 periods
        const forecast = [];
        const lastDate = new Date(data[data.length - 1].date);
        
        for (let i = 1; i <= 3; i++) {
            const futurePeriod = n + i;
            const predictedTickets = Math.max(0, Math.round(slope * futurePeriod + intercept));
            const predictedRevenue = predictedTickets * 80; // Assuming avg revenue per ticket
            
            // Calculate confidence intervals (±2 standard deviations)
            const ticketConfidenceLower = Math.max(0, Math.round(predictedTickets - 2 * ticketStdDev));
            const ticketConfidenceUpper = Math.round(predictedTickets + 2 * ticketStdDev);
            const revenueConfidenceLower = ticketConfidenceLower * 80;
            const revenueConfidenceUpper = ticketConfidenceUpper * 80;
            
            // Calculate future date based on timeframe
            let futureDate = new Date(lastDate);
            switch (timeframe) {
                case 'daily':
                    futureDate.setDate(futureDate.getDate() + i);
                    break;
                case 'weekly':
                    futureDate.setDate(futureDate.getDate() + i * 7);
                    break;
                case 'monthly':
                    futureDate.setMonth(futureDate.getMonth() + i);
                    break;
                default:
                    futureDate.setDate(futureDate.getDate() + i);
            }
            
            forecast.push({
                period: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                predicted_tickets: predictedTickets,
                predicted_revenue: predictedRevenue,
                ticket_confidence_lower: ticketConfidenceLower,
                ticket_confidence_upper: ticketConfidenceUpper,
                revenue_confidence_lower: revenueConfidenceLower,
                revenue_confidence_upper: revenueConfidenceUpper
            });
        }
        
        return forecast;
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalyticsData();
    };

    const renderTimeFilter = () => (
        <View style={styles.filterContainer}>
            {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map((range) => (
                <TouchableOpacity
                    key={range}
                    style={[
                        styles.filterButton,
                        timeRange === range && styles.filterButtonActive
                    ]}
                    onPress={() => setTimeRange(range)}
                >
                    <Text style={[
                        styles.filterText,
                        timeRange === range && styles.filterTextActive
                    ]}>
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderRevenueToggle = () => (
        <View style={styles.revenueToggleContainer}>
            <Text style={styles.revenueToggleLabel}>Revenue:</Text>
            <View style={styles.revenueToggleButtonGroup}>
                <TouchableOpacity
                    style={[
                        styles.revenueToggleButton,
                        styles.revenueToggleButtonLeft,
                        revenueType === 'all' && styles.revenueToggleButtonActive
                    ]}
                    onPress={() => setRevenueType('all')}
                >
                    <Text style={[
                        styles.revenueToggleText,
                        revenueType === 'all' && styles.revenueToggleTextActive
                    ]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.revenueToggleButton,
                        styles.revenueToggleButtonRight,
                        revenueType === 'paid' && styles.revenueToggleButtonActive
                    ]}
                    onPress={() => setRevenueType('paid')}
                >
                    <Text style={[
                        styles.revenueToggleText,
                        revenueType === 'paid' && styles.revenueToggleTextActive
                    ]}>
                        Paid Only
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Enhanced Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.title}>Analytics Dashboard</Text>
                        <Text style={styles.subtitle}>Advanced insights and business intelligence</Text>
                        {lastRefreshed && (
                            <Text style={styles.lastUpdated}>
                                Last refreshed: {lastRefreshed.toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity 
                        style={styles.homeButton}
                        onPress={() => navigation.navigate('AdminDashboard')}
                    >
                        <MaterialIcons name="home" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Controls Section */}
            <View style={styles.controlsContainer}>
                <View style={styles.controlsRow}>
                    <TouchableOpacity 
                        style={styles.refreshButton}
                        onPress={onRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        )}
                    </TouchableOpacity>
                    {renderRevenueToggle()}
                </View>
                {renderTimeFilter()}
            </View>

            {/* Ticket Status Distribution (moved up for quick visibility) */}
            <View style={styles.section}>
                <PieChart
                    title="Ticket Status Distribution"
                    data={statusData}
                />
            </View>

            {/* Ticket Trends Section */}
            <View style={styles.section}>
                <LineChart
                    title={`Ticket Trends`}
                    data={trendData.data}
                    labels={trendData.labels}
                    color={Colors.light.primary}
                />
            </View>

            {/* Ticket Volume Analysis */}
            <View style={styles.section}>
                <TicketVolumeAnalysis
                    trendDirection={ticketVolumeAnalysis.trendDirection}
                    volatility={ticketVolumeAnalysis.volatility}
                    standardDeviation={ticketVolumeAnalysis.standardDeviation}
                    coefficientOfVariation={ticketVolumeAnalysis.coefficientOfVariation}
                    correlation={ticketVolumeAnalysis.correlation}
                    slope={ticketVolumeAnalysis.slope}
                    intercept={ticketVolumeAnalysis.intercept}
                    dataPoints={ticketVolumeAnalysis.dataPoints}
                />
            </View>

            {/* (status distribution moved higher) */}

            {/* Period-over-Period Comparison */}
            <View style={styles.section}>
                <PeriodOverPeriodChart
                    data={periodOverPeriodData}
                />
            </View>

            {/* Forecast Analysis */}
            <View style={styles.section}>
                <ForecastChart
                    data={forecastData}
                />
            </View>

            {/* Advanced Forecasting Methods */}
            <View style={styles.section}>
                <AdvancedForecastingMethods />
            </View>

            {/* Floating Action Button for quick ticket creation (admin) */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateTicket')}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: Colors.light.primary,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
        letterSpacing: 0,
        color: '#fff',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: Spacing.xs,
    },
    lastUpdated: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    homeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlsContainer: {
        padding: Spacing.md,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    refreshButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
    },
    refreshButtonText: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: '#fff',
    },
    revenueToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    revenueToggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.textSecondary,
        marginRight: Spacing.sm,
    },
    revenueToggleButtonGroup: {
        flexDirection: 'row',
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.light.border,
        overflow: 'hidden',
    },
    revenueToggleButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
    },
    revenueToggleButtonLeft: {
        borderRightWidth: 1,
        borderRightColor: Colors.light.border,
    },
    revenueToggleButtonRight: {
        // No border needed for the right button
    },
    revenueToggleButtonActive: {
        backgroundColor: Colors.light.primary,
    },
    revenueToggleText: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.textSecondary,
    },
    revenueToggleTextActive: {
        color: '#fff',
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    filterButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    filterButtonActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.textSecondary,
    },
    filterTextActive: {
        color: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    statWrapper: {
        width: '47%',
    },
    section: {
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    bottomSpacing: {
        height: Spacing.xl,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: -2,
    },
});