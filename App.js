import React, { useEffect, useCallback } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


import useGameStore, { GAME_PHASES } from './src/store/useGameStore';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import LobbyHubScreen from './src/screens/LobbyHubScreen';
import RevealScreen from './src/screens/RevealScreen.js';
import WheelScreen from './src/screens/WheelScreen';
import VerbalRoundScreen from './src/screens/VerbalRoundScreen';
import VotingScreen from './src/screens/VotingScreen';
import ResolutionPlaceholder from './src/screens/ResolutionPlaceholder';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const currentPhase = useGameStore((state) => state.currentPhase);

  // Load your custom fonts here
  const [fontsLoaded, fontError] = useFonts({
    // Give it an identifier name you will use in your stylesheets
    'CustomFont-Main': require('./assets/fonts/YourCustomFont.ttf'), 
    // Example: 'Sansation-Bold': require('./assets/fonts/Sansation-Bold.ttf'),
  });
  

  // Hide the splash screen once fonts are loaded or if an error occurs
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Guard clause: Render nothing while assets are preparing
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {currentPhase === GAME_PHASES.SETUP && <HomeScreen />}
      {currentPhase === GAME_PHASES.PLAYER_SETUP && <SetupScreen />}
      
      {currentPhase === GAME_PHASES.WHEEL_OF_FATE && <WheelScreen />}
      {currentPhase === GAME_PHASES.ROLE_REVEAL && <RevealScreen />}
      {currentPhase === GAME_PHASES.VERBAL_ROUND && <VerbalRoundScreen />}
      {currentPhase === GAME_PHASES.VOTING && <VotingScreen />}
      {currentPhase === GAME_PHASES.RESOLUTION && <ResolutionPlaceholder />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});