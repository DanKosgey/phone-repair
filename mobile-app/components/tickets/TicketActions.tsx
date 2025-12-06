import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

interface TicketActionsProps {
    onview: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const TicketActions: React.FC<TicketActionsProps> = ({ onview, onEdit, onDelete }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.actionButton} onPress={onview}>
                <Ionicons name="eye-outline" size={20} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                <Ionicons name="pencil-outline" size={20} color={Colors.light.warning} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.sm,
    },
    actionButton: {
        padding: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
});