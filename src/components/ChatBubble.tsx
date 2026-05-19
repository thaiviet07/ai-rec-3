import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const APPLE_FONT = Platform.OS === 'ios' ? 'System' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatBubbleProps {
  message: ChatMessage;
  agentName?: string;
  accentColor?: string;
}

const USER_IMAGE =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80&auto=format&fit=crop';

function AssistantLogo() {
  return (
    <View style={styles.assistantLogoCircle}>
      <Text style={styles.assistantLogoText}>o</Text>
      <View style={styles.logoDot} />
    </View>
  );
}

export default function ChatBubble({ message, agentName }: ChatBubbleProps) {
  const slideAnim = useRef(new Animated.Value(16)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [opacityAnim, slideAnim]);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    const success = message.content.toLowerCase().includes('order placed') || message.content.toLowerCase().includes('successfully');

    return (
      <Animated.View style={[styles.systemRow, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.systemBubble, success && styles.successBubble]}>
          <Ionicons
            name={success ? 'checkmark-circle' : 'information-circle'}
            size={14}
            color={success ? '#10B981' : '#64748B'}
          />
          <Text style={[styles.systemText, success && styles.successText]}>{message.content}</Text>
        </View>
      </Animated.View>
    );
  }

  const isTeaming = agentName && (agentName.includes('+') || agentName.includes('Ngoc Linh'));

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.userRow : styles.assistantRow,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser && (
        isTeaming ? (
          <View style={styles.teamingAvatarContainer}>
            <View style={styles.avatarOnmi}>
              <Text style={styles.avatarTextOnmi}>o</Text>
            </View>
            <View style={styles.avatarLinh}>
              <Text style={styles.avatarTextLinh}>NL</Text>
            </View>
          </View>
        ) : (
          <View style={styles.assistantAvatar}>
            <AssistantLogo />
          </View>
        )
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {!isUser && agentName && (
          <Text style={styles.agentLabel}>{agentName}</Text>
        )}
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>
      {isUser && (
        <View style={styles.userAvatar}>
          <Image source={{ uri: USER_IMAGE }} style={styles.userAvatarImage} />
        </View>
      )}
      {!isUser && (
        <TouchableOpacity style={styles.moreButton} accessibilityLabel="More actions">
          <Ionicons name="ellipsis-horizontal" size={14} color="#94A3B8" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  systemRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  assistantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    marginRight: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  assistantLogoCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 1,
  },
  assistantLogoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 18,
  },
  logoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 2,
    backgroundColor: '#E2E8F0',
    marginLeft: 8,
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  bubble: {
    maxWidth: '74%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#0F172A',
    borderBottomRightRadius: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  systemBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '90%',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  successBubble: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: APPLE_FONT,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#0F172A',
  },
  agentLabel: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: APPLE_FONT,
  },
  systemText: {
    color: '#475569',
    fontSize: 12,
    flexShrink: 1,
    fontWeight: '700',
    fontFamily: APPLE_FONT,
  },
  successText: {
    color: '#047857',
  },
  moreButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  teamingAvatarContainer: {
    width: 38,
    height: 38,
    position: 'relative',
    marginRight: 8,
  },
  avatarOnmi: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarTextOnmi: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 11,
  },
  avatarLinh: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarTextLinh: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 8,
  },
});
