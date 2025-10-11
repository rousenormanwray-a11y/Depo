import React, { useState } from 'react';
import { View, Image, StyleSheet, Animated, ImageProps, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';

interface ProgressiveImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholderColor?: string;
  showLoader?: boolean;
}

/**
 * Image component with loading state and fade-in animation
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  style,
  placeholderColor = colors.gray[200],
  showLoader = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleLoadEnd = () => {
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {isLoading && !error && showLoader && (
        <View style={[StyleSheet.absoluteFill, styles.placeholder, { backgroundColor: placeholderColor }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      
      {error && (
        <View style={[StyleSheet.absoluteFill, styles.placeholder, { backgroundColor: placeholderColor }]}>
          <Image
            source={require('../../assets/placeholder.png')}
            style={{ width: 50, height: 50, opacity: 0.3 }}
            resizeMode="contain"
          />
        </View>
      )}

      <Animated.Image
        source={source}
        style={[style, { opacity: fadeAnim }]}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressiveImage;
