import React, { useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function OutcomeRevealScreen() {
  const { players, getVotingVerdict, applyCivilianEliminationPoints, setPhase } = useGameStore();

  const verdict = getVotingVerdict();
  const isImposterCaught = verdict.status === 'DECIDED' && verdict.victim?.isImposter;

  // Apply background penalty points if civilians missed the target
  useEffect(() => {
    if (verdict.status === 'DECIDED' && !verdict.victim?.isImposter) {
      applyCivilianEliminationPoints();
    }
  }, []);

  const targetedVictimId = verdict.victim?.id;
  const theTrueImposter = players.find(p => p.isImposter);

  // ========================================================
  // --- FIXED: JURY FILTERING INCLUDING THE IMPOSTER ---
  // ========================================================
  const relevantVoters = players.filter(player => {
    if (isImposterCaught) {
      // SCENARIO 1: Imposter Caught -> Show players who voted for the Imposter
      if (player.votedForId) {
        return player.votedForId === targetedVictimId;
      }
      return !player.isImposter; // Fallback: everyone except the fox
    } else {
      // SCENARIO 2: Imposter Not Caught -> Show players who voted for the innocent victim
      if (player.votedForId) {
        return player.votedForId === targetedVictimId;
      }
      
      // FIXED FALLBACK LOGIC: Since players cannot self-vote, EVERYONE else 
      // in the game session contributed to pushing this innocent Civilian out. 
      // We now include the Imposter here if they were part of the round!
      return player.id !== targetedVictimId;
    }
  });

  return (
    <View style={[styles.container, !isImposterCaught && styles.errorBackgroundContainer]}>
      <View style={styles.header}>
        <FimpoText style={styles.headerSub}>THE VERDICT</FimpoText>
        <FimpoText style={[styles.headerTitle, !isImposterCaught && styles.crimsonTextColor]}>
          {isImposterCaught ? 'IMPOSTER CAUGHT! 🎉' : 'INNOCENT ELIMINATED! 💀'}
        </FimpoText>
      </View>

      {/* Center Focus Profile Cards */}
      <View style={styles.centerFocusCardSlot}>
        {isImposterCaught ? (
          <View style={styles.singleFocusCard}>
            <Image source={{ uri: verdict.victim?.avatar }} style={styles.cardAvatar} />
            <FimpoText style={styles.cardNameText}>{verdict.victim?.name}</FimpoText>
            <FimpoText style={styles.roleLabelText}>THE TRUE IMPOSTER</FimpoText>
          </View>
        ) : (
          <View style={styles.splitRowCards}>
            <View style={[styles.splitCard, styles.cardLeftVictim]}>
              <FimpoText style={styles.splitCardLabel}>VOTED OUT</FimpoText>
              <Image source={{ uri: verdict.victim?.avatar }} style={styles.splitAvatar} />
              <FimpoText style={styles.splitName} numberOfLines={1}>{verdict.victim?.name}</FimpoText>
              <FimpoText style={styles.splitRoleSub}>CIVILIAN</FimpoText>
            </View>
            <View style={[styles.splitCard, styles.cardRightImposter]}>
              <FimpoText style={[styles.splitCardLabel, { color: '#FF6B6B' }]}>THE TRAITOR</FimpoText>
              <Image source={{ uri: theTrueImposter?.avatar }} style={styles.splitAvatar} />
              <FimpoText style={[styles.splitName, { color: '#FF6B6B' }]} numberOfLines={1}>{theTrueImposter?.name}</FimpoText>
              <FimpoText style={styles.splitRoleSub}>IMPOSTER</FimpoText>
            </View>
          </View>
        )}
      </View>

      {/* Voters list breakdown block */}
      <View style={styles.votersSectionWrapper}>
        <FimpoText style={styles.sectionTitleLabel}>
          {isImposterCaught ? '🎯 SMART JURY (VOTED CORRECTLY):' : '❌ THE ACCUSERS (VOTED FOR INNOCENT CIVILIAN):'}
        </FimpoText>
        
        {relevantVoters.length === 0 ? (
          <View style={styles.emptyVotersBox}>
            <FimpoText style={styles.emptyVotersText}>No one voted for this player.</FimpoText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.avatarRowList} horizontal={true} showsHorizontalScrollIndicator={false}>
            {relevantVoters.map((p) => (
              <View key={p.id} style={styles.voterChipCard}>
                <Image source={{ uri: p.avatar }} style={styles.miniVoterAvatar} />
                <FimpoText style={styles.voterChipName} numberOfLines={1}>{p.name}</FimpoText>
                {/* Visual indicator tag if the Imposter was one of the accusers */}
                {!isImposterCaught && p.isImposter && (
                  <FimpoText style={styles.foxBadgeIndicator}>🦊</FimpoText>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Navigation Progression Button */}
      <TouchableOpacity 
        style={[styles.routeActionBtn, !isImposterCaught && styles.scoreboardRouteColor]} 
        activeOpacity={0.85}
        onPress={() => setPhase(isImposterCaught ? GAME_PHASES.REDEMPTION : GAME_PHASES.ROUND_SCOREBOARD)}
      >
        <FimpoText style={styles.routeActionBtnText}>
          {isImposterCaught ? 'PROCEED TO REDEMPTION TRIAL ➔' : 'VIEW SCOREBOARD STANDINGS ➔'}
        </FimpoText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A10', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  errorBackgroundContainer: { backgroundColor: '#1A0B0B' },
  header: { alignItems: 'center', marginTop: 10 },
  headerSub: { fontSize: 12, color: '#666', letterSpacing: 2 },
  headerTitle: { fontSize: 24, color: '#2ECC71', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 },
  crimsonTextColor: { color: '#E74C3C' },

  centerFocusCardSlot: { marginVertical: 15, justifyContent: 'center', alignItems: 'center', width: '100%' },
  singleFocusCard: { backgroundColor: '#112216', padding: 24, borderRadius: 24, alignItems: 'center', width: width * 0.75, borderWidth: 1, borderColor: '#2ECC71' },
  cardAvatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#162E1D', marginBottom: 12 },
  cardNameText: { fontSize: 24, color: '#FFF', textTransform: 'uppercase', fontWeight: 'bold' },
  roleLabelText: { fontSize: 13, color: '#2ECC71', letterSpacing: 1, marginTop: 4, fontWeight: 'bold' },

  splitRowCards: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  splitCard: { flex: 1, backgroundColor: '#221111', padding: 16, borderRadius: 20, alignItems: 'center', marginHorizontal: 6, borderWidth: 1, borderColor: '#3A1E1E' },
  cardLeftVictim: { borderColor: '#555', backgroundColor: '#161616' },
  cardRightImposter: { borderColor: '#E74C3C' },
  splitCardLabel: { fontSize: 10, color: '#AAA', letterSpacing: 1, marginBottom: 8, fontWeight: 'bold' },
  splitAvatar: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#262626', marginBottom: 8 },
  splitName: { fontSize: 16, color: '#FFF', textTransform: 'uppercase', width: '100%', textAlign: 'center' },
  splitRoleSub: { fontSize: 11, color: '#666', marginTop: 2 },

  votersSectionWrapper: { width: '100%', height: 100, marginVertical: 10 },
  sectionTitleLabel: { fontSize: 11, color: '#888', letterSpacing: 0.5, marginBottom: 10 },
  avatarRowList: { alignItems: 'center', paddingRight: 20 },
  voterChipCard: { alignItems: 'center', marginHorizontal: 10, width: 60, position: 'relative' },
  miniVoterAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#121212', borderWidth: 1, borderColor: '#444' },
  voterChipName: { fontSize: 11, color: '#AAA', marginTop: 4, textAlign: 'center', width: '100%' },
  foxBadgeIndicator: { position: 'absolute', top: -4, right: 2, fontSize: 12 },
  
  emptyVotersBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyVotersText: { color: '#555', fontSize: 14, fontStyle: 'italic' },

  routeActionBtn: { backgroundColor: '#2ECC71', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  scoreboardRouteColor: { backgroundColor: '#E74C3C' },
  routeActionBtnText: { fontSize: 15, color: '#FFF', fontWeight: 'bold', letterSpacing: 1 }
});