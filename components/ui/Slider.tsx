import React from 'react';
import { View, StyleSheet, PanResponder, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  showIcons?: boolean;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  showIcons = true,
}: SliderProps) {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (containerWidth > 0) {
      const position = ((value - min) / (max - min)) * containerWidth;
      animatedValue.setValue(position);
    }
  }, [value, containerWidth, min, max, animatedValue]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const newPosition = evt.nativeEvent.locationX;
        updateValue(newPosition);
      },
      onPanResponderMove: (evt) => {
        const newPosition = evt.nativeEvent.locationX;
        updateValue(newPosition);
      },
    })
  ).current;

  const updateValue = (position: number) => {
    const clampedPosition = Math.max(0, Math.min(position, containerWidth));
    const newValue = Math.round(
      (clampedPosition / containerWidth) * (max - min) + min
    );
    onValueChange(newValue);
    animatedValue.setValue(clampedPosition);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      {showIcons && (
        <Ionicons name="volume-low" size={20} color={colors.textSecondary} />
      )}
      <View
        style={styles.track}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={[styles.fill, { width: `${percentage}%` }]} />
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: animatedValue }],
            },
          ]}
        />
      </View>
      {showIcons && (
        <Ionicons name="volume-high" size={20} color={colors.textSecondary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    marginLeft: -10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
