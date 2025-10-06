import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const slides = [
  {
    title: 'Welcome to ChainGive',
    subtitle: 'Where generosity flows forward',
  },
  {
    title: 'You receive. You give. You earn.',
    subtitle: 'Complete cycles and earn Charity Coins',
  },
  {
    title: 'Built on trust, not debt',
    subtitle: 'Your donation is secured in escrow until confirmed',
  },
];

const OnboardingScreen: React.FC<any> = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((i) => Math.min(i + 1, slides.length - 1));
  const back = () => setIndex((i) => Math.max(i - 1, 0));

  const slide = slides[index];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.slide}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
      <View style={styles.controls}>
        {index > 0 ? (
          <TouchableOpacity onPress={back} style={[styles.btn, styles.secondary]}>
            <Text style={[styles.btnText, styles.secondaryText]}>Back</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 100 }} />}
        {index < slides.length - 1 ? (
          <TouchableOpacity onPress={next} style={styles.btn}>
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.btn}>
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary, padding: layout.screenPadding, justifyContent: 'space-between' },
  slide: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.bodyRegular, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  btn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  btnText: { ...typography.button, color: colors.white },
  secondary: { backgroundColor: colors.gray[100] },
  secondaryText: { color: colors.text.primary },
});

export default OnboardingScreen;
