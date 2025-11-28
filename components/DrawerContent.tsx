import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/context/OnboardingContext';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  action?: 'restart-onboarding';
}

const menuItems: MenuItem[] = [
  { label: 'Home', icon: 'house.fill', route: '/(tabs)' },
  { label: 'Goals', icon: 'target', route: '/(tabs)/goals' },
  { label: 'My Plan', icon: 'checklist', route: '/(tabs)/plan' },
  { label: 'AI Tools', icon: 'cpu', route: '/(tabs)/tools' },
  { label: 'How it Works', icon: 'questionmark.circle.fill', route: '/how-it-works' },
  { label: 'Data & Privacy', icon: 'lock.shield.fill', route: '/privacy' },
  { label: 'Contact / Feedback', icon: 'envelope.fill', route: '/contact' },
  { label: 'Terms & Conditions', icon: 'doc.text.fill', route: '/terms' },
  { label: 'Restart Onboarding', icon: 'arrow.counterclockwise', action: 'restart-onboarding' },
];

interface DrawerContentProps {
  navigation: any;
}

export default function DrawerContent({ navigation }: DrawerContentProps) {
  const router = useRouter();
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const { resetOnboarding } = useOnboarding();

  const handleMenuPress = async (item: MenuItem) => {
    navigation.closeDrawer();
    
    if (item.action === 'restart-onboarding') {
      await resetOnboarding();
      router.replace('/onboarding');
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.logoRow}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.logoText}>
            <Text style={styles.brandName}>
              <Text style={{ color: '#F1F5F9' }}>Sigma</Text>
              <Text style={{ color: '#F1F5F9' }}>Finance</Text>
              <Text style={{ color: colors.tint }}>AI</Text>
            </Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              AI. FINANCE. EXCELLENCE
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.closeDrawer()}
        >
          <IconSymbol name="xmark" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <React.Fragment key={item.label}>
            {index === 4 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            {index === 8 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: 'transparent' }]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.card }]}>
                <IconSymbol 
                  name={item.icon as any} 
                  size={20} 
                  color={item.action === 'restart-onboarding' ? colors.warning : colors.tint} 
                />
              </View>
              <Text style={[
                styles.menuLabel, 
                { color: item.action === 'restart-onboarding' ? colors.warning : colors.text }
              ]}>
                {item.label}
              </Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, borderTopColor: colors.border }]}>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Version 1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 44,
    height: 44,
  },
  logoText: {
    marginLeft: 12,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
  },
});
