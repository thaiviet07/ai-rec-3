import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';

interface WalletHeaderProps {
  scenarioLabel: string;
  scenarioColor: string;
}

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export default function WalletHeader({ scenarioLabel, scenarioColor }: WalletHeaderProps) {
  const { walletBalance, resetWallet } = useAppStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.04, duration: 160, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [pulseAnim, walletBalance]);

  const handleReset = () => {
    Alert.alert('Reset Wallet', 'Reset balance to $1,000.00 and clear history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetWallet },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandBlock}>
        {/* Apple Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Back to home">
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.logoTile}>
          <Text style={styles.logoText}>onmi</Text>
          <View style={styles.logoDot} />
        </View>
        <View style={[styles.brandMark, { backgroundColor: scenarioColor + '12', borderColor: scenarioColor + '30' }]}>
          <Text style={[styles.brandMarkText, { color: scenarioColor }]}>{scenarioLabel}</Text>
        </View>
      </View>

      <View style={styles.rightCluster}>
        <Animated.View style={[styles.walletBlock, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.walletIconWrap}>
            <Ionicons name="wallet-outline" size={13} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.balanceLabel}>onmi Cash</Text>
            <Text style={styles.balanceAmount}>${walletBalance.toFixed(2)}</Text>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} accessibilityLabel="Reset wallet">
          <Ionicons name="refresh-outline" size={16} color="#64748B" />
        </TouchableOpacity>

        {/* Apple settings cog button */}
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')} accessibilityLabel="Open chat settings">
          <Ionicons name="settings-outline" size={16} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5, // Thin Apple Border
    borderBottomColor: '#E2E8F0',
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginRight: 2,
  },
  logoTile: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1.5,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800', // Apple Bold
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.8,
  },
  logoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
  brandMark: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  brandMarkText: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: APPLE_FONT,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  walletIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  balanceLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: APPLE_FONT,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  resetBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  settingsBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
});
