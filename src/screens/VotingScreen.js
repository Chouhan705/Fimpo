import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function VotingScreen() {
  const { players, activeVoteIndex, startingPlayerId, castSecretVote } = useGameStore();
  const [isHandoffState, setIsHandoffState] = useState(true);

  const totalPlayers = players.length;
  const startIndex = players.findIndex(p => p.id === startingPlayerId);

  // Use the same modulo wrapping formula to preserve the original discussion order
  const currentVoterIndex = (startIndex + activeVoteIndex) % totalPlayers;
  const currentVoter = players[currentVoterIndex];

  // Filter out the current voter from the list so players can't vote for themselves
  const viableSuspects = players.filter(p => p.id !== currentVoter?.id);

  // Secure Handoff View Guard
  if (isHandoffState) {
    return (
      <View style={styles.handoffContainer}>
        <FimpoText style={styles.handoffTitle}>🗳️ SECRET BALLOT PASS</FimpoText>
        
        <View style={styles.centerPassGroup}>
          <FimpoText style={styles.instructText}>PASS DEVICE TO:</FimpoText>
          <FimpoText style={styles.voterNameTarget}>{currentVoter?.name}</FimpoText>
          <Image source={{ uri: currentVoter?.avatar }} style={styles.giantAvatar} />
        </View>

        <TouchableOpacity 
          style={styles.openGridBtn} 
          onPress={() => setIsHandoffState(false)}
        >
          <FimpoText style={styles.openGridBtnText}>I AM {currentVoter?.name.toUpperCase()} (ENTER BALLOT)</FimpoText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Active Voter Status bar */}
      <View style={styles.topBar}>
        <FimpoText style={styles.topVoterLabel}>CAST YOUR SUSPECT VOTE</FimpoText>
        <FimpoText style={styles.activeVoterTitle}>{currentVoter?.name}</FimpoText>
      </View>

      {/* Grid of Suspects */}
      <FlatList
        data={viableSuspects}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.gridCard}
            activeOpacity={0.7}
            onPress={() => {
              castSecretVote(item.id); // Register the vote inside our store
              setIsHandoffState(true);   // Immediately trigger handoff shield for the next voter
            }}
          >
            <Image source={{ uri: item.avatar }} style={styles.gridAvatar} />
            <FimpoText style={styles.suspectName} numberOfLines={1}>{item.name}</FimpoText>
            <View style={styles.voteBadgeAnchor}>
              <FimpoText style={styles.voteBadgeText}>ACCUSE</FimpoText>
            </View>
          </TouchableOpacity>
        )}
      />

      <FimpoText style={styles.footerWarning}>Your choice remains completely private</FimpoText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingVertical: 40, paddingHorizontal: 16 },
  topBar: { alignItems: 'center', marginBottom: 20 },
  topVoterLabel: { fontSize: 12, color: '#666', letterSpacing: 2 },
  activeVoterTitle: { fontSize: 26, color: '#FF6B6B', textTransform: 'uppercase', marginTop: 2 },
  gridContainer: { paddingBottom: 20 },
  gridCard: { backgroundColor: '#1A1A1A', flex: 1, margin: 8, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#262626', maxWidth: (width - 48) / 2 },
  gridAvatar: { width: 85, height: 85, backgroundColor: '#262626', borderRadius: 42.5 },
  suspectName: { fontSize: 16, color: '#FFF', marginVertical: 8, textTransform: 'uppercase', letterSpacing: 1 },
  voteBadgeAnchor: { backgroundColor: 'rgba(255, 107, 107, 0.1)', borderWidth: 1, borderColor: '#FF6B6B', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  voteBadgeText: { color: '#FF6B6B', fontSize: 11, fontWeight: 'bold' },
  footerWarning: { fontSize: 11, color: '#444', textAlign: 'center', marginTop: 10, letterSpacing: 0.5 },

  // Handoff Shield Styles
  handoffContainer: { flex: 1, backgroundColor: '#161313', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  handoffTitle: { fontSize: 14, color: '#FF6B6B', letterSpacing: 3 },
  centerPassGroup: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  instructText: { fontSize: 16, color: '#666' },
  voterNameTarget: { fontSize: 38, color: '#FF6B6B', marginVertical: 12, textTransform: 'uppercase', letterSpacing: 1 },
  giantAvatar: { width: 160, height: 160, backgroundColor: '#262626', borderRadius: 80, marginTop: 10 },
  openGridBtn: { backgroundColor: '#FF6B6B', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  openGridBtnText: { fontSize: 14, letterSpacing: 1 }
});