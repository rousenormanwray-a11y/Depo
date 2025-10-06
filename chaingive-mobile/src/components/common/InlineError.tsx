import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface Props {
  message?: string;
}

const InlineError: React.FC<Props> = ({ message }) => {
  if (!message) return null;
  return <Text style={styles.text}>{message}</Text>;
};

const styles = StyleSheet.create({
  text: { ...typography.caption, color: colors.error, marginTop: 4 },
});

export default InlineError;
