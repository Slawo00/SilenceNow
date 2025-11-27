import { ScrollView, StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GoalsScreen() {
  const router = useRouter();
  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                <Text style={styles.headerTitleWhite}>Sigma</Text>
                <Text style={styles.headerTitleWhite}>Finance</Text>
                <Text style={[styles.headerTitleAccent, { color: colors.tint }]}>AI</Text>
              </Text>
              <Text style={[styles.headerTagline, { color: colors.textSecondary }]}>
                AI. FINANCE. EXCELLENCE
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.menuButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="list.bullet" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <ThemedText style={[styles.pageTitle, { color: colors.text }]}>Optimization Goals</ThemedText>
          <ThemedText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Select a goal to view strategic levers and implementation guides
          </ThemedText>
        </View>

        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/goal/${goal.id}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
              <IconSymbol name={goal.icon as any} size={28} color={goal.color} />
            </View>
            <View style={styles.goalContent}>
              <ThemedText style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</ThemedText>
              <ThemedText style={[styles.goalDescription, { color: colors.textSecondary }]}>
                {goal.description}
              </ThemedText>
              <View style={[styles.leversBadge, { backgroundColor: goal.color + '15' }]}>
                <ThemedText style={[styles.leversText, { color: goal.color }]}>
                  {goal.levers.length} Strategic Levers
                </ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 44,
    height: 44,
  },
  headerTextContainer: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitleWhite: {
    color: '#F1F5F9',
  },
  headerTitleAccent: {
    fontWeight: '700',
  },
  headerTagline: {
    fontSize: 10,
    letterSpacing: 1,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  goalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  leversBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leversText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
