import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { getStudy2Assignment } from '../src/services/randomizationService';
import { useAppStore } from '../src/store/useAppStore';
import { logToKnack } from '../src/services/knackService';

const APPLE_FONT = Platform.OS === 'ios'
  ? 'System'
  : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export default function Home() {
  const { setCurrentScenario, resetWallet, setSessionId } = useAppStore();

  useEffect(() => {
    // Initialize session
    resetWallet();
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sessionId);

    // Randomize to Study 2 condition
    const scenario = getStudy2Assignment();
    setCurrentScenario(scenario);

    const autonomy = ['S2_HL', 'S2_HH'].includes(scenario) ? 'High' : 'Low';
    const teaming = ['S2_HH', 'S2_LH'].includes(scenario);

    logToKnack({
      sessionId,
      study: 'study2',
      scenario,
      autonomyLevel: autonomy,
      teaming,
      eventType: 'ASSIGNED',
      details: {
        studyType: 'study2',
        description: `Respondent assigned to ${scenario} (${autonomy} Autonomy, Teaming: ${teaming})`,
      },
      timestamp: new Date().toISOString(),
    });

    // Short delay for a premium transition feel
    const timer = setTimeout(() => {
      router.replace('/study2-chat');
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoMark}>onmi</Text>
        <View style={styles.logoDot} />
      </View>
      <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      <Text style={styles.text}>Initializing secure shopping session...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 8,
  },
  logoMark: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.8,
  },
  logoDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3B82F6',
  },
  loader: {
    marginVertical: 8,
  },
  text: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: APPLE_FONT,
  },
});
