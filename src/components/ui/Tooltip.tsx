import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../styles/theme';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delayDuration = 0,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<TouchableOpacity>(null);

  const showTooltip = () => {
    if (triggerRef.current) {
      triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
        const tooltipPosition = calculatePosition(pageX, pageY, width, height, placement);
        setPosition(tooltipPosition);
        
        if (delayDuration > 0) {
          setTimeout(() => setVisible(true), delayDuration);
        } else {
          setVisible(true);
        }
      });
    }
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPressIn={showTooltip}
        onPressOut={hideTooltip}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={hideTooltip}
        >
          <View style={[styles.tooltip, { left: position.x, top: position.y }]}>
            <Text style={styles.tooltipText}>{content}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function calculatePosition(
  pageX: number,
  pageY: number,
  width: number,
  height: number,
  placement: string
) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const tooltipWidth = 200;
  const tooltipHeight = 40;
  const offset = 8;

  let x = pageX;
  let y = pageY;

  switch (placement) {
    case 'top':
      x = pageX + width / 2 - tooltipWidth / 2;
      y = pageY - tooltipHeight - offset;
      break;
    case 'bottom':
      x = pageX + width / 2 - tooltipWidth / 2;
      y = pageY + height + offset;
      break;
    case 'left':
      x = pageX - tooltipWidth - offset;
      y = pageY + height / 2 - tooltipHeight / 2;
      break;
    case 'right':
      x = pageX + width + offset;
      y = pageY + height / 2 - tooltipHeight / 2;
      break;
  }

  // Keep tooltip within screen bounds
  x = Math.max(8, Math.min(x, screenWidth - tooltipWidth - 8));
  y = Math.max(8, Math.min(y, screenHeight - tooltipHeight - 8));

  return { x, y };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    color: theme.colors.primaryForeground,
    fontSize: 12,
    textAlign: 'center',
  },
});