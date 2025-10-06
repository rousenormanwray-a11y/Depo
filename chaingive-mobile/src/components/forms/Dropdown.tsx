import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Option { label: string; value: string }

interface Props {
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<Props> = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(!open)}>
        <Text style={styles.valueText}>{selected?.label ?? 'Select'}</Text>
        <Icon name={open ? 'expand-less' : 'expand-more'} size={20} color={colors.text.secondary} />
      </TouchableOpacity>
      {open && (
        <View style={styles.menu}>
          <FlatList
            data={options}
            keyExtractor={(o) => o.value}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.option} onPress={() => { setOpen(false); onChange(item.value); }}>
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.text.primary, marginBottom: spacing.xs },
  field: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: { ...typography.bodyRegular, color: colors.text.primary },
  menu: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    backgroundColor: colors.white,
    maxHeight: 240,
    overflow: 'hidden',
  },
  option: { padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  optionText: { ...typography.bodyRegular, color: colors.text.primary },
});

export default Dropdown;
