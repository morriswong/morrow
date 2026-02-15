import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_WIDTH = SCREEN_WIDTH * 1.5;

interface SplashOverlayProps {
  onFinish: () => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function SplashOverlay({ onFinish }: SplashOverlayProps) {
  const shimmerX = useSharedValue(-SHIMMER_WIDTH);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    // Start shimmer loop immediately
    shimmerX.value = withRepeat(
      withTiming(SCREEN_WIDTH, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // infinite
      false,
    );

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

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, containerStyle]} pointerEvents="none">
      <LinearGradient
        colors={[colors.accentBrandDark, colors.background]}
        start={{ x: 0.65, y: 1 }}
        end={{ x: 0.35, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <MaskedView
        style={styles.maskedView}
        maskElement={
          <View style={styles.maskContainer}>
            <Text style={styles.title}>Morrow</Text>
          </View>
        }
      >
        {/* Base white text layer */}
        <View style={styles.maskContainer}>
          <Text style={[styles.title, styles.titleVisible]}>Morrow</Text>
        </View>

        {/* Shimmer sweep */}
        <AnimatedLinearGradient
          style={[styles.shimmer, shimmerStyle]}
          colors={['transparent', 'rgba(190, 156, 255, 0.6)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </MaskedView>
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
  maskedView: {
    width: SCREEN_WIDTH,
    height: 100,
  },
  maskContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Outfit-Bold',
    fontSize: 56,
    letterSpacing: 3.36,
    textAlign: 'center',
    color: 'black', // mask element needs opaque color
  },
  titleVisible: {
    color: colors.white,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
  },
});
