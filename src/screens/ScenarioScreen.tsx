import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import ChatBubble, { ChatMessage } from '../components/ChatBubble';
import ProductCard from '../components/ProductCard';
import ThinkingIndicator from '../components/ThinkingIndicator';
import WalletHeader from '../components/WalletHeader';
import { callShoppingAI, ScenarioId } from '../services/aiService';
import { useAppStore } from '../store/useAppStore';
import catalog from '../catalog.json';
import { logToKnack } from '../services/knackService';

export interface ScenarioConfig {
  id: ScenarioId;
  label: string;
  description: string;
  accentColor: string;
  autonomy: 'High' | 'Low';
  teaming: boolean;
  agentName?: string;
  systemLabel: string;
}

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

const SCENARIO_CONFIGS: Record<ScenarioId, ScenarioConfig> = {
  // ====== ORIGINAL SCENARIOS (backward compatible) ======
  S1: {
    id: 'S1',
    label: 'S1',
    description: 'onmi auto-purchases with agent Ngoc Linh review',
    accentColor: '#0F172A',
    autonomy: 'High',
    teaming: true,
    agentName: 'onmi + Ngoc Linh',
    systemLabel: 'High Autonomy + Teaming',
  },
  S2: {
    id: 'S2',
    label: 'S2',
    description: 'onmi auto-purchases independently',
    accentColor: '#1E3A8A',
    autonomy: 'High',
    teaming: false,
    agentName: 'onmi Autonomous',
    systemLabel: 'High Autonomy + No Team',
  },
  S3: {
    id: 'S3',
    label: 'S3',
    description: 'onmi recommends, Ngoc Linh assists',
    accentColor: '#2563EB',
    autonomy: 'Low',
    teaming: true,
    agentName: 'onmi + Ngoc Linh',
    systemLabel: 'Low Autonomy + Teaming',
  },
  S4: {
    id: 'S4',
    label: 'S4',
    description: 'onmi recommends, you decide',
    accentColor: '#0EA5E9',
    autonomy: 'Low',
    teaming: false,
    agentName: 'onmi AI',
    systemLabel: 'Low Autonomy + No Team',
  },

  // ====== STUDY 1: Autonomy Only (No Teaming) ======
  S1_LOW: {
    id: 'S1_LOW',
    label: 'Study 1 — Low',
    description: 'onmi recommends, you decide',
    accentColor: '#0EA5E9',
    autonomy: 'Low',
    teaming: false,
    agentName: 'onmi AI',
    systemLabel: 'Low Autonomy',
  },
  S1_HIGH: {
    id: 'S1_HIGH',
    label: 'Study 1 — High',
    description: 'onmi auto-purchases independently',
    accentColor: '#0F172A',
    autonomy: 'High',
    teaming: false,
    agentName: 'onmi Autonomous',
    systemLabel: 'High Autonomy',
  },

  // ====== STUDY 2: Autonomy × Teaming (2×2) ======
  S2_HL: {
    id: 'S2_HL',
    label: 'Study 2 — HL',
    description: 'onmi auto-purchases independently',
    accentColor: '#1E3A8A',
    autonomy: 'High',
    teaming: false,
    agentName: 'onmi Autonomous',
    systemLabel: 'High Autonomy + No Team',
  },
  S2_HH: {
    id: 'S2_HH',
    label: 'Study 2 — HH',
    description: 'onmi auto-purchases with agent Ngoc Linh review',
    accentColor: '#0F172A',
    autonomy: 'High',
    teaming: true,
    agentName: 'onmi + Ngoc Linh',
    systemLabel: 'High Autonomy + Teaming',
  },
  S2_LL: {
    id: 'S2_LL',
    label: 'Study 2 — LL',
    description: 'onmi recommends, you decide',
    accentColor: '#0EA5E9',
    autonomy: 'Low',
    teaming: false,
    agentName: 'onmi AI',
    systemLabel: 'Low Autonomy + No Team',
  },
  S2_LH: {
    id: 'S2_LH',
    label: 'Study 2 — LH',
    description: 'onmi recommends, Ngoc Linh assists',
    accentColor: '#2563EB',
    autonomy: 'Low',
    teaming: true,
    agentName: 'onmi + Ngoc Linh',
    systemLabel: 'Low Autonomy + Teaming',
  },
};

interface DecisionState {
  messageId: string;
  productId: string;
  actionType: 'recommend_only' | 'auto_purchase';
  matchReasons: string[];
  confirmed: boolean;
  autoPurchased: boolean;
}

interface ScenarioScreenProps {
  scenarioId: ScenarioId;
}

export default function ScenarioScreen({ scenarioId }: ScenarioScreenProps) {
  const config = SCENARIO_CONFIGS[scenarioId];
  const { walletBalance, apiKey, deductFunds, addConfirmedTransaction, budgetLimit, sessionId } = useAppStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I am onmi, your AI shopping assistant. What are you looking to buy today?',
      timestamp: new Date(),
    },
  ]);
  const [decisions, setDecisions] = useState<DecisionState[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const voicePulseAnim = useRef(new Animated.Value(1)).current;

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isVoiceListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(voicePulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          Animated.timing(voicePulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      voicePulseAnim.setValue(1);
    }
  }, [isVoiceListening, voicePulseAnim]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = { ...msg, id: Date.now().toString() + Math.random(), timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    scrollToBottom();
    return newMsg.id;
  }, [scrollToBottom]);

  const handleSend = useCallback(async (forcedText?: string) => {
    const text = (forcedText || inputText).trim();
    if (!text || isLoading) return;

    if (!apiKey) {
      addMessage({
        role: 'assistant',
        content: 'Please configure your OpenAI API key in Settings first.',
      });
      return;
    }

    setInputText('');
    addMessage({ role: 'user', content: text });
    
    const studyType = scenarioId.startsWith('S2_') || ['S2', 'S3', 'S4'].includes(scenarioId) ? 'study2' : 'study1';
    
    if (sessionId) {
      logToKnack({
        sessionId,
        study: studyType,
        scenario: scenarioId,
        autonomyLevel: config.autonomy,
        teaming: config.teaming,
        eventType: 'MESSAGE_SENT',
        details: {
          text,
          charCount: text.length,
          wordCount: text.split(/\s+/).length,
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const decision = await callShoppingAI(text, scenarioId, walletBalance, apiKey);
      const product = catalog.find((p) => p.id === decision.matched_product_id);

      if (!product) {
        addMessage({
          role: 'assistant',
          content: "I couldn't find an exact match in the catalog. Try explaining the style or color differently!",
        });
        setIsLoading(false);
        return;
      }

      let targetActionType = decision.action_type;
      let isGuardIntercepted = false;

      if (decision.action_type === 'auto_purchase' && product.price > budgetLimit) {
        targetActionType = 'recommend_only';
        isGuardIntercepted = true;
      }

      const studyType = scenarioId.startsWith('S2_') || ['S2', 'S3', 'S4'].includes(scenarioId) ? 'study2' : 'study1';
      const msgId = addMessage({ role: 'assistant', content: decision.ai_message });
      
      if (sessionId) {
        logToKnack({
          sessionId,
          study: studyType,
          scenario: scenarioId,
          autonomyLevel: config.autonomy,
          teaming: config.teaming,
          eventType: 'MESSAGE_RECEIVED',
          details: {
            aiMessage: decision.ai_message,
            actionType: targetActionType,
            matchedProductId: product.id,
            matchedPrice: product.price,
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (isGuardIntercepted) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        addMessage({
          role: 'system',
          content: `⚠️ Wallet Guard Intercepted: Auto-purchase of "${product.name}" ($${product.price}) is blocked because it exceeds your safety budget limit of $${budgetLimit}. Converted to review only.`,
        });

        if (sessionId) {
          logToKnack({
            sessionId,
            study: studyType,
            scenario: scenarioId,
            autonomyLevel: config.autonomy,
            teaming: config.teaming,
            eventType: 'DECISION_ACTION',
            details: {
              action: 'GUARD_BLOCKED',
              productId: product.id,
              price: product.price,
              walletBalanceAfter: walletBalance,
            },
            timestamp: new Date().toISOString(),
          });
        }

        setDecisions((prev) => [
          ...prev,
          {
            messageId: msgId,
            productId: product.id,
            actionType: 'recommend_only',
            matchReasons: decision.match_reasons,
            confirmed: false,
            autoPurchased: false,
          },
        ]);
      } else if (targetActionType === 'auto_purchase') {
        setIsProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 2200));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsProcessing(false);

        deductFunds(product.price, {
          productId: product.id,
          productName: product.name,
          amount: product.price,
          scenario: scenarioId,
          actionType: 'auto_purchase',
        });
        
        if (sessionId) {
          logToKnack({
            sessionId,
            study: studyType,
            scenario: scenarioId,
            autonomyLevel: config.autonomy,
            teaming: config.teaming,
            eventType: 'DECISION_ACTION',
            details: {
              action: 'AUTO_PURCHASED',
              productId: product.id,
              price: product.price,
              walletBalanceAfter: Math.max(0, walletBalance - product.price),
            },
            timestamp: new Date().toISOString(),
          });
        }

        setDecisions((prev) => [
          ...prev,
          {
            messageId: msgId,
            productId: product.id,
            actionType: 'auto_purchase',
            matchReasons: decision.match_reasons,
            confirmed: false,
            autoPurchased: true,
          },
        ]);

        const purchaseStatusMsg = config.teaming
          ? `Purchase completed automatically by AI with human-agent review. New balance updated to $${Math.max(0, walletBalance - product.price).toFixed(2)}.`
          : `Purchase completed automatically by AI. New balance updated to $${Math.max(0, walletBalance - product.price).toFixed(2)}.`;
        
        addMessage({
          role: 'system',
          content: purchaseStatusMsg,
        });
      } else {
        setDecisions((prev) => [
          ...prev,
          {
            messageId: msgId,
            productId: product.id,
            actionType: 'recommend_only',
            matchReasons: decision.match_reasons,
            confirmed: false,
            autoPurchased: false,
          },
        ]);

        addMessage({
          role: 'system',
          content: `User confirmation needed. Your wallet balance will be updated to $${Math.max(0, walletBalance - product.price).toFixed(2)} only if you approve the purchase.`,
        });
      }
    } catch (err: any) {
      addMessage({
        role: 'assistant',
        content: `Error: ${err.message || 'Connection failed. Please check your API key and try again.'}`,
      });
    }

    setIsLoading(false);
    scrollToBottom();
  }, [inputText, isLoading, apiKey, walletBalance, scenarioId, addMessage, deductFunds, budgetLimit]);

  const handleVoiceInput = () => {
    if (isLoading || isVoiceListening) return;
    setIsVoiceListening(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const queries = [
      'Search for casual sneakers under $150',
      'I need a warm winter coat in blue',
      'Find me a premium leather jacket',
      'Show me some stylish backpacks',
    ];
    const phrase = queries[Math.floor(Math.random() * queries.length)];

    setTimeout(() => {
      setIsVoiceListening(false);
      setInputText(phrase);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  };

  const handlePickImage = (productName: string) => {
    setShowImagePicker(false);
    handleSend(`I would like to purchase the ${productName}`);
  };

  const handleConfirm = useCallback(
    async (decisionIdx: number) => {
      const decision = decisions[decisionIdx];
      const product = catalog.find((p) => p.id === decision.productId);
      if (!product) return;

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addConfirmedTransaction({
        productId: product.id,
        productName: product.name,
        amount: product.price,
        scenario: scenarioId,
        actionType: 'confirmed',
      });

      setDecisions((prev) =>
        prev.map((d, i) => (i === decisionIdx ? { ...d, confirmed: true } : d))
      );

      addMessage({
        role: 'system',
        content: `Order successfully placed. Wallet updated: -$${product.price.toFixed(2)}`,
      });
      
      const studyType = scenarioId.startsWith('S2_') || ['S2', 'S3', 'S4'].includes(scenarioId) ? 'study2' : 'study1';
      if (sessionId) {
        logToKnack({
          sessionId,
          study: studyType,
          scenario: scenarioId,
          autonomyLevel: config.autonomy,
          teaming: config.teaming,
          eventType: 'DECISION_ACTION',
          details: {
            action: 'CONFIRMED',
            productId: product.id,
            price: product.price,
            walletBalanceAfter: Math.max(0, walletBalance - product.price),
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
    [decisions, scenarioId, addConfirmedTransaction, addMessage]
  );

  const handleDecline = useCallback(
    async (decisionIdx: number) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const declinedDecision = decisions[decisionIdx];
      const declinedProduct = catalog.find((p) => p.id === declinedDecision.productId);

      setDecisions((prev) =>
        prev.map((d, i) => (i === decisionIdx ? { ...d, confirmed: false } : d))
      );
      
      const studyType = scenarioId.startsWith('S2_') || ['S2', 'S3', 'S4'].includes(scenarioId) ? 'study2' : 'study1';
      if (sessionId) {
        logToKnack({
          sessionId,
          study: studyType,
          scenario: scenarioId,
          autonomyLevel: config.autonomy,
          teaming: config.teaming,
          eventType: 'DECISION_ACTION',
          details: {
            action: 'DECLINED',
            productId: declinedProduct?.id,
            price: declinedProduct?.price,
            walletBalanceAfter: walletBalance,
          },
          timestamp: new Date().toISOString(),
        });
      }

      addMessage({
        role: 'system',
        content: `Alternative requested for "${declinedProduct?.name}". Searching catalog...`,
      });

      setIsLoading(true);
      scrollToBottom();

      // Premium animation wait
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // Find alternative items in the same category
      const options = catalog.filter((p) => p.id !== declinedProduct?.id);
      if (options.length === 0) {
        addMessage({
          role: 'assistant',
          content: `No other products matching your criteria are currently available in the catalog.`,
        });
        setIsLoading(false);
        scrollToBottom();
        return;
      }

      const altProduct = options[Math.floor(Math.random() * options.length)];

      const msgId = addMessage({
        role: 'assistant',
        content: `I found a highly-rated alternative: the ${altProduct.name}. It costs $${altProduct.price.toFixed(2)}. Let me know if you would like me to propose or purchase this option!`,
      });

      setDecisions((prev) => [
        ...prev,
        {
          messageId: msgId,
          productId: altProduct.id,
          actionType: 'recommend_only',
          matchReasons: [
            'Similar category alternative option',
            'Within your budget limits',
            'Offers beautiful clean styling matches',
          ],
          confirmed: false,
          autoPurchased: false,
        },
      ]);

      setIsLoading(false);
      scrollToBottom();
    },
    [decisions, addMessage, scrollToBottom]
  );

  const renderContent = () => {
    const items: React.ReactNode[] = [];

    messages.forEach((msg) => {
      items.push(
        <ChatBubble
          key={msg.id}
          message={msg}
          agentName={config.agentName}
          accentColor={config.accentColor}
        />
      );

      const decisionIdx = decisions.findIndex((d) => d.messageId === msg.id);
      if (decisionIdx !== -1) {
        const d = decisions[decisionIdx];
        const product = catalog.find((p) => p.id === d.productId);
        if (product) {
          items.push(
            <ProductCard
              key={`card-${d.messageId}`}
              product={product as any}
              matchReasons={d.matchReasons}
              actionType={d.actionType}
              confirmed={d.confirmed}
              autoPurchased={d.autoPurchased}
              accentColor={config.accentColor}
              onConfirm={() => handleConfirm(decisionIdx)}
              onDecline={() => handleDecline(decisionIdx)}
            />
          );
        }
      }
    });

    return items;
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 24}
      >
        {/* Sticky Live Wallet & Scenario Header */}
        <WalletHeader scenarioLabel={config.label} scenarioColor={config.accentColor} />

        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {renderContent()}
          {messages.length === 1 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsHeader}>Suggested Task</Text>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => {
                  handleSend("I'm looking for a brown jacket, size M, budget under $50. Find something versatile that fits my usual style and handle the purchase if it's a perfect match.");
                }}
                activeOpacity={0.7}
              >
                <View style={styles.suggestionBadge}>
                  <Ionicons name="sparkles" size={13} color="#2563EB" />
                  <Text style={styles.suggestionBadgeText}>Tap to auto-send prompt</Text>
                </View>
                <Text style={styles.suggestionText}>
                  "I'm looking for a brown jacket, size M, budget under $50. Find something versatile that fits my usual style and handle the purchase if it's a perfect match."
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {isLoading && !isProcessing && <ThinkingIndicator />}
          {isProcessing && (
            <View style={[styles.processingBox, { borderColor: config.accentColor + '20' }]}>
              <ActivityIndicator color={config.accentColor} size="small" />
              <Text style={[styles.processingText, { color: config.accentColor }]}>
                Processing payment secure flow...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Improved Premium Input Area */}
        <View
          style={[
            styles.inputBar,
            isInputFocused && {
              borderColor: '#2563EB',
              shadowColor: '#2563EB',
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 3,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.inputIconButton}
            accessibilityLabel="Attach product image"
            onPress={() => setShowImagePicker(true)}
          >
            <Ionicons name="image-outline" size={20} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.inputDivider} />
          <TextInput
            ref={inputRef}
            nativeID="shopping-assistant-message"
            accessibilityLabel="Message your shopping assistant"
            style={styles.input}
            placeholder="Search products or ask onmi..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            multiline
            maxLength={300}
            returnKeyType="send"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          <TouchableOpacity
            style={styles.inputIconButton}
            accessibilityLabel="Voice input"
            onPress={handleVoiceInput}
          >
            <Ionicons name="mic-outline" size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputText.trim() ? '#2563EB' : '#F1F5F9',
              },
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={inputText.trim() ? '#FFFFFF' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Visual Image Visual Search Picker Modal */}
      <Modal visible={showImagePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>onmi Visual Search Library</Text>
              <TouchableOpacity onPress={() => setShowImagePicker(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Simulate uploading a product picture. Select an item to perform search processing.
            </Text>
            
            <FlatList
              data={catalog}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.modalGridWrapper}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.pickerItem} onPress={() => handlePickImage(item.name)}>
                  <Image source={{ uri: item.image_url }} style={styles.pickerImg} resizeMode="cover" />
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.pickerPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Pulsing Mic Voice Listening Overlay */}
      {isVoiceListening && (
        <View style={styles.voiceOverlay}>
          <Animated.View style={[styles.voicePulseBubble, { transform: [{ scale: voicePulseAnim }] }]}>
            <Ionicons name="mic" size={36} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.voiceTitleText}>onmi Voice Search</Text>
          <Text style={styles.voiceSubtitleText}>Listening to your voice inputs...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  processingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    marginVertical: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  processingText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: APPLE_FONT,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
    minHeight: 54,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  inputIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  inputDivider: {
    width: 0.5,
    height: 20,
    backgroundColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 8,
    color: '#0F172A',
    fontSize: 16, // Prevent mobile browsers (especially Safari) from auto-zooming on focus
    fontFamily: APPLE_FONT,
    lineHeight: 20,
    maxHeight: 80,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Sleek blur overlay background
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    gap: 12,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.4,
  },
  closeModalBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 6,
    fontWeight: '500',
    fontFamily: APPLE_FONT,
  },
  modalGridWrapper: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  pickerItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  pickerImg: {
    width: '100%',
    height: 90,
  },
  pickerInfo: {
    padding: 8,
    gap: 1,
  },
  pickerName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
  },
  pickerPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: APPLE_FONT,
  },
  voiceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    zIndex: 9999,
  },
  voicePulseBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  voiceTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.4,
  },
  voiceSubtitleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: APPLE_FONT,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  suggestionsHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: APPLE_FONT,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  suggestionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: APPLE_FONT,
  },
  suggestionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 20,
    fontFamily: APPLE_FONT,
  },
});
