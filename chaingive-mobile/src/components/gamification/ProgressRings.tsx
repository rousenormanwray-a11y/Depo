import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ProgressRingsProps {
  giveProgress: number;
  giveGoal: number;
  earnProgress: number;
  earnGoal: number;
  engageProgress: number;
  engageGoal: number;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressRings({
  giveProgress,
  giveGoal,
  earnProgress,
  earnGoal,
  engageProgress,
  engageGoal,
  size = 250,
}: ProgressRingsProps) {
  const center = size / 2;
  const strokeWidth = 12;
  
  // Ring radii
  const outerRadius = center - strokeWidth;
  const middleRadius = center - strokeWidth * 3;
  const innerRadius = center - strokeWidth * 5;
  
  // Calculate circumferences
  const outerCircumference = 2 * Math.PI * outerRadius;
  const middleCircumference = 2 * Math.PI * middleRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;
  
  // Calculate percentages
  const givePercentage = Math.min((giveProgress / giveGoal) * 100, 100);
  const earnPercentage = Math.min((earnProgress / earnGoal) * 100, 100);
  const engagePercentage = Math.min((engageProgress / engageGoal) * 100, 100);
  
  // Animated values
  const giveAnim = useRef(new Animated.Value(0)).current;
  const earnAnim = useRef(new Animated.Value(0)).current;
  const engageAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(giveAnim, {
      toValue: givePercentage,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(earnAnim, {
      toValue: earnPercentage,
      duration: 1000,
      delay: 200,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(engageAnim, {
      toValue: engagePercentage,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, [givePercentage, earnPercentage, engagePercentage]);
  
  const getStrokeDashoffset = (percentage: number, circumference: number) => {
    return circumference - (circumference * percentage) / 100;
  };
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Outer Ring - Give (Red) */}
          <Circle
            cx={center}
            cy={center}
            r={outerRadius}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={outerRadius}
            stroke={givePercentage >= 100 ? '#48BB78' : '#E53E3E'}
            strokeWidth={strokeWidth}
            strokeDasharray={outerCircumference}
            strokeDashoffset={getStrokeDashoffset(givePercentage, outerCircumference)}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Middle Ring - Earn (Gold) */}
          <Circle
            cx={center}
            cy={center}
            r={middleRadius}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={middleRadius}
            stroke={earnPercentage >= 100 ? '#48BB78' : '#FFD700'}
            strokeWidth={strokeWidth}
            strokeDasharray={middleCircumference}
            strokeDashoffset={getStrokeDashoffset(earnPercentage, middleCircumference)}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Inner Ring - Engage (Blue) */}
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke={engagePercentage >= 100 ? '#48BB78' : '#4299E1'}
            strokeWidth={strokeWidth}
            strokeDasharray={innerCircumference}
            strokeDashoffset={getStrokeDashoffset(engagePercentage, innerCircumference)}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      
      {/* Center Content */}
      <View style={styles.centerContent}>
        {givePercentage >= 100 && earnPercentage >= 100 && engagePercentage >= 100 ? (
          <>
            <MaterialCommunityIcons name="check-circle" size={48} color="#48BB78" />
            <Text style={styles.perfectDayText}>Perfect Day!</Text>
          </>
        ) : (
          <>
            <Text style={styles.totalPercentage}>
              {Math.round((givePercentage + earnPercentage + engagePercentage) / 3)}%
            </Text>
            <Text style={styles.totalLabel}>Complete</Text>
          </>
        )}
      </View>
    </View>
  );
}

export function ProgressRingLegend() {
  return (
    <View style={styles.legendContainer}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: '#E53E3E' }]} />
        <MaterialCommunityIcons name="gift-outline" size={20} color="#E53E3E" style={styles.legendIcon} />
        <Text style={styles.legendText}>Give</Text>
      </View>
      
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
        <MaterialCommunityIcons name="coin" size={20} color="#FFD700" style={styles.legendIcon} />
        <Text style={styles.legendText}>Earn</Text>
      </View>
      
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: '#4299E1' }]} />
        <MaterialCommunityIcons name="hand-wave-outline" size={20} color="#4299E1" style={styles.legendIcon} />
        <Text style={styles.legendText}>Engage</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalPercentage: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  perfectDayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#48BB78',
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendIcon: {
    marginLeft: 4,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
