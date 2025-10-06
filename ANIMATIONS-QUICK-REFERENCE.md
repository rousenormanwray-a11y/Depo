# 🎬 Premium Animations - Quick Reference

**Quick lookup guide for all 20+ premium animation components**

---

## 🎉 **Celebrations**

### ConfettiCelebration
**When:** Major achievements, milestones  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<ConfettiCelebration
  visible={true}
  message="🎉 Success!"
  submessage="You did it!"
  onComplete={() => {}}
/>
```

### AchievementUnlockAnimation
**When:** Achievement unlocked  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<AchievementUnlockAnimation
  visible={true}
  achievementName="First Donation"
  achievementDescription="Complete your first donation"
  achievementIcon="favorite"
  badge="gold"
  points={100}
  onComplete={() => {}}
/>
```

### LevelUpAnimation
**When:** User levels up  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<LevelUpAnimation
  visible={true}
  newLevel={15}
  rewards={['Unlock items', 'Bonus']}
  onComplete={() => {}}
/>
```

### DonationSuccessAnimation
**When:** Donation completed  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<DonationSuccessAnimation
  amount={5000}
  recipientName="John Doe"
  onComplete={() => {}}
/>
```

---

## 💫 **Particle Effects**

### ParticleEffect
**When:** Success states, celebrations  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<ParticleEffect
  count={30}
  colors={[colors.primary, colors.gold]}
  duration={2000}
/>
```

### FloatingHearts
**When:** Like/favorite actions  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<FloatingHearts
  count={15}
  startX={100}
  startY={200}
  color={colors.error}
/>
```

### PulseRing
**When:** Location markers, notifications  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<PulseRing
  size={100}
  color={colors.primary}
  count={3}
/>
```

### WaveAnimation
**When:** Backgrounds, decorative  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<WaveAnimation
  height={100}
  color={colors.primary}
/>
```

---

## 🎮 **Interactive**

### FlipCard
**When:** Info reveals, profiles  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<FlipCard
  frontContent={<Front />}
  backContent={<Back />}
  onFlip={(isFlipped) => {}}
/>
```

### MorphingFAB
**When:** Quick actions menu  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<MorphingFAB
  actions={[
    { icon: 'add', label: 'Add', color: colors.primary, onPress: () => {} }
  ]}
  position="bottom-right"
/>
```

---

## ✨ **Loaders**

### ShimmerEffect
**When:** Content loading  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<ShimmerEffect
  width="100%"
  height={100}
  borderRadius={12}
/>
```

### SkeletonPulse
**When:** Simple placeholders  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<SkeletonPulse
  width={200}
  height={20}
/>
```

### PullToRefreshAnimation
**When:** List refresh  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<PullToRefreshAnimation
  progress={0.5}
  refreshing={false}
/>
```

---

## 🔥 **Gamification**

### StreakFlame
**When:** Login streaks  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<StreakFlame
  days={15}
  size="large"
  showNumber
  animate
/>
```

---

## 🛠️ **Utilities**

### CountUpAnimation
**When:** Number reveals  
**Wow Factor:** ⭐⭐⭐⭐⭐
```typescript
<CountUpAnimation
  from={0}
  to={1000}
  duration={1500}
  formatter={(val) => `₦${val.toLocaleString()}`}
  easing="easeOut"
/>
```

### PageTransition
**When:** Screen transitions  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<PageTransition type="slideUp" duration={300}>
  <YourScreen />
</PageTransition>
```

---

## 🎬 **Lottie**

### LottieSuccess
**When:** Form success  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<LottieSuccess
  visible={true}
  onAnimationFinish={() => {}}
/>
```

### LottieError
**When:** Form errors  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<LottieError
  visible={true}
  onAnimationFinish={() => {}}
/>
```

### LottieLoading
**When:** Full-screen loading  
**Wow Factor:** ⭐⭐⭐⭐
```typescript
<LottieLoading
  message="Loading..."
  size={150}
/>
```

---

## 🎯 **Common Use Cases**

### Donation Flow
```typescript
// On success
<DonationSuccessAnimation amount={5000} recipientName="John" />
<FloatingHearts count={20} startX={width/2} startY={200} />
```

### Achievement System
```typescript
// On unlock
<AchievementUnlockAnimation
  achievementName="Generous"
  badge="gold"
  points={500}
/>
<ConfettiCelebration message="Achievement Unlocked!" />
```

### Level Progression
```typescript
// On level up
<LevelUpAnimation newLevel={15} rewards={['Item', 'Bonus']} />
<ParticleEffect count={50} />
```

### Loading States
```typescript
// While loading
<ShimmerEffect width="100%" height={120} />
<SkeletonPulse width={200} height={16} />
```

### Interactive Elements
```typescript
// Profile card
<FlipCard frontContent={<Profile />} backContent={<Stats />} />

// Quick actions
<MorphingFAB actions={quickActions} />
```

### Gamification
```typescript
// Streak tracking
<StreakFlame days={streak} size="large" animate />

// XP display
<CountUpAnimation to={newXP} formatter={(v) => `${v} XP`} />
```

---

## 💡 **Pro Tips**

### Stacking Animations
```typescript
// Combine for maximum impact
<ConfettiCelebration visible={showConfetti} />
<ParticleEffect count={40} />
<FloatingHearts count={15} />
```

### Haptic Feedback
```typescript
// Add haptics for better UX
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
setShowAnimation(true);
```

### Performance
```typescript
// Limit particle counts on mobile
const particleCount = Platform.OS === 'ios' ? 50 : 30;
```

### Cleanup
```typescript
// Always cleanup on unmount
useEffect(() => {
  return () => {
    animation.stop();
  };
}, []);
```

---

## 📱 **Import**

```typescript
import {
  // Celebrations
  ConfettiCelebration,
  AchievementUnlockAnimation,
  LevelUpAnimation,
  DonationSuccessAnimation,
  
  // Particles
  ParticleEffect,
  FloatingHearts,
  PulseRing,
  WaveAnimation,
  
  // Interactive
  FlipCard,
  MorphingFAB,
  
  // Loaders
  ShimmerEffect,
  SkeletonPulse,
  PullToRefreshAnimation,
  
  // Gamification
  StreakFlame,
  
  // Utilities
  CountUpAnimation,
  PageTransition,
  
  // Lottie
  LottieSuccess,
  LottieError,
  LottieLoading,
} from '@/components/animations';
```

---

## 🎨 **Color Schemes**

### Success
```typescript
colors: [colors.success, colors.primary]
```

### Celebration
```typescript
colors: [colors.gold, colors.primary, colors.secondary]
```

### Love/Like
```typescript
color: colors.error // Red/pink hearts
```

### Achievement
```typescript
badge: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
```

---

## ⚡ **Performance**

All animations use:
- ✅ `useNativeDriver: true`
- ✅ 60 FPS target
- ✅ Optimized re-renders
- ✅ Cleanup on unmount

---

**Quick Tip:** Check `PremiumAnimationsDemo.tsx` for live examples of all animations!
