import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

export default function ShowdownScreen() {
  const { players, triggerShowdownReVote } = useGameStore();

  // Extract who tied for the max votes to present them on the chopping block
  const maxVotes = Math.max(...players.map(p => p.votesReceived));
  const defendants = players.filter(p => p.votesReceived === maxVotes);

  return (
    <View style={styles.container}>
      {/* Alert Header */}
      <View style={styles.header}>
        <FimpoText style={styles.title}>⚖️ SHOWDOWN ⚖️</FimpoText>
        <FimpoText style={styles.subtitle}>A stalemate has occurred!</FimpoText>
      </View>

      {/* Description Prompt Box */}
      <View style={styles.instructionCard}>
        <FimpoText style={styles.cardHeader}>FINAL DEFENSE ROUND</FimpoText>
        <FimpoText style={styles.cardBody}>
          Each tied suspect listed below must give exactly <FimpoText style={styles.highlight}>ONE final, 1-word description</FimpoText> to clear their name.
        </FimpoText>
      </View>

      {/* Tied Defendants List Layout */}
      <ScrollView contentContainerStyle={styles.defendantsList}>
        {defendants.map((player) => (
          <View key={player.id} style={styles.defendantCard}>
            <Image source={{ uri: player.avatar }} style={styles.defendantAvatar} />
            <View style={styles.defendantInfo}>
              <FimpoText style={styles.defendantName}>{player.name}</FimpoText>
              <FimpoText style={styles.voteTallySub}>Tied with {player.votesReceived} votes</FimpoText>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Action Footer Triggering Re-Vote Ballot */}
      <TouchableOpacity 
        style={styles.reVoteBtn} 
        activeOpacity={0.8}
        onPress={triggerShowdownReVote}
      >
        <FimpoText style={styles.reVoteBtnText}>LAUNCH RE-VOTE BALLOT ➔</FimpoText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 10 },
  title: { fontSize: 32, color: '#E74C3C', letterSpacing: 2 },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  
  instructionCard: { backgroundColor: '#1C1616', borderWidth: 1, borderColor: '#E74C3C', borderRadius: 16, padding: 20, marginVertical: 15 },
  cardHeader: { fontSize: 12, color: '#E74C3C', fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  cardBody: { fontSize: 14, color: '#A0A0A0', lineHeight: 22 },
  highlight: { color: '#FFF', fontWeight: 'bold' },

  defendantsList: { paddingVertical: 10 },
  defendantCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#262626' },
  defendantAvatar: { width: 60, height: 60, backgroundColor: '#262626', borderRadius: 30, marginRight: 16 },
  defendantInfo: { justifyContent: 'center' },
  defendantName: { fontSize: 18, color: '#FFF', textTransform: 'uppercase', letterSpacing: 1 },
  voteTallySub: { fontSize: 12, color: '#555', marginTop: 2 },

  reVoteBtn: { backgroundColor: '#E74C3C', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#E74C3C', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  reVoteBtnText: { fontSize: 16, letterSpacing: 1 }
});