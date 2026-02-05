import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger' | 'icon' | 'accentTranslucent' | 'dangerOutline';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.accent}
          size="small"
        />
      ) : (
        <>
          {icon}
          {title && <Text style={textStyles}>{title}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  danger: {
    backgroundColor: colors.error,
  },
  icon: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.full,
  },
  accentTranslucent: {
    backgroundColor: colors.accentBrandTranslucent,
  },
  dangerOutline: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerPrimary,
  },
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  // Text styles
  primaryText: {
    ...typography.label,
    color: colors.white,
  },
  secondaryText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  textText: {
    ...typography.label,
    color: colors.accent,
  },
  dangerText: {
    ...typography.label,
    color: colors.white,
  },
  iconText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  accentTranslucentText: {
    ...typography.label,
    color: colors.white,
  },
  dangerOutlineText: {
    ...typography.label,
    color: colors.dangerPrimary,
  },
  disabledText: {
    color: colors.textTertiary,
  },
});
