import { SafeAreaView, StyleSheet } from 'react-native';
import ScenarioScreen from '../src/screens/ScenarioScreen';
import { useAppStore } from '../src/store/useAppStore';

export default function Chat() {
  const { currentScenario } = useAppStore();

  return (
    <SafeAreaView style={styles.root}>
      <ScenarioScreen scenarioId={currentScenario} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});
