import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { Toggle } from './Toggle';

type EntryVariant = 'base' | 'toggle' | 'selection';

interface BaseEntryProps {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

interface ToggleEntryProps extends BaseEntryProps {
  variant: 'toggle';
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface SelectionEntryProps extends BaseEntryProps {
  variant: 'selection';
  value?: string;
}

interface DefaultEntryProps extends BaseEntryProps {
  variant?: 'base';
}

type EntryProps = ToggleEntryProps | SelectionEntryProps | DefaultEntryProps;

export function Entry(props: EntryProps) {
  const { label, sublabel, icon, onPress, disabled = false, variant = 'base' } = props;

  const renderRight = () => {
    if (variant === 'toggle') {
      const { value, onValueChange } = props as ToggleEntryProps;
      return <Toggle value={value} onValueChange={onValueChange} disabled={disabled} />;
    }

    if (variant === 'selection') {
      const { value } = props as SelectionEntryProps;
      return (
        <View style={styles.selectionRight}>
          {value && <Text style={styles.selectionValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>
      );
    }

    if (onPress) {
      return <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />;
    }

    return null;
  };

  const content = (
    <View style={[styles.container, disabled && styles.disabled]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
      {renderRight()}
    </View>
  );

  if (onPress && variant !== 'toggle') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 64,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  sublabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  selectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectionValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
