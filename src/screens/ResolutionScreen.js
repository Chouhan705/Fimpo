import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

export default function ResolutionScreen() {
  const { players, resolveVotingResults, returnToLobbyHub } = useGameStore();
  const [matchSummary, setMatchSummary] = useState(null);

  // Run the state point-tally calculations once when the screen mounts onto the layout viewport
  useEffect(() => {
    const results = resolveVotingResults();
    setMatchSummary(results);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FimpoText style={styles.title}>Ballot Results</FimpoText>
        <FimpoText style={styles.subtitle}>The group has spoken...</FimpoText>
      </View>

      {/* Center Execution Card Reveal Block */}
      <View style={styles.centerRevealCard}>
        {matchSummary?.status === 'TIE' ? (
          <View style={styles.outcomeGroup}>
            <FimpoText style={styles.outcomeTitle}>STALEMATE! ⚖️</FimpoText>
            <FimpoText style={styles.outcomeDesc}>
              A voting tie occurred. Prepare for a final Showdown round description debate!
            </FimpoText>
          </View>
        ) : (
          <View style={styles.outcomeGroup}>
            <FimpoText style={styles.victimLabel}>MOST ACCUSED PLAYER:</FimpoText>
            <Image source={{ uri: matchSummary?.victim?.avatar }} style={styles.victimAvatar} />
            <FimpoText style={styles.victimName}>{matchSummary?.victim?.name}</FimpoText>
            
            {matchSummary?.victim?.isImposter ? (
              <View style={styles.winBadgeCivilian}>
                <FimpoText style={styles.winBadgeText}>IMPOSTER CAUGHT! CIVILIANS WIN 🎉</FimpoText>
              </View>
            ) : (
              <View style={styles.winBadgeImposter}>
                <FimpoText style={styles.winBadgeText}>ELIMINATED A CIVILIAN! IMPOSTER WINS 🦊</FimpoText>
              </View>
            )}
          </View>
        )}
      </View>

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

      {/* Return Action Hook Container Button back into persistent game hub */}
      <TouchableOpacity 
        style={styles.lobbyReturnBtn} 
        activeOpacity={0.8}
        onPress={returnToLobbyHub}
      >
        <FimpoText style={styles.lobbyReturnBtnText}>RETURN TO LOBBY HUB ➔</FimpoText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  header: { alignItems: 'center' },
  title: { fontSize: 32, color: '#FF6B6B', letterSpacing: 2, textTransform: 'uppercase' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  
  centerRevealCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, alignItems: 'center', marginVertical: 15, borderWidth: 1, borderColor: '#262626' },
  outcomeGroup: { alignItems: 'center', width: '100%' },
  outcomeTitle: { fontSize: 24, color: '#E74C3C', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  outcomeDesc: { fontSize: 13, color: '#A0A0A0', textAlign: 'center', lineHeight: 20 },
  
  victimLabel: { fontSize: 11, color: '#666', letterSpacing: 2 },
  victimAvatar: { width: 110, height: 110, backgroundColor: '#262626', borderRadius: 55, marginVertical: 15 },
  victimName: { fontSize: 26, color: '#FFF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  
  winBadgeCivilian: { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderWidth: 1, borderColor: '#2ECC71', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  winBadgeImposter: { backgroundColor: 'rgba(231, 76, 60, 0.15)', borderWidth: 1, borderColor: '#E74C3C', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  winBadgeText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },

  breakdownWrapper: { flex: 1, marginBottom: 20 },
  breakdownHeaderTitle: { fontSize: 12, color: '#444', letterSpacing: 1, marginBottom: 8 },
  breakdownScroll: { backgroundColor: '#161616', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#222' },
  voteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  miniRowAvatar: { width: 35, height: 35, backgroundColor: '#262626', borderRadius: 17.5, marginRight: 12 },
  rowName: { fontSize: 15, color: '#A0A0A0', textTransform: 'uppercase' },
  foxIndicatorText: { marginLeft: 6, fontSize: 12 },
  voteCountBadge: { fontSize: 13, color: '#FF6B6B', fontWeight: 'bold' },

  lobbyReturnBtn: { backgroundColor: '#FF6B6B', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#FF6B6B', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  lobbyReturnBtnText: { fontSize: 16, letterSpacing: 1 }
});