import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

export default function RedemptionScreen() {
  const { players, secretWord, resolveRedemption } = useGameStore();
  const [isHandoffShieldActive, setIsHandoffShieldActive] = useState(true);

  const imposterPlayer = players.find(p => p.isImposter);

  // Secure Intermediary Handoff State: Guarding the secret word panel
  if (isHandoffShieldActive) {
    return (
      <View style={[styles.container, { backgroundColor: '#1A1616', justifyContent: 'center', alignItems: 'center' }]}>
        <FimpoText style={styles.handoffLabelCall}>🔐 SECURE JURY STATE</FimpoText>
        <FimpoText style={styles.handoffInstruct}>PASS PHONE TO THE:</FimpoText>
        <FimpoText style={styles.handoffTargetName}>CIVILIANS 🛡️</FimpoText>
        
        <View style={styles.securityWarningCard}>
          <FimpoText style={styles.warningCardText}>
            Keep the screen completely hidden from <FimpoText style={{color: '#FF6B6B', fontWeight: 'bold'}}>{imposterPlayer?.name}</FimpoText> while they make their verbal guess!
          </FimpoText>
        </View>
        
        <TouchableOpacity 
          style={[styles.verdictBtn, styles.correctBtn, { width: '100%', marginTop: 40 }]}
          onPress={() => setIsHandoffShieldActive(false)}
        >
          <FimpoText style={styles.btnText}>WE ARE CIVILIANS (OPEN PANEL)</FimpoText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FimpoText style={styles.title}>🛡️ JURY JUDGMENT</FimpoText>
        <FimpoText style={styles.subtitle}>Listen to the Imposter's guess...</FimpoText>
      </View>

      {/* Target suspect tracker cards */}
      <View style={styles.profileCard}>
        <FimpoText style={styles.instructHeading}>DEFENDANT IMPOSTER:</FimpoText>
        <Image source={{ uri: imposterPlayer?.avatar }} style={styles.imposterAvatar} />
        <FimpoText style={styles.imposterName}>{imposterPlayer?.name}</FimpoText>
        
        <View style={styles.instructionBox}>
          <FimpoText style={styles.instructBody}>
            Ask <FimpoText style={{fontWeight: 'bold', color: '#FFF'}}>{imposterPlayer?.name}</FimpoText> to guess the Civilian secret word out loud right now.
          </FimpoText>
        </View>
      </View>

      {/* Admin Verification Panel */}
      <View style={styles.adminControlZone}>
        <View style={styles.answerKeyCard}>
          <FimpoText style={styles.keyLabel}>THE ACTUAL SECRET CLUE WORD:</FimpoText>
          <FimpoText style={styles.actualWordText}>{secretWord}</FimpoText>
        </View>

        <FimpoText style={styles.groupVotePrompt}>Did their verbal guess match the word above?</FimpoText>
        
        <View style={styles.actionRowButtons}>
          <TouchableOpacity 
            style={[styles.verdictBtn, styles.wrongBtn]} 
            activeOpacity={0.8}
            onPress={() => resolveRedemption(false)} // Only Civilians get point allocations
          >
            <FimpoText style={styles.btnText} pointerEvents="none">❌ WRONG GUESS</FimpoText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.verdictBtn, styles.correctBtn]} 
            activeOpacity={0.8}
            onPress={() => resolveRedemption(true)} // Everyone gets a point allocation
          >
            <FimpoText style={styles.btnText} pointerEvents="none">🎉 CORRECT GUESS</FimpoText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 10 },
  title: { fontSize: 32, color: '#FF6B6B', letterSpacing: 2 },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  
  handoffLabelCall: { fontSize: 13, color: '#4A69BD', letterSpacing: 3, marginBottom: 10 },
  handoffInstruct: { fontSize: 16, color: '#666', letterSpacing: 0.5 },
  handoffTargetName: { fontSize: 44, color: '#4A69BD', marginVertical: 10, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold' },
  securityWarningCard: { backgroundColor: '#211A1A', borderWidth: 1, borderColor: '#C0392B', borderRadius: 12, padding: 16, marginTop: 24, marginHorizontal: 10 },
  warningCardText: { color: '#A0A0A0', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  profileCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: '#262626' },
  instructHeading: { fontSize: 11, color: '#666', letterSpacing: 2, marginBottom: 10 },
  imposterAvatar: { width: 90, height: 90, backgroundColor: '#262626', borderRadius: 45, marginBottom: 10 },
  imposterName: { fontSize: 22, color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  
  instructionBox: { backgroundColor: 'rgba(74, 105, 189, 0.05)', borderWidth: 1, borderColor: 'rgba(74, 105, 189, 0.2)', borderRadius: 12, padding: 14 },
  instructBody: { fontSize: 13, color: '#A0A0A0', textAlign: 'center', lineHeight: 20 },

  adminControlZone: { width: '100%', marginBottom: 10 },
  answerKeyCard: { backgroundColor: '#161616', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  keyLabel: { fontSize: 11, color: '#444', letterSpacing: 1, marginBottom: 4 },
  actualWordText: { fontSize: 28, color: '#FFF', letterSpacing: 2, textTransform: 'uppercase' },
  groupVotePrompt: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 14, letterSpacing: 0.5 },
  
  actionRowButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  verdictBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  wrongBtn: { backgroundColor: '#C0392B' },
  correctBtn: { backgroundColor: '#27AE60' },
  btnText: { fontSize: 13, color: '#FFF', letterSpacing: 1, fontWeight: 'bold' }
});