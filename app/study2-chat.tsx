import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import ScenarioScreen from '../src/screens/ScenarioScreen';
import { useAppStore } from '../src/store/useAppStore';
import { getStudy2Assignment } from '../src/services/randomizationService';
import type { Study2Scenario } from '../src/services/randomizationService';

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export default function Study2Chat() {
  const { currentScenario, setCurrentScenario } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Ensure the scenario is set from localStorage assignment
    const scenario = getStudy2Assignment();
    setCurrentScenario(scenario);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.loadingText}>Loading your experience...</Text>
      </View>
    );
  }

  // Validate that current scenario is a Study 2 scenario
  const isStudy2Scenario = ['S2_HL', 'S2_HH', 'S2_LL', 'S2_LH'].includes(currentScenario);

  if (!isStudy2Scenario) {
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
