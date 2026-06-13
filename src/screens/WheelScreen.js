import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions, Image, TouchableOpacity } from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;

export default function WheelScreen() {
  const { players, startingPlayerId, setPhase } = useGameStore();
  const [hasSpun, setHasSpun] = useState(false);
  const [winnerAnnounced, setWinnerAnnounced] = useState(false);
  
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 1. Geometry Math calculations: Angle per sector segments
  const totalPlayers = players.length;
  const anglePerPlayer = 360 / totalPlayers;
  
  // Find index location of the chosen start target
  const winnerIndex = players.findIndex(p => p.id === startingPlayerId);
  const winnerPlayer = players[winnerIndex];

  const handleStartSpin = () => {
    if (hasSpun) return;
    setHasSpun(true);

    // Calculate rotation bounds: 5 Full spins + offset to point target to the top absolute pointer (0 deg)
    // Wheel rotates counter-clockwise so target travels towards top pointer arrow indicator
    const targetAngle = 360 - (winnerIndex * anglePerPlayer);
    const finalRotationValue = (360 * 5) + targetAngle; 

    Animated.timing(spinAnim, {
      toValue: finalRotationValue,
      duration: 4000,
      easing: Easing.out(Easing.cubic), // Smooth deceleration physics simulation
      useNativeDriver: true,
    }).start(() => {
      setWinnerAnnounced(true);
      
      // Flash / Pulse winner banner accent
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 250, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 250, useNativeDriver: true })
        ]),
        { iterations: 3 }
      ).start();
    });
  };

  // Convert pure integers to standard stylesheet rotation angle values
  const rotateWheelInterpolation = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FimpoText style={styles.title}>Wheel of Fate</FimpoText>
        <FimpoText style={styles.subtitle}>Who will start descriptions first?</FimpoText>
      </View>

      {/* Spinner Mechanical Core Group */}
      <View style={styles.wheelWrapper}>
        {/* Top Stationary Indicator Arrow Pointer */}
        <View style={styles.pointerArrow} />

        <Animated.View style={[styles.wheelCircle, { transform: [{ rotate: rotateWheelInterpolation }] }]}>
          {players.map((player, idx) => {
            const currentAngle = idx * anglePerPlayer;
            const radius = WHEEL_SIZE / 2.7; // Radii bounds distance from dead center point axis

            // Convert polar sector coordinate projections into absolute 2D transformations
            const rad = (currentAngle * Math.PI) / 180;
            const transformX = radius * Math.sin(rad);
            const transformY = -radius * Math.cos(rad);

            return (
              <View 
                key={player.id} 
                style={[
                  styles.avatarSectorNode, 
                  { transform: [{ translateX: transformX }, { translateY: transformY }, { rotate: `${currentAngle}deg` }] }
                ]}
              >
                <Image source={{ uri: player.avatar }} style={styles.wheelAvatarItem} />
                <FimpoText style={styles.miniNodeName} numberOfLines={1}>{player.name}</FimpoText>
              </View>
            );
          })}
          
          {/* Wheel Hub Axis Core Ornament */}
          <View style={styles.wheelCenterAxisCard} />
        </Animated.View>
      </View>

      {/* Dynamic Results Control Anchors */}
      <View style={styles.footerContainer}>
        {!hasSpun && (
          <TouchableOpacity style={styles.actionLaunchBtn} onPress={handleStartSpin}>
            <FimpoText style={styles.actionLaunchText}>🔥 SPIN THE WHEEL</FimpoText>
          </TouchableOpacity>
        )}

        {winnerAnnounced && (
          <Animated.View style={[styles.winnerCard, { transform: [{ scale: pulseAnim }] }]}>
            <FimpoText style={styles.winnerTextCall}>FIRST PLAYER:</FimpoText>
            <FimpoText style={styles.winnerFinalName}>{winnerPlayer?.name}</FimpoText>
            
            <TouchableOpacity 
              style={styles.proceedMatchBtn} 
              onPress={() => setPhase(GAME_PHASES.ROLE_REVEAL)}
            >
              <FimpoText style={styles.proceedMatchText}>PROCEED TO REVEAL ➔</FimpoText>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 10 },
  title: { fontSize: 32, color: '#FF6B6B', letterSpacing: 2, textTransform: 'uppercase' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  
  wheelWrapper: { width: WHEEL_SIZE, height: WHEEL_SIZE, alignItems: 'center', justifyContent: 'center', marginVertical: 40 },
  pointerArrow: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 16, borderRightWidth: 16, borderBottomWidth: 28, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#FF6B6B', position: 'absolute', top: -15, zIndex: 99, transform: [{ rotate: '180deg' }] },
  
  wheelCircle: { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2, backgroundColor: '#1A1A1A', borderWidth: 6, borderColor: '#262626', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  wheelCenterAxisCard: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6B6B', borderHorizontalWidth: 4, borderColor: '#121212', position: 'absolute', zIndex: 10 },
  
  avatarSectorNode: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 70, height: 80 },
  wheelAvatarItem: { width: 50, height: 50, backgroundColor: '#262626', borderRadius: 25, borderWidth: 1, borderColor: '#444' },
  miniNodeName: { fontSize: 10, color: '#A0A0A0', marginTop: 4, width: 65, textAlign: 'center' },

  footerContainer: { width: '100%', height: 140, justifyContent: 'center' },
  actionLaunchBtn: { backgroundColor: '#FF6B6B', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#FF6B6B', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  actionLaunchText: { fontSize: 16, letterSpacing: 1 },
  
  winnerCard: { backgroundColor: '#1C1616', borderWidth: 1, borderColor: '#FF6B6B', borderRadius: 16, padding: 16, alignItems: 'center' },
  winnerTextCall: { fontSize: 11, color: '#A0A0A0', letterSpacing: 2 },
  winnerFinalName: { fontSize: 26, color: '#FF6B6B', marginVertical: 2, textTransform: 'uppercase', letterSpacing: 1 },
  proceedMatchBtn: { marginTop: 10, backgroundColor: '#FF6B6B', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  proceedMatchText: { fontSize: 13, color: '#FFF', letterSpacing: 1 }
});