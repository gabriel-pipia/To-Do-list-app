import 'react-native-get-random-values'; // Must be first — polyfills crypto for uuid
import { useFonts } from 'expo-font';
import { Stack, useSegments, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { colors, mode } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const segments = useSegments();

  const [fontsLoaded, fontError] = useFonts({
    'GoogleSans-Regular': require('../assets/fonts/Google_Sans/GoogleSans-Regular.ttf'),
    'GoogleSans-Medium': require('../assets/fonts/Google_Sans/GoogleSans-Medium.ttf'),
    'GoogleSans-SemiBold': require('../assets/fonts/Google_Sans/GoogleSans-SemiBold.ttf'),
    'GoogleSans-Bold': require('../assets/fonts/Google_Sans/GoogleSans-Bold.ttf'),
    'Kodchasan-Regular': require('../assets/fonts/Kodchasan/Kodchasan-Regular.ttf'),
    'Kodchasan-Medium': require('../assets/fonts/Kodchasan/Kodchasan-Medium.ttf'),
    'Kodchasan-SemiBold': require('../assets/fonts/Kodchasan/Kodchasan-SemiBold.ttf'),
    'Kodchasan-Bold': require('../assets/fonts/Kodchasan/Kodchasan-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (authLoading || (!fontsLoaded && !fontError)) return;

    const inAuthGroup = segments[0] === '(auth)';

    // If starting up or deep linking without a user, force login
    if (!user && !inAuthGroup) {
      setTimeout(() => router.replace('/(auth)/login'), 0);
    } else if (user && inAuthGroup) {
      setTimeout(() => router.replace('/(tabs)'), 0);
    }
  }, [user, authLoading, segments, fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar
        style={mode === 'dark' ? 'light' : 'dark'}
        backgroundColor={colors.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
