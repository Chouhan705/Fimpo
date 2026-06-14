import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions, Alert} from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

const { width } = Dimensions.get('window');

export default function SetupScreen() {
  const { players, addPlayer, removePlayer, updatePlayerName,imposterMode,toggleImposterMode,setInitialPlayersList } = useGameStore();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <FimpoText style={styles.title}>Lobby Setup</FimpoText>
          <FimpoText style={styles.subtitle}>Adjust players & enter names</FimpoText>
        </View>

        {/* Counter Counter Controls */}
        <View style={styles.counterCard}>
          <FimpoText style={styles.counterLabel}>Total Players</FimpoText>
          <View style={styles.counterRow}>
            <TouchableOpacity style={styles.counterBtn} onPress={removePlayer}>
              <FimpoText style={styles.counterBtnText}>-</FimpoText>
            </TouchableOpacity>
            
            <FimpoText style={styles.counterCount}>{players.length}</FimpoText>
            
            <TouchableOpacity style={styles.counterBtn} onPress={addPlayer}>
              <FimpoText style={styles.counterBtnText}>+</FimpoText>
            </TouchableOpacity>
          </View>
        </View>
        {/* Mode Selection Toggles */}
          <TouchableOpacity style={styles.counterCard} onPress={toggleImposterMode}>
            <FimpoText style={styles.counterLabel}>Game Mode{"\n"}[Tap to change]</FimpoText>
            <FimpoText style={{ fontSize: 18, color: '#FF6B6B',textAlign: 'center' }}>
              {imposterMode === 'BLIND' ? "🦊\nBlind Imposter (Imposter gets no word)" : "🕵️\nInfiltrator (Imposter gets a word)"}
            </FimpoText>
          </TouchableOpacity>

        {/* Player Input Grid/List */}
        <View style={styles.playerList}>
          {players.map((player, index) => (
            <View key={player.id} style={styles.playerRow}>
              {/* Live Robohash Avatar */}
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: player.avatar }} 
                  style={styles.avatar} 
                  resizeMode="contain"
                />
              </View>
              
              {/* Input field */}
              <TextInput
                style={styles.input}
                value={player.name}
                onChangeText={(text) => updatePlayerName(player.id, text)}
                placeholder={`Player ${index + 1}`}
                placeholderTextColor="#555"
                maxLength={15}
              />
            </View>
          ))}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity 
          style={[styles.launchButton, players.length < 3 && { opacity: 0.4 }]}
          activeOpacity={0.8}
          disabled={players.length < 3}
          onPress={() => {
            const hasBlankNames = players.some(p => !p.name.trim()); 
            const proceed = () => {
            const preparedPlayers = players.map(p => ({
            ...p,
            name: p.name.trim() || `Player ${p.id}`
          }));
          setInitialPlayersList(preparedPlayers);
        };

        if (hasBlankNames) {
          Alert.alert(
            "Names not entered",
            "Some players have no name. Continue with default names?",
            [
              { text: "Go Back", style: "cancel" },
              { text: "Continue", onPress: proceed }
            ]
          );
        } else {
        proceed();
        }
      }}
      >
      <FimpoText style={styles.launchButtonText}>CREATE GAME SESSION ➔</FimpoText>
      </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 38,
    letterSpacing: 2,
    color: '#FF6B6B',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 20,
    color: '#777',
    marginTop: 4,
  },
  counterCard: {
    backgroundColor: '#1A1A1A',
    width: '100%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#262626',
  },
  counterLabel: {
    fontSize: 20,
    color: '#A0A0A0',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtn: {
    backgroundColor: '#2A2A2A',
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 22,
    color: '#FF6B6B',
  },
  counterCount: {
    fontSize: 28,
    marginHorizontal: 30,
  },
  playerList: {
    width: '100%',
    marginBottom: 30,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  avatarContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 4,
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  input: {
    flex: 1,
    fontFamily: 'CustomFont-Main', // Ensures player text matches your brand
    fontSize: 20,
    color: '#FFFFFF',
    paddingVertical: 8,
  },
  launchButton: {
    backgroundColor: '#FF6B6B',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  launchButtonText: {
    fontSize: 20,
    letterSpacing: 2,
  },
});