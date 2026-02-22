import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashOverlayProps {
  onFinish: () => void;
}

export default function SplashOverlay({ onFinish }: SplashOverlayProps) {
  const overlayOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in the title text
    textOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    // After 1 second, fade out the overlay
    overlayOpacity.value = withDelay(
      1000,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }),
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, containerStyle]} pointerEvents="none">
      <LinearGradient
        colors={[colors.accentBrandDark, colors.background]}
        start={{ x: 0.65, y: 1 }}
        end={{ x: 0.35, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.Text style={[styles.title, titleStyle]}>Morrow</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Outfit-Bold',
    fontSize: 56,
    letterSpacing: 3.36,
    textAlign: 'center',
    color: colors.white,
  },
});
