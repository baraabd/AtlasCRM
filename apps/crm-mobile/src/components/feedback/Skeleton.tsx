import React, { useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, Animated } from 'react-native';

type SkeletonProps = {
  variant?: 'cards' | 'list' | 'text';
  count?: number;
  style?: ViewStyle;
};

export function Skeleton({ variant = 'text', count = 1, style }: SkeletonProps) {
  // Animation logic for pulsing effect
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.base,
            styles[variant],
            { opacity },
            style, // Custom styles override
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  // Variants
  cards: {
    height: 120,
    width: '100%',
  },
  list: {
    height: 60,
    width: '100%',
  },
  text: {
    height: 20,
    width: '80%',
  },
});