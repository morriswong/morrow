import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { Toggle } from './Toggle';

type EntryVariant = 'base' | 'toggle' | 'selection';

interface BaseEntryProps {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  onPress?: () => void;
  disabled?: boolean;
  noBorderRadius?: boolean;
  noBackground?: boolean;
  children?: React.ReactNode;
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
  const {
    label,
    sublabel,
    icon,
    iconBackgroundColor,
    onPress,
    disabled = false,
    variant = 'base',
    noBorderRadius = false,
    noBackground = false,
    children,
  } = props;

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

  const containerStyle: ViewStyle[] = [styles.container];

  if (disabled) {
    containerStyle.push(styles.disabled);
  }

  if (noBorderRadius) {
    containerStyle.push({ borderRadius: 0 });
  }

  if (noBackground) {
    containerStyle.push({ backgroundColor: 'transparent' });
  }

  const content = (
    <View style={containerStyle}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            iconBackgroundColor && {
              backgroundColor: iconBackgroundColor,
              width: 32,
              height: 32,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          {icon}
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
      {renderRight()}
    </View>
  );

  const wrappedContent = children ? (
    <View>
      {content}
      {children}
    </View>
  ) : (
    content
  );

  if (onPress && variant !== 'toggle') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}>
        {wrappedContent}
      </TouchableOpacity>
    );
  }

  return wrappedContent;
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
