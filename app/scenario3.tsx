import { SafeAreaView, StyleSheet } from 'react-native';
import ScenarioScreen from '../src/screens/ScenarioScreen';

export default function Scenario3() {
  return (
    <SafeAreaView style={styles.root}>
      <ScenarioScreen scenarioId="S3" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});
