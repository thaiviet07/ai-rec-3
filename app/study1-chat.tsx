import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import ScenarioScreen from '../src/screens/ScenarioScreen';
import { useAppStore } from '../src/store/useAppStore';
import { getStudy1Assignment } from '../src/services/randomizationService';
import type { Study1Scenario } from '../src/services/randomizationService';

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export default function Study1Chat() {
  const { currentScenario, setCurrentScenario } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Ensure the scenario is set from localStorage assignment
    const scenario = getStudy1Assignment();
    setCurrentScenario(scenario);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your experience...</Text>
      </View>
    );
  }

  // Validate that current scenario is a Study 1 scenario
  const isStudy1Scenario = currentScenario === 'S1_LOW' || currentScenario === 'S1_HIGH';

  if (!isStudy1Scenario) {
    return (
      <View style={styles.loadingRoot}>
        <Text style={styles.loadingText}>Invalid scenario assignment. Please restart.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScenarioScreen scenarioId={currentScenario} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingRoot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: APPLE_FONT,
  },
});
