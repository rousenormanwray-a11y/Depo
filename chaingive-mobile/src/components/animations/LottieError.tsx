import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

interface LottieErrorProps {
  visible: boolean;
  onAnimationFinish?: () => void;
  size?: number;
  loop?: boolean;
}

const LottieError: React.FC<LottieErrorProps> = ({
  visible,
  onAnimationFinish,
  size = 200,
  loop = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      // Trigger error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Play animation
      lottieRef.current?.play();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleAnimationFinish = () => {
    if (!loop) {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (onAnimationFinish) {
          onAnimationFinish();
        }
      });
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LottieView
            ref={lottieRef}
            source={require('../../assets/animations/error.json')}
            loop={loop}
            style={{ width: size, height: size }}
            onAnimationFinish={handleAnimationFinish}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LottieError;
