import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function TieRevealScreen() {
  const { getVotingVerdict, triggerShowdownReVote } = useGameStore();

  const verdict = getVotingVerdict();
  const defendants = verdict.defendants || [];

  // Ambient neon purple pulse effect
  const pulseGlow = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseGlow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseGlow, { toValue: 0.5, duration: 900, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FimpoText style={styles.headerSub}>THE BALANCED SCALES</FimpoText>
        <FimpoText style={styles.headerTitle}>STALEMATE! ⚖️</FimpoText>
      </View>

      {/* Center Group: Neon Purple Pulsing Focus Card Box */}
      <View style={styles.centerFocusCardSlot}>
        <Animated.View style={[styles.ambientPurpleGlowRing, { opacity: pulseGlow }]} />
        
        <View style={styles.mainTieAlertCard}>
          <FimpoText style={styles.alertHeadingText}>A VOTING TIE OCCURRED</FimpoText>
          <FimpoText style={styles.alertBodyText}>
            The numbers are deadlocked. The suspect pool has narrowed down to these specific players:
          </FimpoText>
        </View>
      </View>

      {/* Horizontally scrolling list displaying the deadlocked targets */}
      <View style={styles.defendantsSectionWrapper}>
        <ScrollView 
          contentContainerStyle={styles.defendantsScrollList} 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
        >
          {defendants.map((player) => (
            <View key={player.id} style={styles.defendantProfileCard}>
              <View style={styles.badgeAnchor}>
                <FimpoText style={styles.badgeText}>DEFENDANT</FimpoText>
              </View>
              <Image source={{ uri: player.avatar }} style={styles.defendantAvatar} />
              <FimpoText style={styles.defendantName} numberOfLines={1}>{player.name}</FimpoText>
              <FimpoText style={styles.voteTallySub}>{player.votesReceived} Ballots Cast</FimpoText>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Rules Prompt Guide Box */}
      <View style={styles.showdownRuleBox}>
        <FimpoText style={styles.ruleTitle}>⚠️ FINAL SHOWDOWN DEBATE</FimpoText>
        <FimpoText style={styles.ruleBody}>
          The accused players get 30 seconds to argue their innocence. Once the debate concludes, pass the device around to cast a re-vote!
        </FimpoText>
      </View>

      {/* Action Button: Executes your original store re-vote loop */}
      <TouchableOpacity 
        style={styles.actionBtn} 
        activeOpacity={0.85}
        onPress={() => triggerShowdownReVote()}
      >
        <FimpoText style={styles.actionBtnText}>LAUNCH SHOWDOWN RE-VOTE ➔</FimpoText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sleek Deep Cyberpunk Purple palette
  container: { flex: 1, backgroundColor: '#0A0516', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 10 },
  headerSub: { fontSize: 12, color: '#6C5B7B', letterSpacing: 2 },
  headerTitle: { fontSize: 28, color: '#9B59B6', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 4, letterSpacing: 1 },

  centerFocusCardSlot: { marginVertical: 15, justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative' },
  ambientPurpleGlowRing: { position: 'absolute', width: width * 0.8, height: 110, borderRadius: 20, backgroundColor: 'rgba(155, 89, 182, 0.12)', shadowColor: '#9B59B6', shadowRadius: 25, shadowOpacity: 0.6, elevation: 5 },
  mainTieAlertCard: { backgroundColor: '#130A24', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#9B59B6', width: '100%', alignItems: 'center' },
  alertHeadingText: { fontSize: 13, color: '#9B59B6', fontWeight: 'bold', letterSpacing: 2, marginBottom: 6 },
  alertBodyText: { fontSize: 13, color: '#A0A2A9', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },

  defendantsSectionWrapper: { width: '100%', height: 170, marginVertical: 5 },
  defendantsScrollList: { alignItems: 'center', paddingHorizontal: 6 },
  defendantProfileCard: { backgroundColor: '#180E2E', padding: 14, borderRadius: 16, alignItems: 'center', marginHorizontal: 8, width: 125, borderWidth: 1, borderColor: 'rgba(155, 89, 182, 0.25)' },
  badgeAnchor: { backgroundColor: 'rgba(155, 89, 182, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 8 },
  badgeText: { color: '#D2B4DE', fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  defendantAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#130A24', marginBottom: 6 },
  defendantName: { fontSize: 14, color: '#FFF', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', textAlign: 'center' },
  voteTallySub: { fontSize: 11, color: '#6C5B7B', marginTop: 2 },

  showdownRuleBox: { backgroundColor: '#160E29', borderWidth: 1, borderColor: 'rgba(155, 89, 182, 0.2)', borderRadius: 16, padding: 16, marginBottom: 15 },
  ruleTitle: { fontSize: 11, color: '#9B59B6', fontWeight: 'bold', letterSpacing: 1, marginBottom: 4, textAlign: 'center' },
  ruleBody: { fontSize: 13, color: '#A0A2A9', textAlign: 'center', lineHeight: 18 },

  actionBtn: { backgroundColor: '#9B59B6', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#9B59B6', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  actionBtnText: { fontSize: 15, color: '#FFF', fontWeight: 'bold', letterSpacing: 1.5 }
});