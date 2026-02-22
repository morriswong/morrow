import { useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { requestPermissions } from '../services';

export function useNotificationPermission() {
  const ensurePermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermissions();

    if (!granted) {
      Alert.alert(
        'Notifications Required',
        'Morrow needs notification permission to ring your alarms. Please enable notifications in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openSettings();
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return false;
    }

    return true;
  }, []);

  return { ensurePermission };
}
