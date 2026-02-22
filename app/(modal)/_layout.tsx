import { Stack } from 'expo-router';
import { colors } from '../../constants';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="alarm/new" />
      <Stack.Screen name="alarm/[id]" />
      <Stack.Screen
        name="sound/index"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="sound/language"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="holidays/index"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="holidays/calendar"
        options={{ gestureEnabled: true }}
      />
    </Stack>
  );
}
