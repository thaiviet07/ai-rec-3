import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="scenario2" />
        <Stack.Screen name="scenario3" />
        <Stack.Screen name="scenario4" />
      </Stack>
    </SafeAreaProvider>
  );
}
