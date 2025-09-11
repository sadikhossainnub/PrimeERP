import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../styles/theme';

interface TableProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface TableRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isHeader?: boolean;
}

interface TableCellProps {
  children: React.ReactNode;
  style?: ViewStyle;
  flex?: number;
  align?: 'left' | 'center' | 'right';
}

export function Table({ children, style }: TableProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, style]}>
        {children}
      </View>
    </ScrollView>
  );
}

export function TableHeader({ children, style }: TableRowProps) {
  return (
    <View style={[styles.headerRow, style]}>
      {children}
    </View>
  );
}

export function TableBody({ children, style }: TableProps) {
  return (
    <View style={[styles.body, style]}>
      {children}
    </View>
  );
}

export function TableRow({ children, style, isHeader }: TableRowProps) {
  return (
    <View style={[styles.row, isHeader && styles.headerRow, style]}>
      {children}
    </View>
  );
}

export function TableCell({ children, style, flex = 1, align = 'left' }: TableCellProps) {
  const textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
  
  return (
    <View style={[styles.cell, { flex }, style]}>
      <Text style={[styles.cellText, { textAlign }]}>
        {children}
      </Text>
    </View>
  );
}

export function TableHead({ children, style, flex = 1, align = 'left' }: TableCellProps) {
  const textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
  
  return (
    <View style={[styles.cell, { flex }, style]}>
      <Text style={[styles.headerText, { textAlign }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: '100%',
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 48,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: theme.colors.muted,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
  },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: theme.colors.foreground,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.foreground,
  },
});