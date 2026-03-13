import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ui';

export function SplashScreen() {
  const { colors } = useTheme();
  const { user, loading } = useAuth();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (isReady && !loading) {
    if (user) {
      return <Redirect href="/(tabs)" />;
    } else {
      return <Redirect href="/(auth)/login" />;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        entering={FadeIn.duration(800)}
        style={styles.logoContainer}
      >
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(400).duration(800)}>
        <ThemedText type="title" weight="black" style={styles.title}>
          To-Doit
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 4,
    fontSize: 40,
  },
});

