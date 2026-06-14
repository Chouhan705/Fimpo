import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

export default function RedemptionScreen() {
  const { players, secretWord, resolveRedemption, setPhase } = useGameStore();
  const [isJuryShieldActive, setIsJuryShieldActive] = useState(true);

  const imposterPlayer = players.find(p => p.isImposter);

  // STAGE 1: Lockout Guard Sheet
  if (isJuryShieldActive) {
    return (
      <View style={[styles.container, styles.lockoutViewport]}>
        <FimpoText style={styles.lockoutHeaderLabel}>🔐 SECURE JURY BOX</FimpoText>
        <FimpoText style={styles.lockoutHeadline}>PASS DEVICE TO THE</FimpoText>
        <FimpoText style={styles.lockoutTeamCall}>CIVILIANS 🛡️</FimpoText>
        
        <View style={styles.warningCardBox}>
          <FimpoText style={styles.warningCardBodyText}>
            Ensure the screen is completely hidden from <FimpoText style={{color: '#FF6B6B', fontWeight: 'bold'}}>{imposterPlayer?.name}</FimpoText> before unlocking this management panel.
          </FimpoText>
        </View>
        
        <TouchableOpacity 
          style={styles.unlockPanelBtn}
          activeOpacity={0.8}
          onPress={() => setIsJuryShieldActive(false)}
        >
          <FimpoText style={styles.unlockPanelBtnText}>WE ARE CIVILIANS (OPEN PANEL)</FimpoText>
        </TouchableOpacity>
      </View>
    );
  }

  // STAGE 2: Interactive Verdict Deck
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FimpoText style={styles.title}>🛡️ JURY JUDGMENT</FimpoText>
        <FimpoText style={styles.subtitle}>Listen to the Imposter's guess...</FimpoText>
      </View>

      <View style={styles.profileCard}>
        <Image source={{ uri: imposterPlayer?.avatar }} style={styles.imposterAvatar} />
        <FimpoText style={styles.imposterName}>{imposterPlayer?.name}</FimpoText>
        <FimpoText style={styles.instructPromptText}>
          Ask them to verbally guess the Civilian secret clue word out loud right now.
        </FimpoText>
      </View>

      <View style={styles.controlDeckWrapper}>
        <View style={styles.answerKeyCard}>
          <FimpoText style={styles.keyLabel}>THE ACTUAL CIVILIAN SECRET WORD:</FimpoText>
          <FimpoText style={styles.actualWordText}>{secretWord}</FimpoText>
        </View>

        <FimpoText style={styles.rulingPromptText}>Did their verbal statement match the target clue?</FimpoText>
        
        <View style={styles.actionRowBtnGroup}>
          <TouchableOpacity 
            style={[styles.verdictBtn, styles.wrongBtn]} 
            activeOpacity={0.8}
            onPress={() => {
              resolveRedemption(false); // Award point row changes
              setPhase(GAME_PHASES.ROUND_SCOREBOARD); // Rout onto the scoreboard
            }}
          >
            <FimpoText style={styles.btnText}>❌ WRONG GUESS</FimpoText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.verdictBtn, styles.correctBtn]} 
            activeOpacity={0.8}
            onPress={() => {
              resolveRedemption(true); // Award point row changes
              setPhase(GAME_PHASES.ROUND_SCOREBOARD); // Rout onto the scoreboard
            }}
          >
            <FimpoText style={styles.btnText}>🎉 CORRECT GUESS</FimpoText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  lockoutViewport: { backgroundColor: '#1A1616', justifyContent: 'center', alignItems: 'center' },
  lockoutHeaderLabel: { fontSize: 13, color: '#4A69BD', letterSpacing: 2, marginBottom: 12 },
  lockoutHeadline: { fontSize: 16, color: '#666', letterSpacing: 0.5 },
  lockoutTeamCall: { fontSize: 44, color: '#4A69BD', fontWeight: 'bold', marginVertical: 6, letterSpacing: 1 },
  warningCardBox: { backgroundColor: '#211A1A', borderWidth: 1, borderColor: '#C0392B', padding: 16, borderRadius: 12, marginTop: 24, marginHorizontal: 12 },
  warningCardBodyText: { color: '#A0A0A0', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  unlockPanelBtn: { backgroundColor: '#27AE60', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 40 },
  unlockPanelBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },

  header: { alignItems: 'center', marginTop: 10 },
  title: { fontSize: 32, color: '#FF6B6B', letterSpacing: 1.5, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4, textTransform: 'uppercase' },

  profileCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, alignItems: 'center', marginVertical: 15, borderWidth: 1, borderColor: '#262626' },
  imposterAvatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#262626', marginBottom: 10 },
  imposterName: { fontSize: 22, color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', marginBottom: 10 },
  instructPromptText: { fontSize: 13, color: '#A0A0A0', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },

  controlDeckWrapper: { width: '100%', marginBottom: 10 },
  answerKeyCard: { backgroundColor: '#161616', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  keyLabel: { fontSize: 11, color: '#444', letterSpacing: 1, marginBottom: 6 },
  actualWordText: { fontSize: 32, color: '#FFF', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 'bold' },
  rulingPromptText: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 15 },
  actionRowBtnGroup: { flexDirection: 'row', width: '100%' },
  verdictBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  wrongBtn: { backgroundColor: '#C0392B' },
  correctBtn: { backgroundColor: '#27AE60' },
  btnText: { fontSize: 13, color: '#FFF', fontWeight: 'bold', letterSpacing: 0.5 }
});