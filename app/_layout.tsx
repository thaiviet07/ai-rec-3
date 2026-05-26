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
        {/* Study 1: Autonomy (Low × High) — 2 scenarios */}
        <Stack.Screen name="study1" />
        <Stack.Screen name="study1-chat" />
        {/* Study 2: Autonomy × Teaming (2×2) — 4 scenarios */}
        <Stack.Screen name="study2" />
        <Stack.Screen name="study2-chat" />
        {/* Research Analytics & Tracking Dashboard */}
        <Stack.Screen name="dashboard" />
      </Stack>
    </SafeAreaProvider>
  );
}
