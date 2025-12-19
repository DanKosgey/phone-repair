import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image, Linking } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface Ticket {
    id: string;
    ticket_number: string;
    device_type: string;
    issue_description: string;
    status: string;
    created_at: string;
    customer_name?: string;
    device_photos?: string[]; // Add device photos to the interface
}

interface TicketCardProps {
    ticket: Ticket;
    onPress: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPress }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'received':
                return Colors.light.info;
            case 'diagnosing':
                return Colors.light.warning;
            case 'awaiting_parts':
                return Colors.light.error;
            case 'repairing':
                return Colors.light.secondary;
            case 'quality_check':
                return Colors.light.primary;
            case 'ready':
                return Colors.light.success;
            case 'completed':
                return Colors.light.success;
            case 'cancelled':
                return Colors.light.text;
            default:
                return Colors.light.textSecondary;
        }
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handlePhotoPress = (photoUrl: string) => {
        // Open photo in browser for now (can be enhanced with a modal view)
        Linking.openURL(photoUrl).catch(err => console.error('Error opening photo:', err));
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.ticketInfo}>
                    <Text style={styles.ticketNumber}>#{ticket.ticket_number}</Text>
                    {ticket.customer_name && (
                        <Text style={styles.customerName}>{ticket.customer_name}</Text>
                    )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {formatStatus(ticket.status)}
                    </Text>
                </View>
            </View>

            <Text style={styles.deviceType}>{ticket.device_type}</Text>
            <Text style={styles.issueDescription} numberOfLines={2}>
                {ticket.issue_description}
            </Text>

            {/* Show photo thumbnail if available */}
            {ticket.device_photos && ticket.device_photos.length > 0 && (
                <TouchableOpacity 
                    style={styles.photoThumbnailContainer}
                    onPress={() => handlePhotoPress(ticket.device_photos![0])}
                >
                    <Image 
                        source={{ uri: ticket.device_photos[0] }} 
                        style={styles.photoThumbnail}
                        resizeMode="cover"
                    />
                    {ticket.device_photos.length > 1 && (
                        <View style={styles.photoCountBadge}>
                            <Text style={styles.photoCountText}>+{ticket.device_photos.length - 1}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}

            <View style={styles.footer}>
                <Text style={styles.date}>📅 {formatDate(ticket.created_at)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    ticketInfo: {
        flex: 1,
    },
    ticketNumber: {
        ...Typography.headlineSmall,
        color: Colors.light.primary,
        fontWeight: '700',
        marginBottom: Spacing.xs / 2,
    },
    customerName: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
        fontSize: 10,
    },
    deviceType: {
        ...Typography.bodyLarge,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    issueDescription: {
        ...Typography.bodyMedium,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },
    photoThumbnailContainer: {
        position: 'relative',
        alignSelf: 'flex-end',
        marginBottom: Spacing.sm,
    },
    photoThumbnail: {
        width: 50,
        height: 50,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    photoCountBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: Colors.light.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoCountText: {
        ...Typography.caption,
        color: Colors.light.background,
        fontWeight: '600',
        fontSize: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
});