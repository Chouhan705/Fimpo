import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Image, TouchableOpacity } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function RevealScreen() {
  const { 
    players, 
    activeRevealIndex,
    fetchedImages, 
    advanceRevealPlayer, 
    startingPlayerId 
  } = useGameStore();

  const [isGatekeeperPassingState, setIsGatekeeperPassingState] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!fetchedImages || fetchedImages.isFallback || fetchedImages.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % fetchedImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchedImages]);

  const totalPlayers = players.length;
  const startIndex = players.findIndex(p => p.id === startingPlayerId);

  const currentActualIndex = (startIndex + activeRevealIndex) % totalPlayers;
  const activePlayer = players[currentActualIndex];

  const nextActualIndex = (startIndex + activeRevealIndex + 1) % totalPlayers;
  const nextPlayer = players[nextActualIndex];

  useEffect(() => {
    if (isGatekeeperPassingState) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true })
        ])
      ).start();
    }
  }, [isGatekeeperPassingState]);

  if (isGatekeeperPassingState) {
    return (
      <View style={styles.passGatekeeperContainer}>
        <FimpoText style={styles.passLabelHint}>SECURE HANDOFF STATE</FimpoText>
        
        <Animated.View style={[styles.passCenterGroup, { transform: [{ scale: pulseAnim }] }]}>
          <FimpoText style={styles.passInstructCall}>PASS PHONE TO:</FimpoText>
          <FimpoText style={styles.passTargetName}>{nextPlayer?.name}</FimpoText>
          <Image source={{ uri: nextPlayer?.avatar }} style={styles.giantGatekeeperAvatar} />
        </Animated.View>

        <TouchableOpacity 
          style={styles.confirmPassBtn}
          activeOpacity={0.8}
          onPress={() => {
            setIsGatekeeperPassingState(false);
            advanceRevealPlayer();
          }}
        >
          <FimpoText style={styles.confirmPassBtnText}>I AM {nextPlayer?.name.toUpperCase()} ➔</FimpoText>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCompletionStep = () => {
    if (activeRevealIndex + 1 < totalPlayers) {
      setIsGatekeeperPassingState(true);
    } else {
      advanceRevealPlayer();
    }
  };

  return (
    <View style={styles.container}>
      {/* HUD Profile Display */}
      <View style={styles.topBanner}>
        <FimpoText style={styles.passHeader}>CURRENT VIEWER</FimpoText>
        <FimpoText style={styles.playerName}>{activePlayer?.name}</FimpoText>
        <Image source={{ uri: activePlayer?.avatar }} style={styles.avatarRef} />
      </View>

      {/* Secret Card View Window */}
      <View style={styles.cardCenter}>
        {!isPeeking ? (
          <View style={styles.hiddenBox}>
            <FimpoText style={styles.hiddenPrompt}>TOUCH & HOLD BUTTON</FimpoText>
            <FimpoText style={styles.hiddenSub}>Keep screen shielded from other players</FimpoText>
          </View>
        ) : (
          <View style={styles.revealedBox}>
            {activePlayer?.isImposter ? (
              <View style={styles.cardInternal}>
                <FimpoText style={styles.roleTitle}>YOUR SECRET ROLE:</FimpoText>
                <Image source={require('../../assets/fox-logo.png')} style={styles.contentImageFox} resizeMode="contain" />
                <FimpoText style={styles.roleBadge}>IMPOSTER</FimpoText>
                <FimpoText style={styles.wordTarget}>
                  {activePlayer.word === 'Cunning Fox' ? "Blend in! You have no word." : `Word: ${activePlayer?.word}`}
                </FimpoText>
              </View>
            ) : (
              <View style={styles.cardInternal}>
                <FimpoText style={styles.roleTitle}>YOUR SECRET ROLE:</FimpoText>

                {fetchedImages?.isFallback ? (
                  <View style={styles.emojiContainer}>
                    <FimpoText style={styles.fallbackCategory}>Theme: {fetchedImages.categoryName}</FimpoText>
                  </View>
                ) : (
                  <Image 
                    source={{ uri: fetchedImages[carouselIndex] }} 
                    style={styles.contentImageCivilian} 
                    resizeMode="cover" 
                  />
                )}

                <FimpoText style={styles.roleBadgeCivilian}>CIVILIAN</FimpoText>
                <FimpoText style={styles.wordTarget}>Word: {activePlayer?.word}</FimpoText>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Interaction Controls */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          delayLongPress={50}
          onPressIn={() => setIsPeeking(true)}
          onPressOut={() => setIsPeeking(false)}
          style={[styles.peekButton, isPeeking && styles.peekActive]}
        >
          <FimpoText style={styles.peekText}>
            {isPeeking ? "💥 RELEASING CONCEALS DATA 💥" : "HOLD TO PEEK ASSIGNMENT"}
          </FimpoText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.nextButtonContainer, isPeeking && { opacity: 0.1 }]}
          disabled={isPeeking}
          onPress={handleCompletionStep}
        >
          <FimpoText style={styles.nextContainerText}>I'VE MEMORIZED IT</FimpoText>
          <View style={styles.arrowCircleAnchor}>
            <FimpoText style={styles.arrowIconSymbol}>➔</FimpoText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  passGatekeeperContainer: { flex: 1, backgroundColor: '#1C1616', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  passLabelHint: { fontSize: 13, color: '#FF6B6B', letterSpacing: 3 },
  passCenterGroup: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  passInstructCall: { fontSize: 18, color: '#A0A0A0', letterSpacing: 1 },
  passTargetName: { fontSize: 42, color: '#FF6B6B', marginVertical: 15, textTransform: 'uppercase', letterSpacing: 2 },
  giantGatekeeperAvatar: { width: 180, height: 180, backgroundColor: '#2A2A2A', borderRadius: 90, marginTop: 10 },
  confirmPassBtn: { backgroundColor: '#FF6B6B', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#FF6B6B', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  confirmPassBtnText: { fontSize: 16, letterSpacing: 2 },
  topBanner: { alignItems: 'center' },
  passHeader: { fontSize: 24, color: '#666', letterSpacing: 2 },
  playerName: { fontSize: 32, color: '#FF6B6B', marginVertical: 4, textTransform: 'uppercase', letterSpacing: 1 },
  avatarRef: { width: 75, height: 75, backgroundColor: '#1A1A1A', borderRadius: 37.5, marginTop: 4 },
  cardCenter: { flex: 1, marginVertical: 20, justifyContent: 'center' },
  hiddenBox: { backgroundColor: '#161616', borderRadius: 24, padding: 30, alignItems: 'center', height: 340, justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#333' },
  hiddenPrompt: { fontSize: 24, color: '#FF6B6B', letterSpacing: 1 },
  hiddenSub: { fontSize: 16, color: '#555', marginTop: 8 },
  revealedBox: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, alignItems: 'center', height: 340, justifyContent: 'center', borderWidth: 1, borderColor: '#FF6B6B' },
  cardInternal: { alignItems: 'center', width: '100%', height: '100%', justifyContent: 'space-between' },
  roleTitle: { fontSize: 16, color: '#666', letterSpacing: 2 },
  roleBadge: { backgroundColor: 'rgba(255, 107, 107, 0.15)', color: '#FF6B6B', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, fontSize: 20, letterSpacing: 1, overflow: 'hidden' },
  roleBadgeCivilian: { backgroundColor: 'rgba(74, 105, 189, 0.2)', color: '#4A69BD', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, fontSize: 20, letterSpacing: 1, overflow: 'hidden' },
  contentImageFox: { width: 150, height: 150 },
  contentImageCivilian: { width: width * 0.55, height: 140, borderRadius: 16 },
  wordTarget: { fontSize: 28, color: '#FFF', letterSpacing: 1 },
  emojiContainer: { alignItems: 'center' },
  fallbackCategory: { fontSize: 13, color: '#666', marginTop: 4 },
  footer: { width: '100%' },
  peekButton: { backgroundColor: '#262626', borderWidth: 2, borderColor: '#FF6B6B', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  peekActive: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  peekText: { fontSize: 20, letterSpacing: 1 },
  nextButtonContainer: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', width: '100%', paddingVertical: 14, paddingLeft: 24, paddingRight: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextContainerText: { fontSize: 20, color: '#A0A0A0', letterSpacing: 2 },
  arrowCircleAnchor: { backgroundColor: '#FF6B6B', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  arrowIconSymbol: { color: '#FFF', fontSize: 20, lineHeight: 18 },
});