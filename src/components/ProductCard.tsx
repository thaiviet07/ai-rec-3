import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export interface Product {
  id: string;
  name: string;
  category: string;
  color: string[];
  price: number;
  image_url: string;
  tags: string[];
}

interface ProductCardProps {
  product: Product;
  matchReasons: string[];
  actionType: 'recommend_only' | 'auto_purchase';
  onConfirm?: () => void;
  onDecline?: () => void;
  confirmed?: boolean;
  autoPurchased?: boolean;
  accentColor?: string;
}

const ALTERNATE_IMAGES: Record<string, string[]> = {
  footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80',
  ],
  outerwear: [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=400&q=80',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80',
  ],
  tops: [
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&q=80',
    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80',
  ],
  bottoms: [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80',
    'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&q=80',
  ]
};

const getStoreMeta = (id: string) => {
  const hash = id.split('_')[1] || '01';
  const index = parseInt(hash) || 1;
  
  const stores = [
    { name: 'onmi Shibuya Flagship', address: 'Level 2, Shibuya Crossing, Tokyo', ship: 'Est: 1 Hour (Instant)' },
    { name: 'Tokyo Urban Wear Lab', address: 'Ginza Shopping Center, Tokyo', ship: 'Est: 2 Hours (Instant)' },
    { name: 'Minimalist Aoyama Boutique', address: 'Aoyama Ave, Minato-ku, Tokyo', ship: 'Free Shipping - Next Day' },
    { name: 'Streetwear Center Shinjuku', address: 'Shinjuku Plaza, Tokyo', ship: 'Est: 45 Mins (Instant)' }
  ];
  
  const reviewsCount = 75 + (index * 13) % 120;
  const rating = (4.6 + (index % 4) * 0.1).toFixed(1);
  
  return {
    ...stores[index % stores.length],
    reviewsCount,
    rating
  };
};

export default function ProductCard({
  product,
  matchReasons,
  actionType,
  onConfirm,
  onDecline,
  confirmed,
  autoPurchased,
  accentColor = '#2563EB',
}: ProductCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  const { addToCart } = useAppStore();
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cardWidth, setCardWidth] = useState(280); // Default fallback width

  const storeMeta = getStoreMeta(product.id);
  const imagesPool = [
    product.image_url,
    ...(ALTERNATE_IMAGES[product.category] || []).slice(0, 2)
  ];

  const handleAddToCart = () => {
    addToCart(product);
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const handleScroll = (event: any) => {
    const width = event.nativeEvent.layoutMeasurement.width;
    if (width > 0) {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveSlide(index);
    }
  };

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [opacityAnim, scaleAnim]);

  return (
    <Animated.View
      style={[styles.cardShell, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        if (width > 0) {
          setCardWidth(width);
        }
      }}
    >
      <View style={styles.card}>
        {/* Product Image Slider Section */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.imageScroll}
          >
            {imagesPool.map((url, i) => (
              <Image
                key={i}
                source={{ uri: url }}
                style={[styles.image, { width: cardWidth }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* iOS-Style Translucent Page Indicator */}
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>{activeSlide + 1} / {imagesPool.length}</Text>
          </View>

          <View style={styles.categoryBadge}>
            <Ionicons name="shirt-outline" size={10} color="#2563EB" />
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>

          {autoPurchased && (
            <View style={styles.purchasedOverlay}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.purchasedText}>Auto-Purchased</Text>
            </View>
          )}
        </View>

        {/* Product Info Section */}
        <View style={styles.info}>
          {/* Pricing & Rating Row */}
          <View style={styles.priceRatingRow}>
            <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={10} color="#EAB308" />
              <Text style={styles.ratingText}>{storeMeta.rating} ({storeMeta.reviewsCount})</Text>
            </View>
          </View>

          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

          {/* Details tag row */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Color:</Text>
              <Text style={styles.detailText}>{product.color[0]}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Style:</Text>
              <Text style={styles.detailText}>{product.tags[0]}</Text>
            </View>
          </View>

          {/* Rich Store & Shipping Details */}
          <View style={styles.storeBlock}>
            <View style={styles.storeHeaderLine}>
              <Ionicons name="business" size={13} color="#475569" />
              <Text style={styles.storeNameText}>{storeMeta.name}</Text>
              <View style={styles.greenDot} />
              <Text style={styles.shipText}>{storeMeta.ship}</Text>
            </View>
            <View style={styles.addressLine}>
              <Ionicons name="location-outline" size={12} color="#64748B" />
              <Text style={styles.storeSubText}>{storeMeta.address}</Text>
            </View>
          </View>

          {/* Verified Match Reasons Box */}
          <View style={styles.reasonsBox}>
            <View style={styles.reasonsHeader}>
              <Ionicons name="sparkles" size={12} color="#2563EB" />
              <Text style={styles.reasonsLabel}>onmi AI styling logic</Text>
            </View>
            {matchReasons.slice(0, 3).map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <Ionicons name="checkmark-circle-outline" size={12} color="#2563EB" style={{ marginTop: 2 }} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          {/* Interactive Buy/Confirmation Panel */}
          {actionType === 'recommend_only' && !confirmed && (
            <View style={styles.actionPanel}>
              <View style={styles.actionHeader}>
                <Text style={styles.actionHeaderText}>Confirmation requested</Text>
                <Ionicons name="time-outline" size={13} color="#64748B" />
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
                  <Ionicons name="card-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Buy Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
                  <Ionicons name="sync" size={15} color="#475569" />
                  <Text style={styles.declineBtnText}>Alternative</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.cartBtn, isAddedToCart && styles.cartBtnSuccess]}
                onPress={handleAddToCart}
              >
                <Ionicons
                  name={isAddedToCart ? "checkmark-circle" : "cart-outline"}
                  size={15}
                  color={isAddedToCart ? "#059669" : "#2563EB"}
                />
                <Text style={[styles.cartBtnText, isAddedToCart && styles.cartBtnTextSuccess]}>
                  {isAddedToCart ? "Added to Cart" : "Add to Cart"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {actionType === 'recommend_only' && confirmed && (
            <View style={styles.confirmedBanner}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.confirmedText}>Purchase confirmed securely</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    marginLeft: 32,
    marginRight: 10,
    marginVertical: 10,
    alignSelf: 'stretch',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  imageScroll: {
    width: '100%',
    height: '100%',
  },
  image: {
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#DBEAFE',
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#2563EB',
    fontFamily: APPLE_FONT,
  },
  purchasedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  successIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  purchasedText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: APPLE_FONT,
  },
  info: {
    padding: 14,
    gap: 10,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: APPLE_FONT,
    letterSpacing: -0.4,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#FEF08A',
  },
  ratingText: {
    color: '#A16207',
    fontSize: 9.5,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  productName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    fontFamily: APPLE_FONT,
    letterSpacing: -0.2,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: APPLE_FONT,
  },
  detailText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
    fontFamily: APPLE_FONT,
  },
  storeBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  storeHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  storeNameText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: APPLE_FONT,
  },
  greenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginHorizontal: 2,
  },
  shipText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    fontFamily: APPLE_FONT,
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  storeSubText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: APPLE_FONT,
  },
  reasonsBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 10,
    gap: 5,
    borderWidth: 0.5,
    borderColor: '#BAE6FD',
  },
  reasonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  reasonsLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0369A1',
    fontFamily: APPLE_FONT,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  reasonText: {
    color: '#0369A1',
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
    fontWeight: '700',
    fontFamily: APPLE_FONT,
  },
  actionPanel: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 8,
    gap: 6,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  actionHeaderText: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: APPLE_FONT,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  declineBtn: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  declineBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  confirmBtn: {
    flex: 1.2,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  confirmedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
  },
  confirmedText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  cartBtn: {
    marginTop: 6,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
  },
  cartBtnSuccess: {
    borderColor: '#A7F3D0',
    backgroundColor: '#D1FAE5',
  },
  cartBtnText: {
    color: '#2563EB',
    fontSize: 11.5,
    fontWeight: '800',
    fontFamily: APPLE_FONT,
  },
  cartBtnTextSuccess: {
    color: '#059669',
  },
});
