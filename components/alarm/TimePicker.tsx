import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, fontFamily, borderRadius } from '../../constants';

interface TimePickerProps {
  hour: number;
  minute: number;
  isAM: boolean;
  onTimeChange: (hour: number, minute: number, isAM: boolean) => void;
}

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);

const ITEM_HEIGHT = 50;
const VELOCITY_FACTOR = 0.15;
const MAX_MOMENTUM_TICKS = 8;

export function TimePicker({ hour, minute, isAM, onTimeChange }: TimePickerProps) {
  const currentHourIndex = hours.indexOf(hour === 0 ? 12 : hour);
  const currentMinuteIndex = minute;

  const hourTranslateY = useSharedValue(0);
  const minuteTranslateY = useSharedValue(0);

  const hourStartIndex = useSharedValue(0);
  const minuteStartIndex = useSharedValue(0);
  const hourAppliedTicks = useSharedValue(0);
  const minuteAppliedTicks = useSharedValue(0);

  const currentHourIndexShared = useSharedValue(currentHourIndex);
  const currentMinuteIndexShared = useSharedValue(currentMinuteIndex);

  useEffect(() => {
    currentHourIndexShared.value = currentHourIndex;
  }, [currentHourIndex]);

  useEffect(() => {
    currentMinuteIndexShared.value = currentMinuteIndex;
  }, [currentMinuteIndex]);

  const getAdjacentValues = (arr: number[], currentIndex: number) => {
    const len = arr.length;
    const prevIndex = (currentIndex - 1 + len) % len;
    const nextIndex = (currentIndex + 1) % len;
    return {
      prev: arr[prevIndex],
      current: arr[currentIndex],
      next: arr[nextIndex],
    };
  };

  const hourValues = getAdjacentValues(hours, currentHourIndex);
  const minuteValues = getAdjacentValues(minutes, currentMinuteIndex);

  const changeHour = (delta: number) => {
    const newIndex = (currentHourIndex + delta + hours.length) % hours.length;
    onTimeChange(hours[newIndex], minute, isAM);
  };

  const changeMinute = (delta: number) => {
    const newIndex = (currentMinuteIndex + delta + minutes.length) % minutes.length;
    onTimeChange(hour, minutes[newIndex], isAM);
  };

  const setHourByIndex = useCallback((index: number) => {
    const wrappedIndex = ((index % hours.length) + hours.length) % hours.length;
    onTimeChange(hours[wrappedIndex], minute, isAM);
  }, [minute, isAM, onTimeChange]);

  const setMinuteByIndex = useCallback((index: number) => {
    const wrappedIndex = ((index % minutes.length) + minutes.length) % minutes.length;
    onTimeChange(hour, minutes[wrappedIndex], isAM);
  }, [hour, isAM, onTimeChange]);

  const hourGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onStart(() => {
      hourStartIndex.value = currentHourIndexShared.value;
      hourAppliedTicks.value = 0;
      hourTranslateY.value = 0;
    })
    .onUpdate((event) => {
      const totalTicks = Math.round(-event.translationY / ITEM_HEIGHT);
      hourTranslateY.value = event.translationY + totalTicks * ITEM_HEIGHT;

      if (totalTicks !== hourAppliedTicks.value) {
        hourAppliedTicks.value = totalTicks;
        const targetIndex = hourStartIndex.value + totalTicks;
        runOnJS(setHourByIndex)(targetIndex);
      }
    })
    .onEnd((event) => {
      const velocityTicks = Math.round(
        (-event.velocityY * VELOCITY_FACTOR) / ITEM_HEIGHT
      );
      const clampedMomentum = Math.max(
        -MAX_MOMENTUM_TICKS,
        Math.min(MAX_MOMENTUM_TICKS, velocityTicks)
      );

      const finalTicks = hourAppliedTicks.value + clampedMomentum;
      if (finalTicks !== hourAppliedTicks.value) {
        const targetIndex = hourStartIndex.value + finalTicks;
        runOnJS(setHourByIndex)(targetIndex);
      }

      hourTranslateY.value = withSpring(0, {
        velocity: event.velocityY * 0.3,
        damping: 20,
        stiffness: 200,
        mass: 0.5,
      });
    });

  const minuteGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onStart(() => {
      minuteStartIndex.value = currentMinuteIndexShared.value;
      minuteAppliedTicks.value = 0;
      minuteTranslateY.value = 0;
    })
    .onUpdate((event) => {
      const totalTicks = Math.round(-event.translationY / ITEM_HEIGHT);
      minuteTranslateY.value = event.translationY + totalTicks * ITEM_HEIGHT;

      if (totalTicks !== minuteAppliedTicks.value) {
        minuteAppliedTicks.value = totalTicks;
        const targetIndex = minuteStartIndex.value + totalTicks;
        runOnJS(setMinuteByIndex)(targetIndex);
      }
    })
    .onEnd((event) => {
      const velocityTicks = Math.round(
        (-event.velocityY * VELOCITY_FACTOR) / ITEM_HEIGHT
      );
      const clampedMomentum = Math.max(
        -MAX_MOMENTUM_TICKS,
        Math.min(MAX_MOMENTUM_TICKS, velocityTicks)
      );

      const finalTicks = minuteAppliedTicks.value + clampedMomentum;
      if (finalTicks !== minuteAppliedTicks.value) {
        const targetIndex = minuteStartIndex.value + finalTicks;
        runOnJS(setMinuteByIndex)(targetIndex);
      }

      minuteTranslateY.value = withSpring(0, {
        velocity: event.velocityY * 0.3,
        damping: 20,
        stiffness: 200,
        mass: 0.5,
      });
    });

  const hourAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hourTranslateY.value }],
  }));

  const minuteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: minuteTranslateY.value }],
  }));

  const handlePeriodChange = (newIsAM: boolean) => {
    onTimeChange(hour, minute, newIsAM);
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          {/* Hour Column */}
          <GestureDetector gesture={hourGesture}>
            <Animated.View style={styles.columnClip}>
              <Animated.View style={[styles.column, hourAnimatedStyle]}>
                <TouchableOpacity onPress={() => changeHour(-1)} style={styles.adjacentItem}>
                  <Text style={styles.adjacentText}>{formatNumber(hourValues.prev)}</Text>
                </TouchableOpacity>
                <View style={styles.currentItem}>
                  <Text style={styles.currentText}>{formatNumber(hourValues.current)}</Text>
                </View>
                <TouchableOpacity onPress={() => changeHour(1)} style={styles.adjacentItem}>
                  <Text style={styles.adjacentText}>{formatNumber(hourValues.next)}</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </GestureDetector>

          <Text style={styles.separator}>:</Text>

          {/* Minute Column */}
          <GestureDetector gesture={minuteGesture}>
            <Animated.View style={styles.columnClip}>
              <Animated.View style={[styles.column, minuteAnimatedStyle]}>
                <TouchableOpacity onPress={() => changeMinute(-1)} style={styles.adjacentItem}>
                  <Text style={styles.adjacentText}>{formatNumber(minuteValues.prev)}</Text>
                </TouchableOpacity>
                <View style={styles.currentItem}>
                  <Text style={styles.currentText}>{formatNumber(minuteValues.current)}</Text>
                </View>
                <TouchableOpacity onPress={() => changeMinute(1)} style={styles.adjacentItem}>
                  <Text style={styles.adjacentText}>{formatNumber(minuteValues.next)}</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </GestureDetector>

          {/* AM/PM Buttons */}
          <View style={styles.periodContainer}>
            <TouchableOpacity
              style={[styles.periodButton, isAM && styles.periodButtonSelected]}
              onPress={() => handlePeriodChange(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, isAM && styles.periodTextSelected]}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, !isAM && styles.periodButtonSelected]}
              onPress={() => handlePeriodChange(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, !isAM && styles.periodTextSelected]}>PM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  container: {
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnClip: {
    width: 90,
    overflow: 'hidden',
    alignItems: 'center',
  },
  column: {
    alignItems: 'center',
    gap: 8,
  },
  adjacentItem: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjacentText: {
    fontFamily: fontFamily.medium,
    fontSize: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  currentItem: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentText: {
    fontFamily: fontFamily.bold,
    fontSize: 56,
    letterSpacing: 3.36,
    color: colors.textPrimary,
    textAlign: 'center',
    flexShrink: 0,
  },
  separator: {
    fontFamily: fontFamily.bold,
    fontSize: 56,
    letterSpacing: 3.36,
    color: colors.textPrimary,
  },
  periodContainer: {
    marginLeft: spacing.lg,
    gap: 12,
  },
  periodButton: {
    width: 53,
    height: 32,
    borderRadius: 1000,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodButtonSelected: {
    backgroundColor: colors.accent,
  },
  periodText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    color: colors.textSecondary,
  },
  periodTextSelected: {
    color: colors.white,
  },
});
