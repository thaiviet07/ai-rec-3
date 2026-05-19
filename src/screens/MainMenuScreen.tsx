import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

interface MainMenuScreenProps {
  onStartChat: () => void;
  onOpenSettings: () => void;
  onStartSmartAssistant?: () => void;
}

const PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80&auto=format&fit=crop';

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

const assistantCards = [
  {
    title: 'Smart Assistant',
    description: 'Finds outfits, compares products, and keeps budget context.',
    icon: 'sparkles-outline' as const,
    accent: '#2563EB',
  },
  {
    title: 'AI Shopping',
    description: 'Recommends items and prepares purchase decisions.',
    icon: 'bag-handle-outline' as const,
    accent: '#0EA5E9',
  },
  {
    title: 'Wallet Guard',
    description: 'Tracks balance, confirms spend, and logs transactions.',
    icon: 'wallet-outline' as const,
    accent: '#10B981',
  },
  {
    title: 'Task Manager',
    description: 'Turns shopping requests into quick action flows.',
    icon: 'checkbox-outline' as const,
    accent: '#F59E0B',
  },
];

export default function MainMenuScreen({ onStartChat, onOpenSettings, onStartSmartAssistant }: MainMenuScreenProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'cart'>('home');
  const { transactionHistory, cart, removeFromCart, walletBalance, clearCart, deductFunds } = useAppStore();

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (walletBalance < cartTotal) {
      Alert.alert('Insufficient Balance', 'Your wallet balance is insufficient to place this order.');
      return;
    }

    Alert.alert('Place Order', `Confirm purchase of ${cartItemsCount} items for $${cartTotal.toFixed(2)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          cart.forEach((item) => {
            deductFunds(item.product.price * item.quantity, {
              productId: item.product.id,
              productName: item.product.name,
              amount: item.product.price * item.quantity,
              scenario: 'S4',
              actionType: 'confirmed',
            });
          });
          clearCart();
          Alert.alert('Order Confirmed', 'Your products have been purchased successfully!');
        },
      },
    ]);
  };

  const renderActiveTabContent = () => {
    if (activeTab === 'history') {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.tabHeading}>Purchase History</Text>
          <Text style={styles.tabSubheading}>Review all onmi logs and manual shopping decisions.</Text>

          {transactionHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No transaction logs yet</Text>
              <Text style={styles.emptyDesc}>Purchased items and auto-buys will appear in this ledger.</Text>
            </View>
          ) : (
            <View style={styles.ledgerList}>
              {transactionHistory.map((tx) => {
                const isTeaming = tx.scenario === 'S1' || tx.scenario === 'S3';
                return (
                  <View key={tx.id} style={styles.ledgerCard}>
                    <View style={styles.ledgerTop}>
                      <View style={styles.ledgerItemInfo}>
                        <Text style={styles.ledgerItemTitle} numberOfLines={1}>
                          {tx.productName}
                        </Text>
                        <Text style={styles.ledgerTime}>
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.scenario}
                        </Text>
                      </View>
                      <Text style={styles.ledgerPrice}>-${tx.amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.ledgerBottom}>
                      {isTeaming ? (
                        <View style={styles.teamingAvatars}>
                          <View style={styles.avatarMiniOnmi}>
                            <Text style={styles.avatarMiniText}>o</Text>
                          </View>
                          <View style={styles.avatarMiniLinh}>
                            <Text style={styles.avatarMiniTextLinh}>NL</Text>
                          </View>
                          <Text style={styles.teamingLabel}>Ngoc Linh + onmi Co-contribute</Text>
                        </View>
                      ) : (
                        <View style={styles.singleAgent}>
                          <View style={styles.avatarMiniOnmi}>
                            <Text style={styles.avatarMiniText}>o</Text>
                          </View>
                          <Text style={styles.teamingLabel}>onmi AI Autonomous</Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.actionBadge,
                          tx.actionType === 'auto_purchase' ? styles.actionBadgeAuto : styles.actionBadgeManual,
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionBadgeText,
                            tx.actionType === 'auto_purchase' ? styles.actionBadgeTextAuto : styles.actionBadgeTextManual,
                          ]}
                        >
                          {tx.actionType === 'auto_purchase' ? 'Auto-Buy' : 'Approved'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      );
    }

    if (activeTab === 'cart') {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.tabHeading}>Shopping Cart</Text>
          <Text style={styles.tabSubheading}>Items saved from recommendations.</Text>

          {cart.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="cart-outline" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptyDesc}>Recommendations you add to cart will be saved here.</Text>
            </View>
          ) : (
            <View style={styles.cartContainer}>
              <View style={styles.cartList}>
                {cart.map((item) => (
                  <View key={item.product.id} style={styles.cartItemCard}>
                    <Image source={{ uri: item.product.image_url }} style={styles.cartItemImg} />
                    <View style={styles.cartItemDetails}>
                      <Text style={styles.cartItemName} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.cartItemPrice}>
                        ${item.product.price.toFixed(2)} x {item.quantity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cartItemDelete}
                      onPress={() => removeFromCart(item.product.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Checkout Card */}
              <View style={styles.checkoutCard}>
                <View style={styles.checkoutRow}>
                  <Text style={styles.checkoutLabel}>Order Total</Text>
                  <Text style={styles.checkoutVal}>${cartTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.checkoutRow}>
                  <Text style={styles.checkoutLabel}>onmi Cash Balance</Text>
                  <Text style={styles.checkoutVal}>${walletBalance.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.checkoutBtnText}>Checkout Securely</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      );
    }

    // Default 'home'
    return (
      <>
        {/* Hero Greeting */}
        <View style={styles.heroBlock}>
          <Text style={styles.greeting}>Hi, Arafat!</Text>
          <Text style={styles.subGreeting}>How can onmi assist you today?</Text>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={onStartChat}>
            <Text style={styles.primaryButtonText}>Start New Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} accessibilityLabel="Camera input">
            <Ionicons name="camera-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} accessibilityLabel="Attach file">
            <Ionicons name="attach-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} accessibilityLabel="Voice input">
            <Ionicons name="mic-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Bento Cards Grid */}
        <View style={styles.cardGrid}>
          {assistantCards.map((card) => (
            <TouchableOpacity
              key={card.title}
              style={styles.assistantCard}
              onPress={
                card.title === 'AI Shopping'
                  ? onStartChat
                  : card.title === 'Smart Assistant'
                  ? onStartSmartAssistant
                  : undefined
              }
              accessibilityLabel={card.title}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.cardIconTile, { backgroundColor: card.accent + '12' }]}>
                  <Ionicons name={card.icon} size={20} color={card.accent} />
                </View>
                <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.logoTile}>
            <Text style={styles.logoText}>onmi</Text>
            <View style={styles.logoDot} />
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity style={styles.avatarButton} accessibilityLabel="Open user profile">
              <Image source={{ uri: PROFILE_IMAGE }} style={styles.avatarImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onOpenSettings} accessibilityLabel="Open settings">
              <Ionicons name="menu-outline" size={23} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {renderActiveTabContent()}
      </ScrollView>

      {/* Elegant Capsule Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          accessibilityLabel="Home"
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={18}
            color={activeTab === 'home' ? '#2563EB' : '#475569'}
          />
          <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('history')}
          accessibilityLabel="Purchase History"
        >
          <Ionicons
            name={activeTab === 'history' ? 'receipt' : 'receipt-outline'}
            size={18}
            color={activeTab === 'history' ? '#2563EB' : '#475569'}
          />
          <Text style={[styles.navLabel, activeTab === 'history' && styles.navLabelActive]}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItemDark} onPress={onStartChat} accessibilityLabel="Open chat">
          <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('cart')}
          accessibilityLabel="Shopping Cart"
        >
          <View style={styles.cartIconWrapper}>
            <Ionicons
              name={activeTab === 'cart' ? 'cart' : 'cart-outline'}
              size={18}
              color={activeTab === 'cart' ? '#2563EB' : '#475569'}
            />
            {cartItemsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemsCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navLabel, activeTab === 'cart' && styles.navLabelActive]}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onOpenSettings} accessibilityLabel="Open settings">
          <Ionicons name="settings-outline" size={18} color="#475569" />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 110,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  logoTile: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1.5,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.8,
  },
  logoDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#2563EB',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  heroBlock: {
    marginBottom: 24,
    gap: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.6,
  },
  subGreeting: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: APPLE_FONT,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  quickButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  assistantCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    minHeight: 140,
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottom: {
    gap: 2,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.2,
  },
  cardDesc: {
    color: '#64748B',
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    fontFamily: APPLE_FONT,
  },
  bottomNav: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navItemDark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    transform: [{ translateY: -12 }],
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: APPLE_FONT,
  },
  navLabelActive: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: APPLE_FONT,
  },
  tabContent: {
    gap: 4,
  },
  tabHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.6,
  },
  tabSubheading: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: APPLE_FONT,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
    fontFamily: APPLE_FONT,
  },
  ledgerList: {
    gap: 12,
  },
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  ledgerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  ledgerItemInfo: {
    flex: 1,
    gap: 2,
  },
  ledgerItemTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
  },
  ledgerTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: APPLE_FONT,
  },
  ledgerPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EF4444',
    fontFamily: APPLE_FONT,
  },
  ledgerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  teamingAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 20,
    paddingLeft: 30,
  },
  singleAgent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 20,
    paddingLeft: 22,
  },
  avatarMiniOnmi: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0F172A',
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  avatarMiniLinh: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3B82F6',
    position: 'absolute',
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 1,
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 9,
  },
  avatarMiniTextLinh: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '900',
    lineHeight: 6,
  },
  teamingLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: APPLE_FONT,
    marginLeft: 6,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  actionBadgeAuto: {
    backgroundColor: '#EEF2FF',
  },
  actionBadgeManual: {
    backgroundColor: '#D1FAE5',
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  actionBadgeTextAuto: {
    color: '#4F46E5',
  },
  actionBadgeTextManual: {
    color: '#065F46',
  },
  cartIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 7.5,
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  cartContainer: {
    gap: 16,
  },
  cartList: {
    gap: 10,
  },
  cartItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cartItemImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  cartItemDetails: {
    flex: 1,
    gap: 2,
  },
  cartItemName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: APPLE_FONT,
  },
  cartItemDelete: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    gap: 12,
    marginTop: 8,
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: APPLE_FONT,
  },
  checkoutVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
  },
  checkoutBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
});
