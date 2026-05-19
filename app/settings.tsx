import { SafeAreaView, StyleSheet } from 'react-native';
import SettingsScreen from '../src/screens/SettingsScreen';

export default function Settings() {
  return (
    <SafeAreaView style={styles.root}>
      <SettingsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
});
