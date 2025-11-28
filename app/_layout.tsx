import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { PlanProvider } from '@/context/PlanContext';
import DrawerContent from '@/components/DrawerContent';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors.dark;
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingProvider>
        <PlanProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Drawer
              drawerContent={(props) => <DrawerContent {...props} />}
              screenOptions={{
                headerShown: false,
                drawerPosition: 'right',
                drawerType: 'front',
                drawerStyle: {
                  backgroundColor: colors.background,
                  width: '85%',
                },
                swipeEnabled: true,
                swipeEdgeWidth: 100,
              }}
            >
              <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
              <Drawer.Screen name="goal/[id]" options={{ headerShown: false }} />
              <Drawer.Screen name="lever/[id]" options={{ headerShown: false }} />
              <Drawer.Screen name="onboarding" options={{ headerShown: false, swipeEnabled: false }} />
              <Drawer.Screen name="tool/[id]" options={{ headerShown: false }} />
              <Drawer.Screen name="how-it-works" options={{ headerShown: false }} />
              <Drawer.Screen name="privacy" options={{ headerShown: false }} />
              <Drawer.Screen name="contact" options={{ headerShown: false }} />
              <Drawer.Screen name="terms" options={{ headerShown: false }} />
              <Drawer.Screen name="+not-found" options={{ headerShown: false }} />
            </Drawer>
            <StatusBar style="auto" />
          </ThemeProvider>
        </PlanProvider>
      </OnboardingProvider>
    </GestureHandlerRootView>
  );
}
