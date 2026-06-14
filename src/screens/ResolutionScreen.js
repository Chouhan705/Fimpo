import React, { useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

export default function ResolutionScreen() {
  const { 
    players, 
    getVotingVerdict, 
    applyCivilianEliminationPoints, 
    setPhase, 
    returnToLobbyHub,
    secretWord,
    imposterWord,
    imposterMode
  } = useGameStore();

  const verdict = getVotingVerdict();

  useEffect(() => {
    if (verdict.status === 'DECIDED' && !verdict.victim?.isImposter) {
      applyCivilianEliminationPoints();
    }
  }, []);

  // Locate the actual hidden imposter player to cleanly flag them in the final results list
  const actualImposter = players.find(p => p.isImposter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FimpoText style={styles.title}>Ballot Results</FimpoText>
        <FimpoText style={styles.subtitle}>The group has spoken...</FimpoText>
      </View>

      {/* Center Execution Card Reveal Block */}
      <View style={styles.centerRevealCard}>
        {verdict.status === 'TIE' ? (
          <View style={styles.outcomeGroup}>
            <FimpoText style={styles.outcomeTitle}>STALEMATE! ⚖️</FimpoText>
            <FimpoText style={styles.outcomeDesc}>
              A voting tie occurred. Prepare for a final Showdown round description debate!
            </FimpoText>
          </View>
        ) : (
          <View style={styles.outcomeGroup}>
            <FimpoText style={styles.victimLabel}>MOST ACCUSED PLAYER:</FimpoText>
            <FimpoText style={styles.victimName}>{verdict.victim?.name}</FimpoText>
            
            {verdict.victim?.isImposter ? (
              <View style={styles.winBadgeCivilian}>
                <FimpoText style={styles.winBadgeText}>🎯 TARGET WAS THE IMPOSTER!</FimpoText>
              </View>
            ) : (
              <View style={styles.winBadgeImposter}>
                <FimpoText style={styles.winBadgeText}>💀 ELIMINATED AN INNOCENT CIVILIAN!</FimpoText>
              </View>
            )}
          </View>
        )}
      </View>

      {/* NEW: INFILTRATOR MODE WORDS EXPOSED SIDE-BY-SIDE */}
      {imposterMode === 'INFILTRATOR' && verdict.status !== 'TIE' && (
        <View style={styles.wordRevealBannerCard}>
          <FimpoText style={styles.wordRevealHeader}>📋 WORD CLUE COMPARISON</FimpoText>
          <View style={styles.wordRevealFlexRow}>
            <View style={styles.wordRevealBlock}>
              <FimpoText style={styles.wordRevealLabel}>CIVILIANS HAD:</FimpoText>
              <FimpoText style={styles.wordRevealValueText}>{secretWord}</FimpoText>
            </View>
            <View style={[styles.wordRevealBlock, { borderLeftWidth: 1, borderLeftColor: '#333' }]}>
              <FimpoText style={[styles.wordRevealLabel, { color: '#FF6B6B' }]}>IMPOSTER HAD:</FimpoText>
              <FimpoText style={[styles.wordRevealValueText, { color: '#FF6B6B' }]}>{imposterWord}</FimpoText>
            </View>
          </View>
        </View>
      )}

      {/* Scrollable breakdown list showing exact vote counts cast per player */}
      <View style={styles.breakdownWrapper}>
        <FimpoText style={styles.breakdownHeaderTitle}>VOTE COUNT BREAKDOWN</FimpoText>
        <ScrollView style={styles.breakdownScroll}>
          {players.map((p) => (
            <View key={p.id} style={styles.voteRow}>
              <View style={styles.rowLeft}>
                <Image source={{ uri: p.avatar }} style={styles.miniRowAvatar} />
                <FimpoText style={styles.rowName}>{p.name}</FimpoText>
                {p.isImposter && <FimpoText style={styles.foxIndicatorText}>🦊</FimpoText>}
              </View>
              <FimpoText style={styles.voteCountBadge}>{p.votesReceived} Votes</FimpoText>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Dynamic Action Buttons depending on the verdict status */}
      <View style={styles.footerZone}>
        {verdict.status === 'TIE' && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => setPhase(GAME_PHASES.SHOWDOWN)}>
            <FimpoText style={styles.actionBtnText}>GO TO SHOWDOWN DEBATE ➔</FimpoText>
          </TouchableOpacity>
        )}

        {verdict.status === 'DECIDED' && verdict.victim?.isImposter && (
          <TouchableOpacity style={[styles.actionBtn, styles.redemptionColor]} onPress={() => setPhase(GAME_PHASES.REDEMPTION)}>
            <FimpoText style={styles.actionBtnText}>🦊 TRIGGER IMPOSTER REDEMPTION ➔</FimpoText>
          </TouchableOpacity>
        )}

        {verdict.status === 'DECIDED' && !verdict.victim?.isImposter && (
          <TouchableOpacity style={styles.actionBtn} onPress={returnToLobbyHub}>
            <FimpoText style={styles.actionBtnText}>RETURN TO LOBBY HUB ➔</FimpoText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  header: { alignItems: 'center' },
  title: { fontSize: 32, color: '#FF6B6B', letterSpacing: 2, textTransform: 'uppercase' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  
  centerRevealCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: '#262626' },
  outcomeGroup: { alignItems: 'center', width: '100%' },
  outcomeTitle: { fontSize: 24, color: '#E74C3C', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  outcomeDesc: { fontSize: 13, color: '#A0A0A0', textAlign: 'center', lineHeight: 20 },
  
  victimLabel: { fontSize: 11, color: '#666', letterSpacing: 2 },
  victimName: { fontSize: 28, color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  
  winBadgeCivilian: { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderWidth: 1, borderColor: '#2ECC71', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  winBadgeImposter: { backgroundColor: 'rgba(231, 76, 60, 0.15)', borderWidth: 1, borderColor: '#E74C3C', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  winBadgeText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },

  // --- Dynamic Word Comparison View Layout CSS ---
  wordRevealBannerCard: { backgroundColor: '#161616', borderRadius: 16, padding: 14, marginBottom: 15, borderWidth: 1, borderColor: '#262626' },
  wordRevealHeader: { fontSize: 11, color: '#666', letterSpacing: 1, textAlign: 'center', marginBottom: 10 },
  wordRevealFlexRow: { flexDirection: 'row', width: '100%' },
  wordRevealBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wordRevealLabel: { fontSize: 10, color: '#4A69BD', fontWeight: 'bold', marginBottom: 2 },
  wordRevealValueText: { fontSize: 20, color: '#FFF', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },

  breakdownWrapper: { flex: 1, marginBottom: 15 },
  breakdownHeaderTitle: { fontSize: 12, color: '#444', letterSpacing: 1, marginBottom: 8 },
  breakdownScroll: { backgroundColor: '#161616', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#222' },
  voteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  miniRowAvatar: { width: 35, height: 35, backgroundColor: '#262626', borderRadius: 17.5, marginRight: 12 },
  rowName: { fontSize: 15, color: '#A0A0A0', textTransform: 'uppercase' },
  foxIndicatorText: { marginLeft: 6, fontSize: 12 },
  voteCountBadge: { fontSize: 13, color: '#FF6B6B', fontWeight: 'bold' },

  footerZone: { width: '100%' },
  actionBtn: { backgroundColor: '#262626', borderWidth: 1, borderColor: '#333', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowRadius: 6, shadowOpacity: 0.2, elevation: 3 },
  redemptionColor: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  actionBtnText: { fontSize: 15, color: '#FFF', letterSpacing: 1 }
});