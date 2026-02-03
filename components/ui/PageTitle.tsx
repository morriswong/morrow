import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants';
import { Toggle } from './Toggle';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  showEditIcon?: boolean;
  onEditPress?: () => void;
  editable?: boolean;
  onTitleChange?: (text: string) => void;
  placeholder?: string;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

export function PageTitle({
  title,
  subtitle,
  showEditIcon = false,
  onEditPress,
  editable = false,
  onTitleChange,
  placeholder,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
}: PageTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleEditPress = () => {
    if (editable) {
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (onEditPress) {
      onEditPress();
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleSubmit = () => {
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.titleContainer}>
          {isEditing ? (
            <TextInput
              ref={inputRef}
              style={styles.titleInput}
              value={title}
              onChangeText={(text) => onTitleChange?.(text.slice(0, 38))}
              onBlur={handleBlur}
              onSubmitEditing={handleSubmit}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              maxLength={38}
              autoFocus
            />
          ) : (
            <>
              <Text
                style={[styles.title, !title && styles.titlePlaceholder]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title || placeholder}
              </Text>
              {showEditIcon && (
                <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
                  <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        {showToggle && onToggleChange && (
          <Toggle value={toggleValue} onValueChange={onToggleChange} />
        )}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  titlePlaceholder: {
    color: colors.textSecondary,
  },
  titleInput: {
    ...typography.h1,
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    flex: 1,
  },
  editButton: {
    padding: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
