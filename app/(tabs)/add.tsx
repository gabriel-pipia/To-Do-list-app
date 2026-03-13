import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../../src/components/ui';

export default function AddScreen() {
  // This screen is just a placeholder — the "add" tab opens a modal from CustomTabBar
  return <ThemedView safe style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
