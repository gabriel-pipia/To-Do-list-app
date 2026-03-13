import { useTheme } from '@/hooks/useTheme';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, ThemedText } from '../src/components/ui';
import { BRUTAL_STYLES } from '../src/lib/constants';

export default function NotFoundScreen() {
  const { colors, layout } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, maxWidth: layout.containerMaxWidth }, BRUTAL_STYLES(colors)]}>
          <ThemedText weight="black" style={styles.errorText}>
            404
          </ThemedText>
          <ThemedText size="lg" weight="bold" style={styles.messageText}>
            This page doesn't exist.
          </ThemedText>
          <Link href="/" asChild>
            <Button title="Back to Home!" variant="primary" style={styles.button} />
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 64,
    marginBottom: 16,
    textAlign: 'center',
  },
  messageText: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.8,
  },
  button: {
    width: '100%',
  },
});
