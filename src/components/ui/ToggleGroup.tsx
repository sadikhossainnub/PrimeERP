import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Toggle } from './Toggle';

interface ToggleGroupProps {
  type?: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactElement[];
}

export function ToggleGroup({ 
  type = 'single', 
  value, 
  onValueChange, 
  children 
}: ToggleGroupProps) {
  const handleToggle = (itemValue: string) => {
    if (type === 'single') {
      onValueChange?.(value === itemValue ? '' : itemValue);
    } else {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(itemValue)
        ? currentValues.filter(v => v !== itemValue)
        : [...currentValues, itemValue];
      onValueChange?.(newValues);
    }
  };

  return (
    <View style={styles.container}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const itemValue = (child.props as any).value;
          const isPressed = type === 'single' 
            ? value === itemValue 
            : Array.isArray(value) && value.includes(itemValue);
          
          return React.cloneElement(child as any, {
            pressed: isPressed,
            onPressedChange: () => handleToggle(itemValue),
          });
        }
        return child;
      })}
    </View>
  );
}

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
}

export function ToggleGroupItem({ children }: ToggleGroupItemProps) {
  return <Toggle>{children}</Toggle>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    padding: 2,
  },
});