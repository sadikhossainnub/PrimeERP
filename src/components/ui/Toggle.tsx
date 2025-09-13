import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ToggleProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function Toggle({ 
  pressed = false, 
  onPressedChange, 
  children, 
  variant = 'default',
  size = 'default'
}: ToggleProps) {
  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        styles[size],
        variant === 'outline' && styles.outline,
        pressed && styles.pressed
      ]}
      onPress={() => onPressedChange?.(!pressed)}
    >
      <Text style={[styles.text, pressed && styles.pressedText]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  default: {
    height: 36,
    paddingHorizontal: 8,
    minWidth: 36,
  },
  sm: {
    height: 32,
    paddingHorizontal: 6,
    minWidth: 32,
  },
  lg: {
    height: 40,
    paddingHorizontal: 10,
    minWidth: 40,
  },
  outline: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pressed: {
    backgroundColor: '#f3f4f6',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  pressedText: {
    color: '#374151',
  },
});