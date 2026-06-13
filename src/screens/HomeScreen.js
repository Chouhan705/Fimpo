import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import useGameStore, { GAME_PHASES } from '../store/useGameStore';
import FimpoText from '../components/FimpoText'; // <-- Import our new custom text wrapper

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const setPhase = useGameStore((state) => state.setPhase);

  return (
    <View style={styles.container}>
      
      {/* Brand Header */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../../assets/logo-text.png')} 
          style={styles.logoText}
          resizeMode="contain"
        />
        {/* Changed from <Text> to <FimpoText> */}
        <FimpoText style={styles.subtitle}>Find The Imposter!!</FimpoText>
      </View>

      {/* Main Feature */}
      <View style={styles.centerContainer}>
        <Image 
          source={require('../../assets/fox-logo.png')} 
          style={styles.mainLogo}
          resizeMode="contain"
        />
      </View>

      {/* Action Footer */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => setPhase(GAME_PHASES.PLAYER_SETUP)}
        >
          {/* Changed from <Text> to <FimpoText> */}
          <FimpoText style={styles.buttonText}>START PLAYING</FimpoText>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  headerContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  logoText: {
    width: width * 0.75,
    height: height * 0.12,
  },
  subtitle: {
    fontSize: 24,
    color: '#A0A0A0', // Overrides the default #FFFFFF from FimpoText
    letterSpacing: 3,
    marginTop: -5,
    textTransform: 'uppercase',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  mainLogo: {
    width: width * 0.65,
    height: width * 0.65,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'CustomFont-Main', // <-- Explicitly force-feed the custom font family key here
    fontSize: 28,
    letterSpacing: 2,
    color: '#FFFFFF',              // Ensures it remains crisp white over the coral button background
  },
});