import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { ThemedText } from './Text';
import { ThemedView } from './View';

import { ModalAction } from '../../types/ui';

const { width } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  actions?: ModalAction[];
  onClose?: () => void;
  icon?: React.ReactNode;
}

export function CustomModal({ visible, title, description, actions, onClose, children, icon }: ModalProps) {
  const { colors, spacing } = useTheme();
  const BRUTAL_STYLES = {
    borderWidth: 3,
    borderColor: colors.textPrimary,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Pressable style={styles.overlay} onPress={onClose}/>
        <ThemedView 
          style={[
            styles.modal, 
            { 
              backgroundColor: colors.surface, 
              borderColor: colors.textPrimary,
              padding: spacing.lg,
              borderRadius: 0,
            },
            BRUTAL_STYLES
          ]}
        >
          {icon && <View style={[styles.iconContainer, { marginBottom: spacing.md }]}>{icon}</View>}
          
          {title && (
              <ThemedText type="subtitle" align="center" style={[styles.title, { marginBottom: spacing.sm }]}>{title}</ThemedText>
          )}
          
          {description && (
              <ThemedText colorType="textSecondary" align="center" weight='medium' style={[styles.description, { marginBottom: spacing.xl }]}>{description}</ThemedText>
          )}
          
          {children}

          {actions && actions.length > 0 && (
              <View style={[styles.actions, { marginTop: spacing.sm, gap: spacing.md }]}>
                  {actions.map((action, index) => (
                      <Button 
                          key={index}
                          title={action.text}
                          onPress={action.onPress}
                          variant={action.variant || 'primary'}
                          style={actions.length > 1 ? { flex: 1 } : { width: '100%' }}
                          size='md'
                      />
                  ))}
              </View>
          )}
      </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 400,
    borderWidth: 3,
  },
  iconContainer: {
    transform: [{ scale: 1.2 }]
  },
  title: {
    fontSize: 22,
  },
  description: {
    lineHeight: 22,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
  }
});
