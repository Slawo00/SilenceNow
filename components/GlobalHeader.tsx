import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

interface GlobalHeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  onBackPress?: () => void;
}

export default function GlobalHeader({ 
  title, 
  showBack = false, 
  showLogo = false,
  onBackPress 
}: GlobalHeaderProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const colors = Colors.dark;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.tint} />
          </TouchableOpacity>
        ) : showLogo ? (
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.logoTextContainer}>
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
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {title && !showLogo && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.menuButton, { backgroundColor: colors.card }]}
        onPress={openDrawer}
      >
        <IconSymbol name="line.3.horizontal" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoTextContainer: {
    marginLeft: 10,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 1,
  },
  titleContainer: {
    flex: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
