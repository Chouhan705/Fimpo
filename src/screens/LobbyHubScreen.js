import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function LobbyHubScreen() {
  const { players, initializeMatch, resetGame } = useGameStore();
  const [activeTab, setActiveTab] = useState('ROSTER'); // 'ROSTER' or 'LEADERBOARD'

  // Sort out high-scores dynamically to build out leaderboards
  const rankedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <View style={styles.container}>
      {/* Top Main Heading Header */}
      <View style={styles.header}>
        <FimpoText style={styles.title}>Game Lobby</FimpoText>
        <FimpoText style={styles.subtitle}>Session Scoreboard Tracking</FimpoText>
      </View>

      {/* Mode Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'ROSTER' && styles.tabActive]} 
          onPress={() => setActiveTab('ROSTER')}
        >
          <FimpoText style={[styles.tabText, activeTab === 'ROSTER' && styles.tabTextActive]}>👥 ACTIVE LOBBY</FimpoText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'LEADERBOARD' && styles.tabActive]} 
          onPress={() => setActiveTab('LEADERBOARD')}
        >
          <FimpoText style={[styles.tabText, activeTab === 'LEADERBOARD' && styles.tabTextActive]}>🏆 LEADERBOARD</FimpoText>
        </TouchableOpacity>
      </View>

      {/* Main Container Content */}
      <ScrollView contentContainerStyle={styles.scrollList}>
        {activeTab === 'ROSTER' ? (
          // Tab A: Unordered Starting Layout Grid list
          players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.leftProfileGroup}>
                <Image source={{ uri: player.avatar }} style={styles.avatarImg} />
                <FimpoText style={styles.playerNameText}>{player.name}</FimpoText>
              </View>
              <View style={styles.scoreBadge}>
                <FimpoText style={styles.scoreText}>{player.score} PTS</FimpoText>
              </View>
            </View>
          ))
        ) : (
          // Tab B: Hierarchy Sorted Standings list
          rankedPlayers.map((player, index) => {
            const isFirst = index === 0 && player.score > 0;
            return (
              <View key={player.id} style={[styles.playerCard, isFirst && styles.goldCardAccent]}>
                <View style={styles.leftProfileGroup}>
                  <FimpoText style={[styles.rankNumber, isFirst && styles.goldRankText]}>
                    #{index + 1}
                  </FimpoText>
                  <Image source={{ uri: player.avatar }} style={styles.avatarImg} />
                  <FimpoText style={styles.playerNameText}>
                    {player.name} {isFirst ? '👑' : ''}
                  </FimpoText>
                </View>
                <View style={[styles.scoreBadge, isFirst && styles.goldBadgeAccent]}>
                  <FimpoText style={styles.scoreText}>{player.score} PTS</FimpoText>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Footer Game Interaction Control Deck */}
      <View style={styles.footerDeck}>
        <TouchableOpacity style={styles.exitSessionButton} onPress={() => resetGame()}>
          <FimpoText style={styles.exitText}>QUIT GAME</FimpoText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.startRoundButton} onPress={() => initializeMatch()}>
          <FimpoText style={styles.startRoundText}>START NEXT ROUND ➔</FimpoText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 30, paddingHorizontal: 24 },
  title: { fontSize: 32, color: '#FF6B6B', letterSpacing: 2, textTransform: 'uppercase' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, marginHorizontal: 24, marginTop: 24, padding: 4, borderWidth: 1, borderColor: '#262626' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#262626' },
  tabText: { fontSize: 13, color: '#666', fontWeight: 'bold' },
  tabTextActive: { color: '#FF6B6B' },

  scrollList: { paddingHorizontal: 24, paddingVertical: 20 },
  playerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#262626' },
  goldCardAccent: { borderColor: '#F1C40F', backgroundColor: '#1E1B10' },
  leftProfileGroup: { flexDirection: 'row', alignItems: 'center' },
  rankNumber: { fontSize: 16, color: '#666', marginRight: 12, minWidth: 24, textAlign: 'center' },
  goldRankText: { color: '#F1C40F', fontWeight: 'bold' },
  avatarImg: { width: 45, height: 45, backgroundColor: '#262626', borderRadius: 22.5, marginRight: 15 },
  playerNameText: { fontSize: 16, color: '#FFF', textTransform: 'uppercase', letterSpacing: 1 },
  scoreBadge: { backgroundColor: '#262626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  goldBadgeAccent: { backgroundColor: '#F1C40F' },
  scoreText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  footerDeck: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 24, backgroundColor: '#141414', borderTopWidth: 1, borderColor: '#222' },
  exitSessionButton: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#262626', marginRight: 12, justifyContent: 'center' },
  exitText: { color: '#777', fontSize: 13, letterSpacing: 1 },
  startRoundButton: { flex: 1, backgroundColor: '#FF6B6B', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B6B', shadowRadius: 8, shadowOpacity: 0.2, elevation: 4 },
  startRoundText: { fontSize: 15, letterSpacing: 1 }
});