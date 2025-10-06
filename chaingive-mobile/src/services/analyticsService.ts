export const analytics = {
  track: (event: string, props?: Record<string, any>) => {
    // Placeholder analytics tracker; replace with Mixpanel or similar
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[analytics]', event, props || {});
    }
  },
};
