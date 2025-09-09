import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, ViewStyle } from 'react-native';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  style?: ViewStyle;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

DropdownMenu.Trigger = function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const { setIsOpen } = React.useContext(DropdownMenuContext);
  
  return (
    <TouchableOpacity onPress={() => setIsOpen(true)}>
      {children}
    </TouchableOpacity>
  );
};

DropdownMenu.Content = function DropdownMenuContent({ children, align = 'end', style }: DropdownMenuContentProps) {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsOpen(false)}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={() => setIsOpen(false)}
      >
        <View style={[
          styles.content,
          align === 'end' && styles.alignEnd,
          style
        ]}>
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

DropdownMenu.Item = function DropdownMenuItem({ children, onPress, style }: DropdownMenuItemProps) {
  const { setIsOpen } = React.useContext(DropdownMenuContext);

  const handlePress = () => {
    onPress?.();
    setIsOpen(false);
  };

  return (
    <TouchableOpacity style={[styles.item, style]} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
};

export const DropdownMenuTrigger = DropdownMenu.Trigger;
export const DropdownMenuContent = DropdownMenu.Content;
export const DropdownMenuItem = DropdownMenu.Item;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alignEnd: {
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
});