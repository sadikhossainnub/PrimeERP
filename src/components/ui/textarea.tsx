import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface TextareaProps extends TextInputProps {
  className?: string;
  style?: ViewStyle;
  rows?: number;
}

export function Textarea({ style, rows = 4, ...props }: TextareaProps) {
  return (
    <TextInput
      style={[styles.textarea, { height: rows * 20 + 20 }, style]}
      multiline
      textAlignVertical="top"
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: 'white',
    color: '#111827',
  },
});