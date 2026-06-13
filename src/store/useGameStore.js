import { create } from 'zustand';
import { WORD_BANK, fetchWordImages } from '../services/gameEngine';

export const GAME_PHASES = {
  SETUP: 'SETUP',
  PLAYER_SETUP: 'PLAYER_SETUP',
  WHEEL_OF_FATE: 'WHEEL_OF_FATE',
  ROLE_REVEAL: 'ROLE_REVEAL',
  VERBAL_ROUND: 'VERBAL_ROUND',
  VOTING: 'VOTING',
  SHOWDOWN: 'SHOWDOWN',
  RESOLUTION: 'RESOLUTION',
  REDEMPTION: 'REDEMPTION'
};

const useGameStore = create((set, get) => ({
  currentPhase: GAME_PHASES.SETUP,
  players: [
    { id: '1', name: 'Player 1', avatar: 'https://robohash.org/Player1?set=set2' },
    { id: '2', name: 'Player 2', avatar: 'https://robohash.org/Player2?set=set2' },
    { id: '3', name: 'Player 3', avatar: 'https://robohash.org/Player3?set=set2' },
  ],
  imposterMode: 'BLIND', // 'BLIND' or 'INFILTRATOR'
  secretWord: '',
  imposterWord: '',
  category: '',
  startingPlayerId: null,
  activeRevealIndex: 0, // Track which individual player is holding the phone
  fetchedImages: [],

  setPhase: (phase) => set({ currentPhase: phase }),

  updatePlayerName: (id, name) => set((state) => ({
    players: state.players.map((p) => 
      p.id === id ? { ...p, name, avatar: `https://robohash.org/${encodeURIComponent(name || id)}?set=set2` } : p
    )
  })),

  addPlayer: () => set((state) => {
    const nextId = (state.players.length + 1).toString();
    const defaultName = `Player ${nextId}`;
    return { players: [...state.players, { id: nextId, name: defaultName, avatar: `https://robohash.org/${defaultName}?set=set2` }] };
  }),

  removePlayer: () => set((state) => {
    if (state.players.length <= 3) return {};
    return { players: state.players.slice(0, -1) };
  }),

  toggleImposterMode: () => set((state) => ({
    imposterMode: state.imposterMode === 'BLIND' ? 'INFILTRATOR' : 'BLIND'
  })),

  // Core Orchestration Engine: Set up words, picking the imposter, loading clues
  initializeMatch: async () => {
    const { players, imposterMode } = get();
    
    // Pick Category and Word pairing at random
    const categories = Object.keys(WORD_BANK);
    const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    const wordPairs = WORD_BANK[chosenCategory];
    const pickedPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];

    // Select Imposter index and Starting voice reader at random (Wheel of Fate)
    const imposterIndex = Math.floor(Math.random() * players.length);
    const starterIndex = Math.floor(Math.random() * players.length);

    // Run async media collection engine
    const images = await fetchWordImages(pickedPair.civilian, chosenCategory);

    const readyPlayers = players.map((player, idx) => {
      const isImposter = idx === imposterIndex;
      return {
        ...player,
        isImposter,
        role: isImposter ? 'IMPOSTER' : 'CIVILIAN',
        word: isImposter 
          ? (imposterMode === 'BLIND' ? 'Cunning Fox' : pickedPair.infiltrator)
          : pickedPair.civilian,
        votesReceived: 0
      };
    });

    set({
      players: readyPlayers,
      category: chosenCategory,
      secretWord: pickedPair.civilian,
      imposterWord: imposterMode === 'BLIND' ? 'Cunning Fox' : pickedPair.infiltrator,
      startingPlayerId: players[starterIndex].id,
      fetchedImages: images,
      activeRevealIndex: 0,
      currentPhase: GAME_PHASES.WHEEL_OF_FATE
    });
  },

  advanceRevealPlayer: () => {
    const { activeRevealIndex, players } = get();
    if (activeRevealIndex + 1 >= players.length) {
      set({ currentPhase: GAME_PHASES.VERBAL_ROUND }); // All roles verified -> Moving into verbal arguments
    } else {
      set({ activeRevealIndex: activeRevealIndex + 1 });
    }
  }
}));

export default useGameStore;