import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorState({
  title = 'Oops! Something went wrong',
  message = 'We couldn\'t load this content. Please try again.',
  icon = 'alert-circle-outline',
  actionLabel = 'Try Again',
  onAction,
  type = 'error',
}: ErrorStateProps) {
  const getIconColor = () => {
    switch (type) {
      case 'error':
        return colors.error;
      case 'warning':
        return '#ED8936';
      case 'info':
        return colors.primary;
      default:
        return colors.error;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
        <MaterialCommunityIcons name={icon as any} size={64} color={getIconColor()} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onAction && (
        <TouchableOpacity style={[styles.button, { backgroundColor: getIconColor() }]} onPress={onAction}>
          <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
