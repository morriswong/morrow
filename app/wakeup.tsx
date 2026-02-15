import React, { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../constants';

const AUTO_DISMISS_MS = 3000;

export default function WakeUpScreen() {
  const router = useRouter();
  const { snoozed } = useLocalSearchParams<{ snoozed?: string }>();
  const didSnooze = snoozed === '1';

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Go back to home — pop both wakeup and ring screens
      if (router.canGoBack()) {
        router.dismissAll();
      }
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, []);

  // Block Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.accentBrandDark, colors.background]}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerContent}>
          <View style={styles.fireCircle}>
            <Text style={styles.fireEmoji}>
              {didSnooze ? '\uD83D\uDE09' : '\uD83D\uDD25'}
            </Text>
          </View>
          <Text style={styles.greeting}>
            {didSnooze
              ? "It's never too late!"
              : 'Have a nice day, Morris!'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const CIRCLE_SIZE = 80;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.xl,
  },
  greeting: {
    fontFamily: 'Outfit-Medium',
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
  },
  fireCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireEmoji: {
    fontSize: 56,
    textAlign: 'center',
    letterSpacing: 3.36,
  },
});
