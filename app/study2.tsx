import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getStudy2Assignment,
  hasStudy2Assignment,
  type Study2Scenario,
} from '../src/services/randomizationService';
import { useAppStore } from '../src/store/useAppStore';

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export default function Study2Landing() {
  const [assigned, setAssigned] = useState<Study2Scenario | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const setCurrentScenario = useAppStore((s) => s.setCurrentScenario);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleStart = async () => {
    setIsAssigning(true);

    // Simulate a brief "assigning" animation
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const scenario = getStudy2Assignment();
    setAssigned(scenario);
    setCurrentScenario(scenario);

    // Brief pause to show assignment before navigating
    await new Promise((resolve) => setTimeout(resolve, 800));

    router.replace('/study2-chat');
  };

  const alreadyAssigned = hasStudy2Assignment();

  const handleContinue = () => {
    const scenario = getStudy2Assignment();
    setCurrentScenario(scenario);
    router.replace('/study2-chat');
  };

  const getExperienceLabel = (s: Study2Scenario): string => {
    const labels: Record<Study2Scenario, string> = {
      S2_HL: 'Experience A',
      S2_HH: 'Experience B',
      S2_LL: 'Experience C',
      S2_LH: 'Experience D',
    };
    return labels[s];
  };

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Study 2</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>AI Shopping{'\n'}Experience</Text>
        <Text style={styles.subtitle}>
          You will interact with an AI shopping assistant called <Text style={styles.bold}>onmi</Text>. 
          The assistant will help you find and purchase products from a curated catalog.
        </Text>

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.infoTitle}>Chat Interface</Text>
            <Text style={styles.infoDesc}>Describe what you want to buy in natural language</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="people-outline" size={18} color="#EA580C" />
            </View>
            <Text style={styles.infoTitle}>AI + Human Team</Text>
            <Text style={styles.infoDesc}>Experience different levels of AI assistance</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="wallet-outline" size={18} color="#16A34A" />
            </View>
            <Text style={styles.infoTitle}>Virtual Wallet</Text>
            <Text style={styles.infoDesc}>You start with $1,000 simulated balance</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: '#FDF2F8' }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#DB2777" />
            </View>
            <Text style={styles.infoTitle}>Research Study</Text>
            <Text style={styles.infoDesc}>Your interactions help improve AI systems</Text>
          </View>
        </View>

        {/* Research Notice */}
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={16} color="#64748B" />
          <Text style={styles.noticeText}>
            This is a research study exploring how people interact with AI shopping assistants at different levels of autonomy and collaboration.
          </Text>
        </View>

        {/* Action Button */}
        {isAssigning ? (
          <View style={styles.assigningBox}>
            <View style={styles.spinner} />
            <Text style={styles.assigningText}>
              {assigned ? `Assigned: ${getExperienceLabel(assigned)}` : 'Preparing your experience...'}
            </Text>
          </View>
        ) : alreadyAssigned ? (
          <TouchableOpacity style={styles.startBtn} onPress={handleContinue}>
            <Text style={styles.startBtnText}>Continue Your Experience</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>Begin Experience</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Footer */}
        <Text style={styles.footerText}>
          Powered by onmi AI • Research Prototype
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: APPLE_FONT,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  bold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
  },
  infoDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: APPLE_FONT,
    lineHeight: 16,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: APPLE_FONT,
    lineHeight: 18,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 54,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: APPLE_FONT,
  },
  assigningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EA580C',
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#EA580C',
    borderTopColor: 'transparent',
  },
  assigningText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
    fontFamily: APPLE_FONT,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    fontFamily: APPLE_FONT,
    textAlign: 'center',
  },
});
