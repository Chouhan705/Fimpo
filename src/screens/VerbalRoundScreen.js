import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

export default function VerbalRoundScreen() {
  const { players, startingPlayerId, startVotingPhase } = useGameStore();
  const startingPlayer = players.find(p => p.id === startingPlayerId);

  return (
    <View style={styles.container}>
      {/* Informative Rules Header */}
      <View style={styles.header}>
        <FimpoText style={styles.title}>Verbal Round</FimpoText>
        <FimpoText style={styles.ruleBadge}>🗣️ 1-3 WORDS ONLY</FimpoText>
      </View>

      {/* Focus Area: Who goes first */}
      <View style={styles.centerCard}>
        <FimpoText style={styles.promptLabel}>STARTING SPEAKER:</FimpoText>
        <Image source={{ uri: startingPlayer?.avatar }} style={styles.speakerAvatar} />
        <FimpoText style={styles.speakerName}>{startingPlayer?.name}</FimpoText>
        <FimpoText style={styles.hintText}>
          Describe your card without giving it away entirely. The circle proceeds clockwise from here.
        </FimpoText>
      </View>

      {/* Footer Start Voting Anchor */}
      <TouchableOpacity 
        style={styles.voteButton} 
        activeOpacity={0.8}
        onPress={startVotingPhase}
      >
        <FimpoText style={styles.voteButtonText}>START SECRET BALLOT ➔</FimpoText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 50, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 10 },
  title: { fontSize: 32, color: '#FF6B6B', letterSpacing: 2, textTransform: 'uppercase' },
  ruleBadge: { backgroundColor: '#1A1A1A', color: '#A0A0A0', fontSize: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 10, letterSpacing: 1, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  centerCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#262626' },
  promptLabel: { fontSize: 13, color: '#666', letterSpacing: 2 },
  speakerAvatar: { width: 140, height: 140, backgroundColor: '#262626', borderRadius: 70, marginVertical: 20 },
  speakerName: { fontSize: 28, color: '#FFF', textTransform: 'uppercase', letterSpacing: 1 },
  hintText: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 15, lineHeight: 20, paddingHorizontal: 10 },
  voteButton: { backgroundColor: '#FF6B6B', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#FF6B6B', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  voteButtonText: { fontSize: 16, letterSpacing: 1 }
});