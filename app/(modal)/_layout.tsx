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
      <Stack.Screen name="sound/index" />
      <Stack.Screen name="sound/language" />
      <Stack.Screen name="holidays/index" />
      <Stack.Screen name="holidays/calendar" />
    </Stack>
  );
}
