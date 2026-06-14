import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

export default function RoundScoreboardScreen() {
  const { players, returnToLobbyHub } = useGameStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FimpoText style={styles.headerSub}>ROUND REWARDS DISTRIBUTION</FimpoText>
        <FimpoText style={styles.headerTitle}>MATCH SCOREBOARD</FimpoText>
      </View>

      {/* Roster matrix rows tracking scoreboard values */}
      <View style={styles.scrollWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {players.map((player) => (
            <View key={player.id} style={styles.scoreRowCard}>
              <View style={styles.rowLeftGroup}>
                <Image source={{ uri: player.avatar }} style={styles.rowAvatar} />
                <View style={styles.rowMetaInfo}>
                  <FimpoText style={styles.rowName} numberOfLines={1}>{player.name}</FimpoText>
                  <FimpoText style={styles.rowRoleSub}>{player.isImposter ? '🦊 IMPOSTER' : '🛡️ CIVILIAN'}</FimpoText>
                </View>
              </View>
              
              <View style={styles.rowRightGroup}>
                <FimpoText style={styles.scorePointsLabel}>SCORE: {player.score} PTS</FimpoText>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Main Back Loop Button directly navigating out to persistent hub */}
      <TouchableOpacity 
        style={styles.lobbyReturnBtn} 
        activeOpacity={0.85}
        onPress={() => returnToLobbyHub()}
      >
        <FimpoText style={styles.lobbyReturnBtnText}>RETURN TO LOBBY HUB ➔</FimpoText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  headerSub: { fontSize: 11, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: 26, color: '#FFF', letterSpacing: 1, fontWeight: 'bold', marginTop: 4 },

  scrollWrapper: { flex: 1, marginVertical: 10 },
  scrollContent: { paddingBottom: 20 },
  scoreRowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1A', padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#262626' },
  rowLeftGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#262626', marginRight: 12 },
  rowMetaInfo: { justifyContent: 'center', flex: 1 },
  rowName: { fontSize: 16, color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' },
  rowRoleSub: { fontSize: 11, color: '#666', marginTop: 2 },
  
  rowRightGroup: { alignItems: 'flex-end' },
  scorePointsLabel: { fontSize: 14, color: '#FF6B6B', fontWeight: 'bold', letterSpacing: 0.5 },

  lobbyReturnBtn: { backgroundColor: '#FF6B6B', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#FF6B6B', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  lobbyReturnBtnText: { fontSize: 16, color: '#FFF', fontWeight: 'bold', letterSpacing: 1.5 }
});