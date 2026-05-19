import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import catalog from '../src/catalog.json';

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export default function SmartAssistant() {
  const router = useRouter();
  const { walletBalance, budgetLimit } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<'outfit' | 'compare' | 'budget'>('outfit');

  // Segregate catalog items for vertical slots
  const accItems = catalog.filter((p) => p.category === 'accessories');
  const topItems = catalog.filter((p) => p.category === 'outerwear' || p.category === 'tops');
  const bottomItems = catalog.filter((p) => p.category === 'bottoms');
  const shoesItems = catalog.filter((p) => p.category === 'footwear');

  // Pre-select first item of each so there is always a default outfit
  const [selectedAcc, setSelectedAcc] = useState(accItems[0]?.id || '');
  const [selectedTop, setSelectedTop] = useState(topItems[0]?.id || '');
  const [selectedBottom, setSelectedBottom] = useState(bottomItems[0]?.id || '');
  const [selectedShoes, setSelectedShoes] = useState(shoesItems[0]?.id || '');

  const [generatedOutfit, setGeneratedOutfit] = useState<any>(null);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);

  // Tab 2 State: Compare Products
  const [compareProductA, setCompareProductA] = useState<string>(catalog[0]?.id || '');
  const [compareProductB, setCompareProductB] = useState<string>(catalog[1]?.id || '');

  // Tab 3 State: Budget analysis
  const [simulatePrice, setSimulatePrice] = useState('');
  const [simulateResult, setSimulateResult] = useState<string | null>(null);

  const handleGenerateOutfit = async () => {
    setIsGeneratingOutfit(true);
    setGeneratedOutfit(null);
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const selectedProducts = catalog.filter((p) =>
      [selectedAcc, selectedTop, selectedBottom, selectedShoes].includes(p.id)
    );
    
    const score = Math.floor(Math.random() * 15) + 85; // 85% to 99% match
    const colors = Array.from(new Set(selectedProducts.map((p) => p.color[0]))).join(' and ');

    setGeneratedOutfit({
      score,
      verdict: `A stunning combination matching your modern techwear profile. The colors of ${colors} provide an excellent organic visual contrast, while the functional alignment between the outer shell, bottoms, and footwear matches current styling trends perfectly!`,
      products: selectedProducts,
    });
    setIsGeneratingOutfit(false);
  };

  const handleSimulateSpend = () => {
    const price = parseFloat(simulatePrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price to simulate.');
      return;
    }

    if (price > budgetLimit) {
      setSimulateResult(
        `⚠️ Blocked: This purchase exceeds your active Wallet Guard safety cap of $${budgetLimit}. onmi recommends requesting manual confirmation or seeking alternative items below $${budgetLimit}.`
      );
    } else if (price > walletBalance) {
      setSimulateResult(
        `⚠️ Insufficient Cash: This item costs $${price.toFixed(2)} which exceeds your current onmi Cash balance of $${walletBalance.toFixed(2)}.`
      );
    } else {
      setSimulateResult(
        `✅ Approved: Safe to buy! This purchase matches your budget and will leave you with $${(walletBalance - price).toFixed(2)} of onmi Cash.`
      );
    }
  };

  const prodA = catalog.find((p) => p.id === compareProductA) || catalog[0];
  const prodB = catalog.find((p) => p.id === compareProductB) || catalog[1];

  return (
    <View style={styles.root}>
      {/* iOS Top Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>onmi Smart Assistant</Text>
        <View style={styles.placeholderBtn} />
      </View>

      {/* Sub Tabs Toggle Bar */}
      <View style={styles.tabToggleBar}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeSubTab === 'outfit' && styles.toggleActiveBtn]}
          onPress={() => setActiveSubTab('outfit')}
        >
          <Ionicons
            name="shirt-outline"
            size={15}
            color={activeSubTab === 'outfit' ? '#2563EB' : '#64748B'}
          />
          <Text style={[styles.toggleText, activeSubTab === 'outfit' && styles.toggleActiveText]}>
            Outfit Builder
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, activeSubTab === 'compare' && styles.toggleActiveBtn]}
          onPress={() => setActiveSubTab('compare')}
        >
          <Ionicons
            name="git-compare-outline"
            size={15}
            color={activeSubTab === 'compare' ? '#2563EB' : '#64748B'}
          />
          <Text style={[styles.toggleText, activeSubTab === 'compare' && styles.toggleActiveText]}>
            Compare
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, activeSubTab === 'budget' && styles.toggleActiveBtn]}
          onPress={() => setActiveSubTab('budget')}
        >
          <Ionicons
            name="pie-chart-outline"
            size={15}
            color={activeSubTab === 'budget' ? '#2563EB' : '#64748B'}
          />
          <Text style={[styles.toggleText, activeSubTab === 'budget' && styles.toggleActiveText]}>
            Wallet Guard
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          activeSubTab === 'outfit' && styles.scrollContentOutfitPadding,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: Outfit Builder (Gamified loot box stacked horizontal sliders) */}
        {activeSubTab === 'outfit' && (
          <View style={styles.moduleSection}>
            <Text style={styles.moduleTitle}>Slot-Machine Outfit Builder</Text>
            <Text style={styles.moduleDesc}>
              Swipe horizontally in each section to customize your look, then generate a style score!
            </Text>

            {/* 🧢 Headwear & Accessories Slot */}
            <View style={styles.slotContainer}>
              <Text style={styles.slotTitle}>🧢 HEADWEAR & ACCESSORIES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {accItems.map((item) => {
                  const isActive = selectedAcc === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.lootBoxCard, isActive && styles.lootBoxCardActive]}
                      onPress={() => setSelectedAcc(item.id)}
                    >
                      <Image source={{ uri: item.image_url }} style={styles.lootBoxImg} />
                      <View style={styles.lootBoxInfo}>
                        <Text style={styles.lootBoxName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.lootBoxPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                      {isActive && (
                        <View style={styles.activeCheck}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 🧥 Tops & Jackets Slot */}
            <View style={styles.slotContainer}>
              <Text style={styles.slotTitle}>🧥 TOPS & OUTERWEAR</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {topItems.map((item) => {
                  const isActive = selectedTop === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.lootBoxCard, isActive && styles.lootBoxCardActive]}
                      onPress={() => setSelectedTop(item.id)}
                    >
                      <Image source={{ uri: item.image_url }} style={styles.lootBoxImg} />
                      <View style={styles.lootBoxInfo}>
                        <Text style={styles.lootBoxName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.lootBoxPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                      {isActive && (
                        <View style={styles.activeCheck}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 👖 Bottoms & Pants Slot */}
            <View style={styles.slotContainer}>
              <Text style={styles.slotTitle}>👖 PANTS & BOTTOMS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {bottomItems.map((item) => {
                  const isActive = selectedBottom === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.lootBoxCard, isActive && styles.lootBoxCardActive]}
                      onPress={() => setSelectedBottom(item.id)}
                    >
                      <Image source={{ uri: item.image_url }} style={styles.lootBoxImg} />
                      <View style={styles.lootBoxInfo}>
                        <Text style={styles.lootBoxName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.lootBoxPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                      {isActive && (
                        <View style={styles.activeCheck}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 👟 Shoes & Footwear Slot */}
            <View style={styles.slotContainer}>
              <Text style={styles.slotTitle}>👟 FOOTWEAR & SHOES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {shoesItems.map((item) => {
                  const isActive = selectedShoes === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.lootBoxCard, isActive && styles.lootBoxCardActive]}
                      onPress={() => setSelectedShoes(item.id)}
                    >
                      <Image source={{ uri: item.image_url }} style={styles.lootBoxImg} />
                      <View style={styles.lootBoxInfo}>
                        <Text style={styles.lootBoxName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.lootBoxPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                      {isActive && (
                        <View style={styles.activeCheck}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Generated Outfit Result Card */}
            {generatedOutfit && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultScoreLabel}>Style Compatibility Score</Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{generatedOutfit.score}% MATCH</Text>
                  </View>
                </View>
                <Text style={styles.resultDesc}>{generatedOutfit.verdict}</Text>

                <View style={styles.resultRowItems}>
                  {generatedOutfit.products.map((p: any) => (
                    <View key={p.id} style={styles.resultThumbCard}>
                      <Image source={{ uri: p.image_url }} style={styles.resultThumbImg} />
                      <Text style={styles.resultThumbName} numberOfLines={1}>
                        {p.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: Compare Products */}
        {activeSubTab === 'compare' && (
          <View style={styles.moduleSection}>
            <Text style={styles.moduleTitle}>Product Comparison</Text>
            <Text style={styles.moduleDesc}>
              Select any two products from the library to compare features and see onmi's recommend winner!
            </Text>

            {/* Selectors */}
            <View style={styles.compareSelectors}>
              <View style={styles.selectorBlock}>
                <Text style={styles.selectLabel}>Product A</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollList}>
                  {catalog.map((item) => (
                    <TouchableOpacity
                      key={`a-${item.id}`}
                      style={[styles.smallCard, compareProductA === item.id && styles.smallCardActive]}
                      onPress={() => setCompareProductA(item.id)}
                    >
                      <Image source={{ uri: item.image_url }} style={styles.smallCardImg} />
                      <Text style={styles.smallCardText} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.selectorBlock}>
                <Text style={styles.selectLabel}>Product B</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollList}>
                  {catalog.map((item) => (
                    <TouchableOpacity
                      key={`b-${item.id}`}
                      style={[styles.smallCard, compareProductB === item.id && styles.smallCardActive]}
                      onPress={() => setCompareProductB(item.id)}
                    >
                      <Image source={{ uri: item.image_url }} style={styles.smallCardImg} />
                      <Text style={styles.smallCardText} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Comparison Table */}
            {prodA && prodB && (
              <View style={styles.comparisonTable}>
                {/* Header Row */}
                <View style={styles.tableRowHeader}>
                  <Text style={styles.tableColHeader}>Specs</Text>
                  <Text style={[styles.tableColHeader, styles.textBlue]} numberOfLines={1}>{prodA.name}</Text>
                  <Text style={[styles.tableColHeader, styles.textNavy]} numberOfLines={1}>{prodB.name}</Text>
                </View>

                {/* Price Row */}
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Price</Text>
                  <Text style={styles.tableValue}>${prodA.price.toFixed(2)}</Text>
                  <Text style={styles.tableValue}>${prodB.price.toFixed(2)}</Text>
                </View>

                {/* Category Row */}
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Category</Text>
                  <Text style={styles.tableValue}>{prodA.category}</Text>
                  <Text style={styles.tableValue}>{prodB.category}</Text>
                </View>

                {/* Color Row */}
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Color</Text>
                  <Text style={styles.tableValue}>{prodA.color[0]}</Text>
                  <Text style={styles.tableValue}>{prodB.color[0]}</Text>
                </View>

                {/* Tags Row */}
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Style tag</Text>
                  <Text style={styles.tableValue}>{prodA.tags[0]}</Text>
                  <Text style={styles.tableValue}>{prodB.tags[0]}</Text>
                </View>

                {/* onmi Recommended Verdict Box */}
                <View style={styles.verdictBox}>
                  <View style={styles.verdictTitleRow}>
                    <Ionicons name="sparkles" size={15} color="#2563EB" />
                    <Text style={styles.verdictTitle}>onmi AI Recommendation Verdict</Text>
                  </View>
                  <Text style={styles.verdictBodyText}>
                    {prodA.price < prodB.price
                      ? `We highly recommend "${prodA.name}" because it fits optimal pricing margins ($${prodA.price}) and provides excellent features for your techwear layout.`
                      : `We highly recommend "${prodB.name}" because it costs less ($${prodB.price}) and ranks exceptionally high in modern catalog style fits.`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: Wallet Guard */}
        {activeSubTab === 'budget' && (
          <View style={styles.moduleSection}>
            <Text style={styles.moduleTitle}>Wallet Guard Budget Advisor</Text>
            <Text style={styles.moduleDesc}>
              Analyze your current wallet context and simulate upcoming purchases to see safety ratings!
            </Text>

            {/* Financial Overview Card */}
            <View style={styles.overviewFinanceCard}>
              <View style={styles.financeRow}>
                <View>
                  <Text style={styles.financeLabel}>Available cash</Text>
                  <Text style={styles.financeAmount}>${walletBalance.toFixed(2)}</Text>
                </View>
                <View>
                  <Text style={styles.financeLabel}>Safety limit cap</Text>
                  <Text style={styles.financeAmount}>${budgetLimit.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.financeStatusRow}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
                <Text style={styles.financeStatusText}>
                  Wallet Guard limits are actively intercepting shopping decisions.
                </Text>
              </View>
            </View>

            {/* Simulate Spend Simulator */}
            <View style={styles.spendSimulatorCard}>
              <Text style={styles.simulateTitle}>Simulate Purchase Safety</Text>
              <Text style={styles.simulateDesc}>
                Enter the price of an item you wish to buy to analyze its budget rating instantly.
              </Text>

              <View style={styles.simulateInputRow}>
                <View style={styles.simulateInputWrap}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.simulateInput}
                    placeholder="250.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={simulatePrice}
                    onChangeText={setSimulatePrice}
                  />
                </View>
                <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulateSpend}>
                  <Text style={styles.simulateBtnText}>Simulate</Text>
                </TouchableOpacity>
              </View>

              {/* Simulation Result */}
              {simulateResult && (
                <View style={[styles.simulateResultBox, simulateResult.includes('Approved') ? styles.simulateSuccess : styles.simulateFailed]}>
                  <Text style={[styles.simulateResultText, simulateResult.includes('Approved') ? styles.textSuccess : styles.textFailed]}>
                    {simulateResult}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Gamified Stitched Score Button (replaces bottom nav area) */}
      {activeSubTab === 'outfit' && (
        <View style={styles.stitchedBottomBar}>
          <TouchableOpacity style={styles.stitchedBtn} onPress={handleGenerateOutfit} disabled={isGeneratingOutfit}>
            <Ionicons name="sparkles" size={15} color="#FFFFFF" />
            <Text style={styles.stitchedBtnText}>
              {isGeneratingOutfit ? 'Analyzing styling layers...' : 'Generate Style Score'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    paddingTop: Platform.OS === 'ios' ? 54 : 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.4,
  },
  placeholderBtn: {
    width: 36,
  },
  tabToggleBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  toggleActiveBtn: {
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
  },
  toggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: APPLE_FONT,
  },
  toggleActiveText: {
    color: '#2563EB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scrollContentOutfitPadding: {
    paddingBottom: 110,
  },
  moduleSection: {
    gap: 6,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.4,
  },
  moduleDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: APPLE_FONT,
    fontWeight: '500',
    marginBottom: 16,
  },
  slotContainer: {
    marginBottom: 16,
    gap: 8,
  },
  slotTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    fontFamily: APPLE_FONT,
  },
  horizontalScroll: {
    gap: 10,
    paddingRight: 16,
  },
  lootBoxCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  lootBoxCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  lootBoxImg: {
    width: '100%',
    height: 90,
  },
  lootBoxInfo: {
    padding: 8,
    gap: 1,
  },
  lootBoxName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
  },
  lootBoxPrice: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: APPLE_FONT,
  },
  activeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    gap: 12,
    marginTop: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultScoreLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
  },
  scoreBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: APPLE_FONT,
  },
  resultDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontFamily: APPLE_FONT,
    fontWeight: '500',
  },
  resultRowItems: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  resultThumbCard: {
    width: 60,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  resultThumbImg: {
    width: '100%',
    height: 48,
  },
  resultThumbName: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    padding: 3,
    textAlign: 'center',
  },
  compareSelectors: {
    gap: 16,
    marginBottom: 20,
  },
  selectorBlock: {
    gap: 8,
  },
  selectLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: APPLE_FONT,
  },
  horizontalScrollList: {
    flexDirection: 'row',
    gap: 8,
  },
  smallCard: {
    width: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 6,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 4,
  },
  smallCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  smallCardImg: {
    width: 76,
    height: 50,
    borderRadius: 6,
  },
  smallCardText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
    width: '100%',
    textAlign: 'center',
  },
  comparisonTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableColHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: APPLE_FONT,
  },
  textBlue: {
    color: '#2563EB',
  },
  textNavy: {
    color: '#0F172A',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tableLabel: {
    flex: 1,
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '700',
    fontFamily: APPLE_FONT,
  },
  tableValue: {
    flex: 1,
    fontSize: 11.5,
    color: '#0F172A',
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  verdictBox: {
    backgroundColor: '#EFF6FF',
    margin: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#DBEAFE',
    gap: 6,
  },
  verdictTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verdictTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: APPLE_FONT,
  },
  verdictBodyText: {
    fontSize: 11.5,
    color: '#1E3A8A',
    lineHeight: 16,
    fontFamily: APPLE_FONT,
    fontWeight: '500',
  },
  overviewFinanceCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financeLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: APPLE_FONT,
  },
  financeAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
    marginTop: 2,
  },
  financeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  financeStatusText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: APPLE_FONT,
    flex: 1,
  },
  spendSimulatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  simulateTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.2,
  },
  simulateDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: APPLE_FONT,
    fontWeight: '500',
  },
  simulateInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  simulateInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    height: 40,
  },
  currencyPrefix: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
    marginRight: 2,
  },
  simulateInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontFamily: APPLE_FONT,
    fontWeight: '700',
  },
  simulateBtn: {
    width: 90,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulateBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  simulateResultBox: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    marginTop: 6,
  },
  simulateSuccess: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  simulateFailed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  simulateResultText: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: APPLE_FONT,
  },
  textSuccess: {
    color: '#065F46',
  },
  textFailed: {
    color: '#991B1B',
  },
  stitchedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    zIndex: 100,
  },
  stitchedBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stitchedBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
});
