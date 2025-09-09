import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface AvatarProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface AvatarTextProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Avatar({ children, style }: AvatarProps) {
  return (
    <View style={[styles.avatar, style]}>
      {children}
    </View>
  );
}

Avatar.Text = function AvatarText({ children, style }: AvatarTextProps) {
  return (
    <Text style={[styles.text, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});