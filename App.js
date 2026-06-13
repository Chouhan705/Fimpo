import React, { useEffect, useCallback } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Alert, BackHandler } from 'react-native';
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
import ResolutionScreen from './src/screens/ResolutionScreen';
import RedemptionScreen from './src/screens/RedemptionScreen';
import ShowdownScreen from './src/screens/ShowdownScreen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const currentPhase = useGameStore((state) => state.currentPhase);
  const resetGame = useGameStore((state) => state.resetGame);

  const [fontsLoaded, fontError] = useFonts({
    'CustomFont-Main': require('./assets/fonts/YourCustomFont.ttf'), 
  });

  const triggerExitConfirmation = useCallback(() => {
    Alert.alert(
      "Exit Game Session?",
      "Are you sure you want to end this game session? Current score records will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Exit Session", style: "destructive", onPress: () => resetGame() }
      ]
    );
    return true; 
  }, [resetGame]);

  useEffect(() => {
    const onBackPress = () => {
      if (currentPhase === GAME_PHASES.SETUP || currentPhase === GAME_PHASES.PLAYER_SETUP) {
        return false; 
      }
      return triggerExitConfirmation();
    };

    // Modern BackHandler Subscription
    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
    // Clean up using the subscription object directly
    return () => backHandlerSubscription.remove();
  }, [currentPhase, triggerExitConfirmation]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {currentPhase === GAME_PHASES.SETUP && <HomeScreen />}
      {currentPhase === GAME_PHASES.PLAYER_SETUP && <SetupScreen />}
      {currentPhase === GAME_PHASES.LOBBY_HUB && <LobbyHubScreen />}
      {currentPhase === GAME_PHASES.WHEEL_OF_FATE && <WheelScreen />}
      {currentPhase === GAME_PHASES.ROLE_REVEAL && <RevealScreen />}
      {currentPhase === GAME_PHASES.VERBAL_ROUND && <VerbalRoundScreen />}
      {currentPhase === GAME_PHASES.VOTING && <VotingScreen />}
      {currentPhase === GAME_PHASES.SHOWDOWN && <ShowdownScreen />}
      {currentPhase === GAME_PHASES.REDEMPTION && <RedemptionScreen />}
      {currentPhase === GAME_PHASES.RESOLUTION && <ResolutionScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});