import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface WorkflowIndicatorProps {
  currentStep: 'quotation' | 'sales_order' | 'delivery_note';
  completedSteps?: string[];
  showLabels?: boolean;
}

export default function WorkflowIndicator({ 
  currentStep, 
  completedSteps = [], 
  showLabels = true 
}: WorkflowIndicatorProps) {
  const steps = [
    { key: 'quotation', label: 'Quotation', icon: 'receipt-outline' },
    { key: 'sales_order', label: 'Sales Order', icon: 'document-text-outline' },
    { key: 'delivery_note', label: 'Delivery Note', icon: 'car-outline' }
  ];

  const getStepStatus = (stepKey: string) => {
    if (completedSteps.includes(stepKey)) return 'completed';
    if (stepKey === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.primary;
      case 'current': return '#FF9800';
      case 'pending': return theme.colors.mutedForeground;
      default: return theme.colors.mutedForeground;
    }
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.key);
        const color = getStepColor(status);
        
        return (
          <View key={step.key} style={styles.stepContainer}>
            <View style={styles.stepContent}>
              <View style={[styles.stepIcon, { borderColor: color }]}>
                <Ionicons 
                  name={status === 'completed' ? 'checkmark' : step.icon as any} 
                  size={16} 
                  color={color} 
                />
              </View>
              {showLabels && (
                <Text style={[styles.stepLabel, { color }]}>
                  {step.label}
                </Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.connector, { 
                backgroundColor: completedSteps.includes(steps[index + 1].key) ? 
                  theme.colors.primary : theme.colors.border 
              }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  stepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
    minWidth: 60,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  stepLabel: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: theme.spacing.sm,
  },
});