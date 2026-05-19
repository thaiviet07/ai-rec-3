import { router } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import MainMenuScreen from '../src/screens/MainMenuScreen';

export default function Home() {
  return (
    <SafeAreaView style={styles.root}>
      <MainMenuScreen
        onStartChat={() => router.push('/chat')}
        onOpenSettings={() => router.push('/settings')}
        onStartSmartAssistant={() => router.push('/smart-assistant')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
});
