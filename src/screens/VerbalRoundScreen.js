import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Image, TouchableOpacity } from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function VerbalRoundScreen() {
  const { players, startingPlayerId, setPhase } = useGameStore();

  // Animation nodes for ambient cyberpunk aesthetic effects
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Configuration for circular layout geometry mapping
  const CENTER_CONTAINER_SIZE = width * 0.85;
  const RADIUS = CENTER_CONTAINER_SIZE * 0.36; // Distance of avatars from center axis

  useEffect(() => {
    // 1. Subtle scaling pulse loop for the center microphone radar
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true })
      ])
    ).start();

    // 2. Continuous slow rotation tracking for the ring's ambient border ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        linear: true,
        useNativeDriver: true
      })
    ).start();
  }, []);

  const spinAngle = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Top Fixed Global Header (Theme badge removed!) */}
      <View style={styles.metaHeader}>
        <FimpoText style={styles.roundStatusNotify}>SPEAKER CIRCLE LIVE</FimpoText>
      </View>

      {/* Center Circle Matrix Assembly Wrapper */}
      <View style={styles.matrixViewportCenter}>
        
        {/* Ambient Orbit Tracker Background Line */}
        <Animated.View style={[styles.orbitWireframeBorder, { transform: [{ rotate: spinAngle }] }]} />

        {/* Dynamic Positional Mapping Ring */}
        <View style={[styles.circleRingCore, { width: CENTER_CONTAINER_SIZE, height: CENTER_CONTAINER_SIZE }]}>
          {players.map((player, index) => {
            // Distribute angles evenly along the 360° circle plane
            const angle = (index * 2 * Math.PI) / players.length - Math.PI / 2;
            const x = RADIUS * Math.cos(angle);
            const y = RADIUS * Math.sin(angle);

            const isStartingSpeaker = player.id === startingPlayerId;

            return (
              <View 
                key={player.id} 
                style={[
                  styles.positionedAvatarAnchor, 
                  { transform: [{ translateX: x }, { translateY: y }] }
                ]}
              >
                {/* Visual Crown Pointer Indicator specifically anchoring the starting speaker */}
                {isStartingSpeaker && (
                  <View style={styles.starterCrownIndicatorTag}>
                    <FimpoText style={styles.crownTextItem}>🎙️ START</FimpoText>
                  </View>
                )}

                <View style={[styles.avatarBorderGlow, isStartingSpeaker && styles.activeStarterBorder]}>
                  <Image source={{ uri: player.avatar }} style={styles.nestedCircleUserAvatar} />
                </View>
                <FimpoText style={[styles.circlePlayerNameText, isStartingSpeaker && styles.activeStarterText]} numberOfLines={1}>
                  {player.name}
                </FimpoText>
              </View>
            );
          })}

          {/* Central Microphone Core Radar Node */}
          <Animated.View style={[styles.centralRadarNode, { transform: [{ scale: pulseAnim }] }]}>
            <FimpoText style={styles.radarMicSymbol}>🎤</FimpoText>
          </Animated.View>
        </View>
      </View>

      {/* Rules Banner Summary Footer Block */}
      <View style={styles.instructionBanner}>
        <FimpoText style={styles.instructTitle}>ROUND DISCUSSIONS GUIDES</FimpoText>
        <FimpoText style={styles.instructBody}>
          Follow the ring order starting from the <FimpoText style={styles.purpleHighlight}>🎙️ START</FimpoText> badge icon marker. Give your description out loud, then tap below to vote.
        </FimpoText>
      </View>

      {/* Navigation Trigger Button out of the Verbal circle */}
      <TouchableOpacity 
        style={styles.launchBallotBtn} 
        activeOpacity={0.85}
        onPress={() => setPhase(GAME_PHASES.VOTING)}
      >
        <FimpoText style={styles.launchBallotBtnText}>PROCEED TO BALLOT GRIDS ➔</FimpoText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0516', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  
  metaHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  roundStatusNotify: { color: '#6C5B7B', fontSize: 24, letterSpacing: 2 },

  // Center Math Positioning Frameworks
  matrixViewportCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  orbitWireframeBorder: { position: 'absolute', width: width * 0.72, height: width * 0.72, borderRadius: (width * 0.72) / 2, borderWidth: 1, borderColor: 'rgba(155, 89, 182, 0.15)', borderStyle: 'dashed' },
  circleRingCore: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  
  positionedAvatarAnchor: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 90 },
  avatarBorderGlow: { width: 64, height: 64, backgroundColor: '#130A24', borderRadius: 32, borderWidth: 2, borderColor: '#261C3D', padding: 2, justifyContent: 'center', alignItems: 'center' },
  activeStarterBorder: { borderColor: '#9B59B6', backgroundColor: '#1C0C33', shadowColor: '#9B59B6', shadowRadius: 10, shadowOpacity: 0.5 },
  nestedCircleUserAvatar: { width: '100%', height: '100%', borderRadius: 28, backgroundColor: '#1A0F33' },
  circlePlayerNameText: { color: '#6C5B7B', fontSize: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', width: '100%' },
  activeStarterText: { color: '#FFF'},

  // Speaker Anchor Crown Tag
  starterCrownIndicatorTag: { position: 'absolute', top: -18, backgroundColor: '#9B59B6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, zIndex: 10, shadowColor: '#9B59B6', shadowRadius: 4, shadowOpacity: 0.4 },
  crownTextItem: { color: '#FFF', fontSize: 12, letterSpacing: 0.5 },

  // Central Radar Microphone Graphic
  centralRadarNode: { width: 70, height: 70, backgroundColor: '#130A24', borderRadius: 35, borderWidth: 1.5, borderColor: '#9B59B6', justifyContent: 'center', alignItems: 'center', shadowColor: '#9B59B6', shadowRadius: 15, shadowOpacity: 0.3, elevation: 5 },
  radarMicSymbol: { fontSize: 24 },

  instructionBanner: { backgroundColor: '#160E29', borderWidth: 1, borderColor: 'rgba(155, 89, 182, 0.2)', borderRadius: 16, padding: 16, marginBottom: 15 },
  instructTitle: { fontSize: 16, color: '#9B59B6', letterSpacing: 1, marginBottom: 4, textAlign: 'center' },
  instructBody: { fontSize: 14, color: '#A0A2A9', textAlign: 'center', lineHeight: 18 },
  purpleHighlight: { color: '#9B59B6' },

  // Bottom Trigger Confirmation Button
  launchBallotBtn: { backgroundColor: '#9B59B6', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#9B59B6', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  launchBallotBtnText: { fontSize: 20, color: '#FFF', letterSpacing: 1.5 }
});