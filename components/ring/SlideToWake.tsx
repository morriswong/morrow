import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../constants';

const HANDLE_SIZE = 62;
const CONTAINER_HEIGHT = 67;
const HANDLE_INSET = (CONTAINER_HEIGHT - HANDLE_SIZE) / 2;
const COMPLETION_THRESHOLD = 0.7;

interface SlideToWakeProps {
  onWake: () => void;
}

export function SlideToWake({ onWake }: SlideToWakeProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  const maxSlide = containerWidth - HANDLE_SIZE - HANDLE_INSET * 2;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const triggerWake = useCallback(() => {
    onWake();
  }, [onWake]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(0, Math.min(e.translationX, maxSlide));
    })
    .onEnd(() => {
      if (translateX.value > maxSlide * COMPLETION_THRESHOLD) {
        translateX.value = withSpring(maxSlide, { damping: 20, stiffness: 200 });
        runOnJS(triggerWake)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const handleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, maxSlide * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Label text (centered in container) */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.label}>Stop</Text>
      </Animated.View>

      {/* Sliding handle */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.handle, handleAnimatedStyle]}>
          <Ionicons name="arrow-forward" size={24} color={colors.accentBrandDark} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: CONTAINER_HEIGHT,
    borderRadius: borderRadius.full,
    backgroundColor: colors.wakeButtonBg,
    justifyContent: 'center',
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
  },
  handle: {
    position: 'absolute',
    left: HANDLE_INSET,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
