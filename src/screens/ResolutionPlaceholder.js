import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import useGameStore from '../store/useGameStore';
import FimpoText from '../components/FimpoText';

export default function ResolutionPlaceholder() {
  const { players, resetGame } = useGameStore();

  return (
    <View style={styles.container}>
      <FimpoText style={styles.title}>Votes Tallied Successfully!</FimpoText>
      
      <View style={styles.box}>
        {players.map(p => (
          <FimpoText key={p.id} style={styles.txt}>
            {p.name}: Received {p.votesReceived} vote(s) {p.isImposter ? '🕵️‍♂️ (IMPOSTER)' : ''}
          </FimpoText>
        ))}
      </View>

      <Button title="Back to Main Lobby" onPress={resetGame} color="#FF6B6B" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, color: '#FF6B6B', marginBottom: 20 },
  box: { width: '100%', backgroundColor: '#1A1A1A', padding: 20, borderRadius: 16, marginBottom: 30 },
  txt: { fontSize: 16, marginVertical: 4 }
});