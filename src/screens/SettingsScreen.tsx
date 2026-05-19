import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

export default function SettingsScreen() {
  const { apiKey, setApiKey, walletBalance, transactionHistory, resetWallet, currentScenario, setCurrentScenario, budgetLimit, setBudgetLimit } = useAppStore();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const scenarios = [
    { id: 'S1' as const, title: 'High Autonomy + Team', autonomy: 'AUTO', desc: 'onmi purchases with Ngoc Linh review' },
    { id: 'S2' as const, title: 'High Autonomy', autonomy: 'AUTO', desc: 'onmi purchases independently' },
    { id: 'S3' as const, title: 'Low Autonomy + Team', autonomy: 'CO-PILOT', desc: 'onmi recommends with Ngoc Linh assists' },
    { id: 'S4' as const, title: 'Low Autonomy', autonomy: 'CO-PILOT', desc: 'onmi recommends, you decide' },
  ];

  const handleSave = () => {
    setApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    Alert.alert('Reset Wallet', 'Reset balance to $1,000.00 and clear all transaction history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetWallet();
          Alert.alert('Done', 'onmi Wallet has been reset.');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Settings Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="options-outline" size={20} color="#0F172A" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Preferences</Text>
          <Text style={styles.headerSubtitle}>onmi system settings</Text>
        </View>
      </View>

      {/* Anthropic Key Config */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anthropic API Key</Text>
        <Text style={styles.sectionDesc}>
          Your key is saved locally in encrypted on-device storage. It is only utilized directly with the official Anthropic API endpoint.
        </Text>
        <View style={styles.keyRow}>
          <TextInput
            nativeID="anthropic-api-key"
            accessibilityLabel="Anthropic API key"
            style={styles.keyInput}
            value={keyInput}
            onChangeText={setKeyInput}
            placeholder="sk-ant-..."
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowKey(!showKey)} accessibilityLabel="Show or hide API key">
            <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.saveBtn, saved && styles.savedBtn]} onPress={handleSave}>
          <Ionicons name={saved ? 'checkmark-circle-outline' : 'save-outline'} size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>{saved ? 'Saved Successfully' : 'Apply Key'}</Text>
        </TouchableOpacity>
      </View>

      {/* Active Autonomy Scenario Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active AI Autonomy Scenario</Text>
        <Text style={styles.sectionDesc}>
          Select the active onmi framework. This determines whether onmi makes autonomous purchases or requests confirmations.
        </Text>
        <View style={styles.scenarioGrid}>
          {scenarios.map((sc) => {
            const active = currentScenario === sc.id;
            return (
              <TouchableOpacity
                key={sc.id}
                style={[
                  styles.scenarioBtn,
                  active && styles.scenarioBtnActive,
                ]}
                onPress={() => setCurrentScenario(sc.id)}
              >
                <View style={styles.scenarioTop}>
                  <Text style={[styles.scenarioLabel, active && styles.scenarioTextActive]}>{sc.id}</Text>
                  <View style={[styles.autonomyBadge, active ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={[styles.autonomyBadgeText, active && styles.badgeTextActive]}>{sc.autonomy}</Text>
                  </View>
                </View>
                <Text style={[styles.scenarioTitleText, active && styles.scenarioTextActive]}>{sc.title}</Text>
                <Text style={[styles.scenarioDescText, active && styles.scenarioDescActive]}>{sc.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Wallet Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>onmi Cash Balance & Wallet Guard</Text>
        <View style={styles.balanceCard}>
          <View style={styles.walletIcon}>
            <Ionicons name="card-outline" size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.balanceLabel}>Available Funds</Text>
            <Text style={styles.balanceAmt}>${walletBalance.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={14} color="#64748B" />
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Limit Segmented Picker */}
        <View style={styles.budgetLimitBox}>
          <View style={styles.budgetHeader}>
            <Ionicons name="shield-outline" size={15} color="#2563EB" />
            <Text style={styles.budgetTitleText}>Wallet Guard Autonomy Limit</Text>
            <Text style={styles.budgetValueText}>${budgetLimit.toFixed(0)}</Text>
          </View>
          <Text style={styles.budgetDescText}>
            Autonomous auto-purchases exceeding this cap are automatically converted into manual recommendations for safety.
          </Text>
          <View style={styles.budgetGrid}>
            {[100, 200, 300, 500].map((val) => {
              const active = budgetLimit === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[styles.budgetChip, active && styles.budgetChipActive]}
                  onPress={() => setBudgetLimit(val)}
                >
                  <Text style={[styles.budgetChipText, active && styles.budgetChipTextActive]}>
                    ${val} Limit
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Transactions History Log */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Purchase Activity Log ({transactionHistory.length})</Text>
        {transactionHistory.length === 0 ? (
          <View style={styles.emptyTx}>
            <Ionicons name="receipt-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyTxText}>No purchase activity logged</Text>
          </View>
        ) : (
          transactionHistory.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={[
                styles.txIcon,
                { backgroundColor: tx.actionType === 'confirmed' ? '#ECFDF5' : '#EFF6FF' },
              ]}>
                <Ionicons
                  name={tx.actionType === 'auto_purchase' ? 'flash' :
                    tx.actionType === 'confirmed' ? 'checkmark' : 'bag'}
                  size={14}
                  color={tx.actionType === 'confirmed' ? '#059669' : '#2563EB'}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txName}>{tx.productName}</Text>
                <Text style={styles.txMeta}>
                  {tx.scenario} • {tx.actionType.replace('_', ' ')} •{' '}
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.txAmount}>-${tx.amount.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>

      {/* About Box */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>onmi AI Shopping Companion</Text>
          <Text style={styles.aboutText}>
            onmi is an experimental interface exploring next-generation paradigms in human-AI teaming and user reactions to strict autonomous decision agents.
          </Text>
          <View style={styles.modelBadge}>
            <Ionicons name="sparkles" size={12} color="#2563EB" />
            <Text style={styles.modelText}>claude-haiku-4.5 • Strict Tool Calling</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '850',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionDesc: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    paddingRight: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  keyInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  savedBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  walletIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  balanceLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  balanceAmt: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    minHeight: 36,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyTx: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTxText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '850',
  },
  txMeta: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
  aboutBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aboutTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
  },
  aboutText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  modelText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  scenarioBtn: {
    width: '48%',
    minHeight: 110,
    borderRadius: 18,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  scenarioBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  scenarioTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scenarioLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  scenarioTextActive: {
    color: '#FFFFFF',
  },
  autonomyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  badgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  autonomyBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#475569',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  scenarioTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  scenarioDescText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  scenarioDescActive: {
    color: '#94A3B8',
  },
  budgetLimitBox: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  budgetTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  budgetValueText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  budgetDescText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
    marginBottom: 10,
    fontWeight: '500',
  },
  budgetGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  budgetChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  budgetChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  budgetChipTextActive: {
    color: '#FFFFFF',
  },
});
