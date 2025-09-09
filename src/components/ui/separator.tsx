import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  className?: string;
}

export function Separator({ orientation = 'horizontal', style }: SeparatorProps) {
  return (
    <View style={[
      styles.base,
      orientation === 'horizontal' ? styles.horizontal : styles.vertical,
      style
    ]} />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#e5e7eb',
  },
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});