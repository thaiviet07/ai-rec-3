import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getStudy1Assignment,
  getStudy2Assignment,
  hasStudy1Assignment,
  hasStudy2Assignment,
  type Study1Scenario,
  type Study2Scenario,
} from '../src/services/randomizationService';
import { useAppStore } from '../src/store/useAppStore';
import { logToKnack } from '../src/services/knackService';

const APPLE_FONT = Platform.OS === 'ios'
  ? 'System'
  : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

type ActiveStudy = null | 'study1' | 'study2';

export default function Home() {
  const [activeStudy, setActiveStudy] = useState<ActiveStudy>(null);
  const [assignedLabel, setAssignedLabel] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const { setCurrentScenario, resetWallet, setSessionId } = useAppStore();

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(card1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(card2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleStudyStart = async (study: 'study1' | 'study2') => {
    setActiveStudy(study);
    resetWallet();
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sessionId);

    await new Promise((r) => setTimeout(r, 1000));

    let autonomy: 'High' | 'Low' = 'Low';
    let teaming = false;

    if (study === 'study1') {
      const scenario = getStudy1Assignment();
      setCurrentScenario(scenario);
      scenarioId = scenario;
      autonomy = scenario === 'S1_HIGH' ? 'High' : 'Low';
      teaming = false;
      setAssignedLabel(scenario === 'S1_HIGH' ? 'Experience A' : 'Experience B');
      await new Promise((r) => setTimeout(r, 600));
      router.push('/study1-chat');
    } else {
      const scenario = getStudy2Assignment();
      setCurrentScenario(scenario);
      scenarioId = scenario;
      autonomy = ['S2_HL', 'S2_HH'].includes(scenario) ? 'High' : 'Low';
      teaming = ['S2_HH', 'S2_LH'].includes(scenario);
      const labels: Record<Study2Scenario, string> = {
        S2_HL: 'Experience A', S2_HH: 'Experience B',
        S2_LL: 'Experience C', S2_LH: 'Experience D',
      };
      setAssignedLabel(labels[scenario]);
      await new Promise((r) => setTimeout(r, 600));
      router.push('/study2-chat');
    }

    logToKnack({
      sessionId,
      study,
      scenario: scenarioId,
      autonomyLevel: autonomy,
      teaming,
      eventType: 'ASSIGNED',
      details: {
        studyType: study,
        description: `Respondent assigned to ${scenarioId} (${autonomy} Autonomy, Teaming: ${teaming})`,
      },
      timestamp: new Date().toISOString(),
    });

    // Reset state after navigation
    setTimeout(() => { setActiveStudy(null); setAssignedLabel(''); }, 500);
  };

  const handleContinue = (study: 'study1' | 'study2') => {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sessionId);

    if (study === 'study1') {
      const scenario = getStudy1Assignment();
      setCurrentScenario(scenario);
      router.push('/study1-chat');
    } else {
      const scenario = getStudy2Assignment();
      setCurrentScenario(scenario);
      router.push('/study2-chat');
    }
  };

  const s1Assigned = hasStudy1Assignment();
  const s2Assigned = hasStudy2Assignment();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoMark}>onmi</Text>
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.heroTitle}>AI Shopping{'\n'}Research Lab</Text>
        <Text style={styles.heroSub}>
          Select a study below to begin your interactive AI shopping experience.
          You will be <Text style={styles.bold}>randomly assigned</Text> to a unique scenario.
        </Text>
      </Animated.View>

      {/* Study 1 Card */}
      <Animated.View style={[styles.studyCard, { opacity: card1Anim, transform: [{ translateY: card1Anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.studyBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <View style={[styles.studyDot, { backgroundColor: '#2563EB' }]} />
            <Text style={[styles.studyBadgeText, { color: '#2563EB' }]}>Study 1</Text>
          </View>
          <View style={styles.scenarioCount}>
            <Text style={styles.scenarioCountText}>2 scenarios</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>Autonomy Study</Text>
        <Text style={styles.cardDesc}>
          Explores how AI <Text style={styles.bold}>autonomy level</Text> (Low vs High) affects your shopping experience. The AI either recommends or purchases automatically.
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.tag}><Ionicons name="git-branch-outline" size={12} color="#64748B" /><Text style={styles.tagText}>Low × High Autonomy</Text></View>
          <View style={styles.tag}><Ionicons name="person-outline" size={12} color="#64748B" /><Text style={styles.tagText}>Solo AI</Text></View>
        </View>

        <View style={styles.distributionBar}>
          <View style={[styles.distSegment, { flex: 1, backgroundColor: '#DBEAFE', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]}>
            <Text style={[styles.distText, { color: '#2563EB' }]}>50%</Text>
          </View>
          <View style={[styles.distSegment, { flex: 1, backgroundColor: '#E0E7FF', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]}>
            <Text style={[styles.distText, { color: '#4F46E5' }]}>50%</Text>
          </View>
        </View>

        {activeStudy === 'study1' ? (
          <View style={[styles.loadingBtn, { borderColor: '#2563EB' }]}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={[styles.loadingText, { color: '#2563EB' }]}>
              {assignedLabel ? `Assigned: ${assignedLabel}` : 'Randomizing...'}
            </Text>
          </View>
        ) : s1Assigned ? (
          <TouchableOpacity style={[styles.startBtn, { backgroundColor: '#2563EB' }]} onPress={() => handleContinue('study1')}>
            <Ionicons name="play" size={16} color="#FFF" />
            <Text style={styles.startBtnText}>Continue Study 1</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: '#0F172A' }]}
            onPress={() => handleStudyStart('study1')}
            disabled={activeStudy !== null}
          >
            <Ionicons name="shuffle-outline" size={16} color="#FFF" />
            <Text style={styles.startBtnText}>Begin Study 1</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Study 2 Card */}
      <Animated.View style={[styles.studyCard, { opacity: card2Anim, transform: [{ translateY: card2Anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.studyBadge, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <View style={[styles.studyDot, { backgroundColor: '#EA580C' }]} />
            <Text style={[styles.studyBadgeText, { color: '#EA580C' }]}>Study 2</Text>
          </View>
          <View style={styles.scenarioCount}>
            <Text style={styles.scenarioCountText}>4 scenarios</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>Autonomy × Teaming</Text>
        <Text style={styles.cardDesc}>
          A 2×2 factorial design exploring both <Text style={styles.bold}>autonomy level</Text> and <Text style={styles.bold}>human-AI teaming</Text>. The AI may work solo or collaborate with agent Ngoc Linh.
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.tag}><Ionicons name="git-branch-outline" size={12} color="#64748B" /><Text style={styles.tagText}>Low × High Autonomy</Text></View>
          <View style={styles.tag}><Ionicons name="people-outline" size={12} color="#64748B" /><Text style={styles.tagText}>Solo × Team</Text></View>
        </View>

        <View style={styles.distributionBar}>
          {['#FFEDD5', '#FED7AA', '#FECACA', '#FCE7F3'].map((bg, i) => (
            <View key={i} style={[styles.distSegment, { flex: 1, backgroundColor: bg, borderTopLeftRadius: i === 0 ? 6 : 0, borderBottomLeftRadius: i === 0 ? 6 : 0, borderTopRightRadius: i === 3 ? 6 : 0, borderBottomRightRadius: i === 3 ? 6 : 0 }]}>
              <Text style={[styles.distText, { color: '#9A3412' }]}>25%</Text>
            </View>
          ))}
        </View>

        {activeStudy === 'study2' ? (
          <View style={[styles.loadingBtn, { borderColor: '#EA580C' }]}>
            <ActivityIndicator size="small" color="#EA580C" />
            <Text style={[styles.loadingText, { color: '#EA580C' }]}>
              {assignedLabel ? `Assigned: ${assignedLabel}` : 'Randomizing...'}
            </Text>
          </View>
        ) : s2Assigned ? (
          <TouchableOpacity style={[styles.startBtn, { backgroundColor: '#EA580C' }]} onPress={() => handleContinue('study2')}>
            <Ionicons name="play" size={16} color="#FFF" />
            <Text style={styles.startBtnText}>Continue Study 2</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: '#0F172A' }]}
            onPress={() => handleStudyStart('study2')}
            disabled={activeStudy !== null}
          >
            <Ionicons name="shuffle-outline" size={16} color="#FFF" />
            <Text style={styles.startBtnText}>Begin Study 2</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Info Footer */}
      <View style={styles.infoFooter}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" />
        <Text style={styles.footerText}>
          Research prototype • Balanced random assignment
        </Text>
      </View>

      {/* Dashboard Quick Access */}
      <TouchableOpacity 
        style={styles.dashboardLink} 
        onPress={() => router.push('/dashboard')}
        activeOpacity={0.7}
      >
        <Ionicons name="analytics-outline" size={16} color="#4F46E5" />
        <Text style={styles.dashboardLinkText}>Open Analytics Dashboard</Text>
        <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingBottom: 48,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  hero: { alignItems: 'center', marginBottom: 28, gap: 12 },
  logoBadge: {
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
    backgroundColor: '#0F172A', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 14,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 3,
  },
  logoMark: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', fontFamily: APPLE_FONT, letterSpacing: -0.8 },
  logoDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#3B82F6' },
  heroTitle: {
    fontSize: 32, fontWeight: '900', color: '#0F172A', fontFamily: APPLE_FONT,
    letterSpacing: -1, textAlign: 'center', lineHeight: 38,
  },
  heroSub: {
    fontSize: 14, color: '#64748B', fontWeight: '500', fontFamily: APPLE_FONT,
    textAlign: 'center', lineHeight: 22, paddingHorizontal: 8,
  },
  bold: { fontWeight: '800', color: '#0F172A' },

  studyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, marginBottom: 16,
    gap: 14, borderWidth: 0.5, borderColor: '#E2E8F0',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  studyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 0.5,
  },
  studyDot: { width: 6, height: 6, borderRadius: 3 },
  studyBadgeText: { fontSize: 11, fontWeight: '800', fontFamily: APPLE_FONT, textTransform: 'uppercase', letterSpacing: 0.5 },
  scenarioCount: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  scenarioCountText: { fontSize: 10, fontWeight: '700', color: '#64748B', fontFamily: APPLE_FONT },
  cardTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', fontFamily: APPLE_FONT, letterSpacing: -0.5 },
  cardDesc: { fontSize: 13, color: '#64748B', fontWeight: '500', fontFamily: APPLE_FONT, lineHeight: 20 },
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 0.5, borderColor: '#E2E8F0',
  },
  tagText: { fontSize: 11, fontWeight: '700', color: '#475569', fontFamily: APPLE_FONT },
  distributionBar: { flexDirection: 'row', gap: 2, height: 26, borderRadius: 6 },
  distSegment: { alignItems: 'center', justifyContent: 'center' },
  distText: { fontSize: 9, fontWeight: '800', fontFamily: APPLE_FONT },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 50, borderRadius: 14,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 3,
  },
  startBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', fontFamily: APPLE_FONT },
  loadingBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 50, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1.5,
  },
  loadingText: { fontSize: 13, fontWeight: '700', fontFamily: APPLE_FONT },

  infoFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingTop: 12, marginBottom: 10,
  },
  footerText: { fontSize: 11, color: '#94A3B8', fontWeight: '600', fontFamily: APPLE_FONT },
  
  dashboardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  dashboardLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
    fontFamily: APPLE_FONT,
  },
});
