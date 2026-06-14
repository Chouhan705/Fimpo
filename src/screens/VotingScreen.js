import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, FlatList, Dimensions, Modal } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function VotingScreen() {
  const { players, activeVoteIndex, startingPlayerId, castSecretVote } = useGameStore();
  const [isHandoffState, setIsHandoffState] = useState(true);
  
  // New States: Tracking confirmation workflow data structures
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const totalPlayers = players.length;
  const startIndex = players.findIndex(p => p.id === startingPlayerId);

  const currentVoterIndex = (startIndex + activeVoteIndex) % totalPlayers;
  const currentVoter = players[currentVoterIndex];

  const viableSuspects = players.filter(p => p.id !== currentVoter?.id);

  // Initiates the modal confirmation overlay step
  const handleSuspectCardPress = (suspect) => {
    setSelectedSuspect(suspect);
    setIsConfirmModalVisible(true);
  };

  // Finalizes the vote after user verifies intention
  const handleFinalConfirmVote = () => {
    if (!selectedSuspect) return;
    
    setIsConfirmModalVisible(false);
    castSecretVote(selectedSuspect.id); // Register the vote inside our store
    setSelectedSuspect(null);
    setIsHandoffState(true);            // Immediately trigger handoff shield for the next voter
  };

  // Secure Handoff View Guard
  if (isHandoffState) {
    return (
      <View style={styles.handoffContainer}>
        <FimpoText style={styles.handoffTitle}>🗳️ VOTING</FimpoText>
        
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
            onPress={() => handleSuspectCardPress(item)} // Open confirmation dialog modal
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

      {/* ======================================================== */}
      {/* --- NEW: FINAL VOTE CONFIRMATION MODAL OVERLAY SHEET --- */}
      {/* ======================================================== */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isConfirmModalVisible}
        onRequestClose={() => setIsConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlayCenterDim}>
          <View style={styles.modalContentCard}>
            <FimpoText style={styles.modalHeaderTitle}>LOCK IN ACCUSATION?</FimpoText>
            
            <View style={styles.modalTargetBox}>
              <Image source={{ uri: selectedSuspect?.avatar }} style={styles.modalTargetAvatar} />
              <FimpoText style={styles.modalTargetName}>{selectedSuspect?.name}</FimpoText>
            </View>

            <FimpoText style={styles.modalDisclaimerText}>
              Are you sure you want to accuse this player? Once locked in, your secret ballot cannot be altered.
            </FimpoText>

            <View style={styles.modalActionButtonRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalCancelBtn]} 
                onPress={() => setIsConfirmModalVisible(false)}
              >
                <FimpoText style={styles.modalCancelBtnText}>CANCEL</FimpoText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalConfirmBtn]} 
                onPress={handleFinalConfirmVote}
              >
                <FimpoText style={styles.modalConfirmBtnText}>CONFIRM VOTE</FimpoText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingVertical: 40, paddingHorizontal: 16 },
  topBar: { alignItems: 'center', marginBottom: 20 },
  topVoterLabel: { fontSize: 24, color: '#666', letterSpacing: 2, paddingVertical: 16 },
  activeVoterTitle: { fontSize: 26, color: '#FF6B6B', textTransform: 'uppercase', marginTop: 2 },
  gridContainer: { paddingBottom: 20 },
  gridCard: { backgroundColor: '#1A1A1A', flex: 1, margin: 8, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#262626', maxWidth: (width - 48) / 2 },
  gridAvatar: { width: 85, height: 85, backgroundColor: '#262626', borderRadius: 42.5 },
  suspectName: { fontSize: 20, color: '#FFF', marginVertical: 8, textTransform: 'uppercase', letterSpacing: 1 },
  voteBadgeAnchor: { backgroundColor: 'rgba(255, 107, 107, 0.1)', borderWidth: 1, borderColor: '#FF6B6B', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  voteBadgeText: { color: '#FF6B6B', fontSize: 16},
  footerWarning: { fontSize: 18, color: '#6b6b6b', textAlign: 'center', marginTop: 10, letterSpacing: 0.5, paddingBottom: 20 },

  // Handoff Shield Styles
  handoffContainer: { flex: 1, backgroundColor: '#161313', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  handoffTitle: { fontSize: 24, color: '#FF6B6B', letterSpacing: 3 },
  centerPassGroup: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  instructText: { fontSize: 16, color: '#666' },
  voterNameTarget: { fontSize: 38, color: '#FF6B6B', marginVertical: 12, textTransform: 'uppercase', letterSpacing: 1 },
  giantAvatar: { width: 160, height: 160, backgroundColor: '#262626', borderRadius: 80, marginTop: 10 },
  openGridBtn: { backgroundColor: '#FF6B6B', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  openGridBtnText: { fontSize: 20, letterSpacing: 1 },

  // --- Modal Confirmation Component UI Layout Styles ---
  modalOverlayCenterDim: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalContentCard: { backgroundColor: '#1E1E1E', width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2C2C2C', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowRadius: 15, shadowOpacity: 0.5, elevation: 10 },
  modalHeaderTitle: { fontSize: 20, color: '#FFF', letterSpacing: 1, fontWeight: 'bold', marginBottom: 16 },
  modalTargetBox: { alignItems: 'center', marginVertical: 12, width: '100%' },
  modalTargetAvatar: { width: 100, height: 100, backgroundColor: '#2A2A2A', borderRadius: 50, marginBottom: 8 },
  modalTargetName: { fontSize: 22, color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' },
  modalDisclaimerText: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginVertical: 12, paddingHorizontal: 10 },
  modalActionButtonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 6 },
  modalCancelBtn: { backgroundColor: '#262626', borderWidth: 1, borderColor: '#3A3A3A' },
  modalCancelBtnText: { color: '#AAA', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },
  modalConfirmBtn: { backgroundColor: '#FF6B6B' },
  modalConfirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 }
});