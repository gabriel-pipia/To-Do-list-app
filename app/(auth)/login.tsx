import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button, Input, ThemedText } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { SPACING } from '../../src/lib/constants';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
        {/* Header */}
            <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.header}>
              <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
          <ThemedText style={styles.appName} weight="black" type='title'>to-doit</ThemedText>
              </View>
          <ThemedText colorType="textSecondary" style={styles.tagline}>
            Your tasks, beautifully organized
          </ThemedText>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <ThemedText weight="black" size="2xl" style={{ marginBottom: SPACING.sm }}>Welcome back</ThemedText>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerLight, borderRadius: 0, borderWidth: 3, borderColor: colors.danger }]}>
              <ThemedText colorType="danger" size="sm" weight="medium">{error}</ThemedText>
            </View>
          ) : null}

          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="md"
            variant="primary"
            style={{ marginTop: SPACING.sm }}
          />

          <View style={styles.footerRow}>
            <ThemedText colorType="textSecondary" size="sm">
              Don't have an account?
            </ThemedText>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <ThemedText weight="bold" size="sm" colorType="textPrimary">Sign Up</ThemedText>
            </Pressable>
          </View>
          </Animated.View>
        </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: SPACING.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 48,
    letterSpacing: -2,
  },
  tagline: {
    marginTop: SPACING.sm,
  },
  form: {
    gap: SPACING.md,
  },
  errorBox: {
    padding: SPACING.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
});
