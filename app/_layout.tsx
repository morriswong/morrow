import { useCallback, useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { colors } from '../constants';
import SplashOverlay from '../components/SplashOverlay';
import { useAlarmStore } from '../stores';
import {
  configureNotificationHandler,
  configureNotificationCategories,
  syncAllAlarmNotifications,
} from '../services';

// ── Module-level setup (runs once on import) ────────────────────────────
configureNotificationHandler();

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the native splash to reveal our custom animated one
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // ── Notification setup ──────────────────────────────────────────────

  useEffect(() => {
    // Register notification categories (iOS action buttons)
    configureNotificationCategories();

    // Initial sync: schedule notifications for all enabled alarms
    const alarms = useAlarmStore.getState().alarms;
    syncAllAlarmNotifications(alarms);
  }, []);

  // ── Notification response listener (user taps notification) ─────────

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.alarmId) {
          router.push({
            pathname: '/ring',
            params: { id: data.alarmId as string },
          });
        }
      }
    );

    return () => subscription.remove();
  }, [router]);

  // ── Cold-start: app launched from killed state via notification ──────

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification.request.content.data?.alarmId) {
        const alarmId = response.notification.request.content.data.alarmId as string;
        router.push({
          pathname: '/ring',
          params: { id: alarmId },
        });
      }
    });
  }, [router]);

  // ── Store subscription: auto-sync notifications on alarm changes ────

  useEffect(() => {
    let prevAlarms = useAlarmStore.getState().alarms;

    const unsub = useAlarmStore.subscribe((state) => {
      // Only re-sync if the alarms array reference changed
      if (state.alarms !== prevAlarms) {
        prevAlarms = state.alarms;
        syncAllAlarmNotifications(state.alarms);
      }
    });

    return unsub;
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="ring"
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="wakeup"
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(modal)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      {showSplash && <SplashOverlay onFinish={handleSplashFinish} />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
