import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

function AssistantLogo() {
  return (
    <View style={styles.assistantLogo}>
      <View style={styles.logoWing} />
      <View style={styles.logoSlash} />
    </View>
  );
}

export default function ThinkingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -4, duration: 260, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 260, useNativeDriver: true }),
          Animated.delay(520),
        ])
      );

    animate(dot1, 0).start();
    animate(dot2, 160).start();
    animate(dot3, 320).start();
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim: Animated.Value) => ({
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6E6D62',
    transform: [{ translateY: anim }],
    opacity: 0.75,
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <AssistantLogo />
      </View>
      <View style={styles.bubble}>
        <Text style={styles.label}>typing</Text>
        <View style={styles.dots}>
          <Animated.View style={dotStyle(dot1)} />
          <Animated.View style={dotStyle(dot2)} />
          <Animated.View style={dotStyle(dot3)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F6EA',
  },
  assistantLogo: {
    width: 25,
    height: 21,
    justifyContent: 'center',
  },
  logoWing: {
    width: 20,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#F7A600',
    transform: [{ skewX: '-22deg' }],
  },
  logoSlash: {
    width: 9,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#11111F',
    position: 'absolute',
    right: 1,
    transform: [{ skewX: '-22deg' }],
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFEEE4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    color: '#5D5C53',
    fontSize: 13,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'flex-end',
  },
});
