import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function VerdictGatewayScreen() {
  const { setPhase } = useGameStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Animation Nodes
  const pulseScale = useRef(new Animated.Value(0.4)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const startDramaticPulseSequence = () => {
    setIsAnalyzing(true);

    // 1. Hide the static text and button instantly to focus on the flash
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // 2. Execute a high-tension Two-Tick Pulse Sequence
    Animated.sequence([
      // --- TICK 1 ---
      Animated.parallel([
        Animated.timing(pulseScale, { toValue: 1.5, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]),
      Animated.timing(pulseOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),

      // Reset coordinates instantly in the background
      Animated.parallel([
        Animated.timing(pulseScale, { toValue: 0.4, duration: 0, useNativeDriver: true }),
      ]),

      // --- TICK 2 ---
      Animated.parallel([
        Animated.timing(pulseScale, { toValue: 2.2, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]),
      Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      // 3. Sequence complete! Instantly route to the outcome reveal
      setPhase(GAME_PHASES.OUTCOME_REVEAL);
    });
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Content Wrapper (Fades out cleanly on tap) */}
      <Animated.View style={[styles.innerWrapper, { opacity: contentOpacity }]}>
        <View style={styles.topHeader}>
          <FimpoText style={styles.subTitle}>BALLOTS SEALED 🔒</FimpoText>
          <FimpoText style={styles.mainTitle}>ALL VOTES ARE IN</FimpoText>
        </View>

        <View style={styles.centerGroup}>
          <FimpoText style={styles.hintText}>
            Place the phone in the middle of the circle so everyone can see the verdict together!
          </FimpoText>
        </View>
      </Animated.View>

      {/* --- DRAMATIC TWO-TICK PULSE RING --- */}
      {isAnalyzing && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none" style={styles.pulseContainerLayer}>
          <Animated.View 
            style={[
              styles.pulseRingGraphic, 
              { 
                transform: [{ scale: pulseScale }], 
                opacity: pulseOpacity 
              }
            ]} 
          />
          <FimpoText style={styles.decodingLabelText}>LOCKING VERDICT...</FimpoText>
        </View>
      )}

      {/* Main Action Trigger Trigger Button */}
      {!isAnalyzing && (
        <TouchableOpacity 
          style={styles.actionBtn} 
          activeOpacity={0.85}
          onPress={startDramaticPulseSequence}
        >
          <FimpoText style={styles.btnText}>REVEAL GROUP VERDICT ➔</FimpoText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 50, paddingHorizontal: 24 },
  innerWrapper: { flex: 1, justifyContent: 'space-between', width: '100%' },
  topHeader: { alignItems: 'center', marginTop: 20 },
  subTitle: { fontSize: 14, color: '#666', letterSpacing: 2 },
  mainTitle: { fontSize: 32, color: '#FF6B6B', textTransform: 'uppercase', marginTop: 4, letterSpacing: 1 },
  centerGroup: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  hintText: { fontSize: 16, color: '#A0A0A0', textAlign: 'center', lineHeight: 24 },
  actionBtn: { backgroundColor: '#FF6B6B', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#FF6B6B', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  btnText: { fontSize: 16, color: '#FFF', fontWeight: 'bold', letterSpacing: 1.5 },

  // --- Two-Tick Pulse Layout CSS ---
  pulseContainerLayer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  pulseRingGraphic: { width: width * 0.5, height: width * 0.5, borderRadius: (width * 0.5) / 2, borderValues: 4, borderWidth: 3, borderColor: '#FF6B6B', shadowColor: '#FF6B6B', shadowRadius: 20, shadowOpacity: 0.6, position: 'absolute' },
  decodingLabelText: { color: '#FF6B6B', fontSize: 14, fontWeight: 'bold', letterSpacing: 3, marginTop: width * 0.7, textTransform: 'uppercase' }
});