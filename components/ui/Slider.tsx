import React from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
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
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  // Store mutable values in refs so PanResponder handlers always see latest values
  const containerWidthRef = React.useRef(0);
  const onValueChangeRef = React.useRef(onValueChange);
  const minRef = React.useRef(min);
  const maxRef = React.useRef(max);
  const valueRef = React.useRef(value);
  const startPositionRef = React.useRef(0);

  React.useEffect(() => { onValueChangeRef.current = onValueChange; }, [onValueChange]);
  React.useEffect(() => { minRef.current = min; maxRef.current = max; }, [min, max]);
  React.useEffect(() => { valueRef.current = value; }, [value]);

  // Sync thumb position when value prop or container size changes
  React.useEffect(() => {
    if (containerWidthRef.current > 0) {
      const position = ((value - min) / (max - min)) * containerWidthRef.current;
      animatedValue.setValue(position);
    }
  }, [value, min, max, animatedValue]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Capture before parent ScrollView can steal the touch
      onStartShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        const width = containerWidthRef.current;
        if (width === 0) return;
        // locationX is reliable at grant time (before movement begins)
        const pos = Math.max(0, Math.min(evt.nativeEvent.locationX, width));
        startPositionRef.current = pos;
        const newValue = Math.round((pos / width) * (maxRef.current - minRef.current) + minRef.current);
        onValueChangeRef.current(newValue);
        animatedValue.setValue(pos);
      },
      onPanResponderMove: (_evt, gestureState) => {
        const width = containerWidthRef.current;
        if (width === 0) return;
        // Use gestureState.dx (cumulative delta from start) — always in a consistent
        // coordinate space regardless of which child view dispatches the touch event
        const pos = Math.max(0, Math.min(startPositionRef.current + gestureState.dx, width));
        const newValue = Math.round((pos / width) * (maxRef.current - minRef.current) + minRef.current);
        onValueChangeRef.current(newValue);
        animatedValue.setValue(pos);
      },
    })
  ).current;

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      {showIcons && (
        <Ionicons name="volume-low" size={20} color={colors.textSecondary} />
      )}
      <View
        style={styles.track}
        onLayout={(e) => { containerWidthRef.current = e.nativeEvent.layout.width; }}
        {...panResponder.panHandlers}
      >
        <View style={[styles.fill, { width: `${percentage}%` }]} />
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX: animatedValue }] },
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
