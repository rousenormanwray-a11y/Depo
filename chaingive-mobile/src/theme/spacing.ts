// 8-point spacing grid system
export const spacing = {
  xxs: 2,   // 0.125rem
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 16,   // 1rem
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem
  xxl: 40,  // 2.5rem
  '2xl': 40, // 2.5rem (alias)
  '3xl': 48, // 3rem
  '4xl': 64, // 4rem
  '5xl': 80, // 5rem
  '6xl': 96, // 6rem
};

// Common padding/margin values
export const layout = {
  screenPadding: spacing.md,
  cardPadding: spacing.md,
  buttonPadding: spacing.sm,
  inputPadding: spacing.sm,
  sectionSpacing: spacing.lg,
  itemSpacing: spacing.sm,
};

export type Spacing = typeof spacing;
export type Layout = typeof layout;