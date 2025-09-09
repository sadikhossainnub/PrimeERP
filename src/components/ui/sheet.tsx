import React from 'react';
import { Modal, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetContentProps {
  children: React.ReactNode;
  side?: 'bottom' | 'top' | 'left' | 'right';
  style?: ViewStyle;
  className?: string;
}

interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface SheetHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface SheetTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface SheetDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => onOpenChange(false)}
    >
      {children}
    </Modal>
  );
}

Sheet.Content = function SheetContent({ children, side = 'bottom', style }: SheetContentProps) {
  return (
    <View style={styles.overlay}>
      <View style={[
        styles.content,
        side === 'bottom' && styles.contentBottom,
        style
      ]}>
        {children}
      </View>
    </View>
  );
};

Sheet.Trigger = function SheetTrigger({ children }: SheetTriggerProps) {
  return <>{children}</>;
};

Sheet.Header = function SheetHeader({ children, style }: SheetHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
};

Sheet.Title = function SheetTitle({ children, style }: SheetTitleProps) {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
};

Sheet.Description = function SheetDescription({ children, style }: SheetDescriptionProps) {
  return (
    <Text style={[styles.description, style]}>
      {children}
    </Text>
  );
};

export const SheetContent = Sheet.Content;
export const SheetTrigger = Sheet.Trigger;
export const SheetHeader = Sheet.Header;
export const SheetTitle = Sheet.Title;
export const SheetDescription = Sheet.Description;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  contentBottom: {
    // Additional styles for bottom sheet
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});