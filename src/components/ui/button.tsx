import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../styles/theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  disabled = false, 
  onPress, 
  style,
  textStyle 
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          backgroundColor: theme.colors.destructive,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          borderWidth: 0,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 32,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
        };
      case 'lg':
        return {
          height: 40,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.borderRadius.md,
        };
      case 'icon':
        return {
          width: 36,
          height: 36,
          paddingHorizontal: 0,
          borderRadius: theme.borderRadius.md,
        };
      default:
        return {
          height: 36,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  const getTextStyles = () => {
    const baseTextStyle = {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    };

    switch (variant) {
      case 'destructive':
        return { ...baseTextStyle, color: theme.colors.destructiveForeground };
      case 'outline':
        return { ...baseTextStyle, color: theme.colors.foreground };
      case 'secondary':
        return { ...baseTextStyle, color: theme.colors.secondaryForeground };
      case 'ghost':
        return { ...baseTextStyle, color: theme.colors.foreground };
      case 'link':
        return { ...baseTextStyle, color: theme.colors.primary, textDecorationLine: 'underline' };
      default:
        return { ...baseTextStyle, color: theme.colors.primaryForeground };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        getTextStyles(),
        disabled && styles.disabledText,
        textStyle
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});