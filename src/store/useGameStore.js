import { create } from 'zustand';
import { EXTENDED_WORD_BANK } from '../services/wordBankData';
import { fetchWordImages } from '../services/gameEngine';

export const GAME_PHASES = {
  SETUP: 'SETUP',
  PLAYER_SETUP: 'PLAYER_SETUP',
  LOBBY_HUB: 'LOBBY_HUB',
  WHEEL_OF_FATE: 'WHEEL_OF_FATE',
  ROLE_REVEAL: 'ROLE_REVEAL',
  VERBAL_ROUND: 'VERBAL_ROUND',
  VOTING: 'VOTING',
  SHOWDOWN: 'SHOWDOWN',
  REDEMPTION: 'REDEMPTION',
  RESOLUTION: 'RESOLUTION'
};

const useGameStore = create((set, get) => ({
  // ==========================================
  // --- Core Game State Slices ---
  // ==========================================
  currentPhase: GAME_PHASES.SETUP,
  players: [], 
  imposterMode: 'BLIND', 
  secretWord: '',
  imposterWord: '',
  category: '',
  startingPlayerId: null,
  activeRevealIndex: 0, 
  activeVoteIndex: 0,   
  fetchedImages: [],    

  // ==========================================
  // --- Game State Actions ---
  // ==========================================
  setPhase: (phase) => set({ currentPhase: phase }),

  updatePlayerName: (id, name) => set((state) => ({
    players: state.players.map((p) => 
      p.id === id ? { ...p, name, avatar: `https://robohash.org/${encodeURIComponent(name || id)}?set=set2` } : p
    )
  })),

  setInitialPlayersList: (inputPlayers) => set({
    players: inputPlayers.map(p => ({ ...p, score: 0, votesReceived: 0 })),
    currentPhase: GAME_PHASES.LOBBY_HUB
  }),

  toggleImposterMode: () => set((state) => ({
    imposterMode: state.imposterMode === 'BLIND' ? 'INFILTRATOR' : 'BLIND'
  })),

  addPlayer: () => set((state) => {
    const nextId = (state.players.length + 1).toString();
    const defaultName = `Player ${nextId}`;
    return { players: [...state.players, { id: nextId, name: "", avatar: `https://robohash.org/${defaultName}?set=set2` }] };
  }),

  removePlayer: () => set((state) => {
    if (state.players.length <= 3) return {};
    return { players: state.players.slice(0, -1) };
  }),

  initializeMatch: async () => {
    const { players, imposterMode } = get();
    
    const categories = Object.keys(EXTENDED_WORD_BANK);
    const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    const activeWordList = EXTENDED_WORD_BANK[chosenCategory];

    const civilianWordIndex = Math.floor(Math.random() * activeWordList.length);
    let infiltratorWordIndex = Math.floor(Math.random() * activeWordList.length);
    
    while (infiltratorWordIndex === civilianWordIndex) {
      infiltratorWordIndex = Math.floor(Math.random() * activeWordList.length);
    }

    const chosenCivilianWord = activeWordList[civilianWordIndex];
    const chosenInfiltratorWord = activeWordList[infiltratorWordIndex];

    const imposterIndex = Math.floor(Math.random() * players.length);
    const starterIndex = Math.floor(Math.random() * players.length);
    const images = await fetchWordImages(chosenCivilianWord, chosenCategory);

    const readyPlayers = players.map((player, idx) => {
      const isImposter = idx === imposterIndex;
      return {
        ...player,
        isImposter,
        role: isImposter ? 'IMPOSTER' : 'CIVILIAN',
        word: isImposter 
          ? (imposterMode === 'BLIND' ? 'Cunning Fox' : chosenInfiltratorWord) 
          : chosenCivilianWord,
        votesReceived: 0
      };
    });

    set({
      players: readyPlayers,
      category: chosenCategory,
      secretWord: chosenCivilianWord,
      imposterWord: imposterMode === 'BLIND' ? 'Cunning Fox' : chosenInfiltratorWord,
      startingPlayerId: players[starterIndex].id,
      fetchedImages: images,
      activeRevealIndex: 0,
      currentPhase: GAME_PHASES.WHEEL_OF_FATE
    });
  },

  advanceRevealPlayer: () => {
    const { activeRevealIndex, players } = get();
    if (activeRevealIndex + 1 >= players.length) {
      set({ currentPhase: GAME_PHASES.VERBAL_ROUND });
    } else {
      set({ activeRevealIndex: activeRevealIndex + 1 });
    }
  },

  startVotingPhase: () => set((state) => ({
    currentPhase: GAME_PHASES.VOTING,
    activeVoteIndex: 0,
    players: state.players.map(p => ({ ...p, votesReceived: 0 }))
  })),

  // FIXED: Runs voting math directly on the array to avoid async updates jamming the next round!
  castSecretVote: (suspectId) => {
    const { players, activeVoteIndex, resolveVotingResults } = get();
    const totalPlayers = players.length;
    
    const updatedPlayers = players.map(p => 
      p.id === suspectId ? { ...p, votesReceived: p.votesReceived + 1 } : p
    );

    if (activeVoteIndex + 1 >= totalPlayers) {
      // First update the finalized voting tallies in your local state
      set({ players: updatedPlayers });
      // Call the decision logic rule engine directly using our updated array matrix data
      resolveVotingResults(updatedPlayers);
    } else {
      set({ players: updatedPlayers, activeVoteIndex: activeVoteIndex + 1 });
    }
  },

  getVotingVerdict: () => {
    const { players } = get();
    const maxVotes = Math.max(...players.map(p => p.votesReceived));
    const highestVotedPlayers = players.filter(p => p.votesReceived === maxVotes);

    if (highestVotedPlayers.length > 1 && maxVotes > 0) {
      return { status: 'TIE', defendants: highestVotedPlayers };
    }
    return { status: 'DECIDED', victim: highestVotedPlayers[0] };
  },

  applyCivilianEliminationPoints: () => {
    const { players } = get();
    const updatedPlayers = players.map(player => {
      if (player.isImposter) return { ...player, score: player.score + 1 }; 
      return player;
    });
    set({ players: updatedPlayers });
  },

  // FIXED: Accepts the passing final array cleanly to calculate phase changes instantly
  resolveVotingResults: (finalPlayersList) => {
    const activePlayers = finalPlayersList || get().players;
    
    const maxVotes = Math.max(...activePlayers.map(p => p.votesReceived));
    const highestVotedPlayers = activePlayers.filter(p => p.votesReceived === maxVotes);

    if (highestVotedPlayers.length > 1 && maxVotes > 0) {
      set({ players: activePlayers, currentPhase: GAME_PHASES.SHOWDOWN });
      return { status: 'TIE', defendants: highestVotedPlayers };
    }

    const victim = highestVotedPlayers[0];
    
    if (victim?.isImposter) {
      // Imposter caught! Route straight to secure Civilian jury panel
      set({ players: activePlayers, currentPhase: GAME_PHASES.REDEMPTION });
      return { status: 'REDEMPTION', victim };
    } else {
      // Civilian eliminated! Imposter scores points, head to public results review
      const updatedPlayers = activePlayers.map(player => {
        if (player.isImposter) {
          return { ...player, score: player.score + 1 };
        }
        return player;
      });
      set({ players: updatedPlayers, currentPhase: GAME_PHASES.RESOLUTION });
      return { status: 'DECIDED', victim };
    }
  },
  
  resolveRedemption: (imposterGuessedCorrectly) => {
    const { players } = get();

    const updatedPlayers = players.map(player => {
      if (imposterGuessedCorrectly) {
        return { ...player, score: player.score + 1 };
      } else {
        if (!player.isImposter) return { ...player, score: player.score + 1 };
      }
      return player;
    });

    set({ 
      players: updatedPlayers,
      currentPhase: GAME_PHASES.LOBBY_HUB,
      secretWord: '',
      imposterWord: '',
      category: '',
      startingPlayerId: null,
      activeRevealIndex: 0,
      activeVoteIndex: 0,
      fetchedImages: []
    });
  },

  returnToLobbyHub: () => set({
    currentPhase: GAME_PHASES.LOBBY_HUB,
    secretWord: '',
    imposterWord: '',
    category: '',
    startingPlayerId: null,
    activeRevealIndex: 0,
    activeVoteIndex: 0,
    fetchedImages: []
  }),

  triggerShowdownReVote: () => set((state) => ({
    currentPhase: GAME_PHASES.VOTING,
    activeVoteIndex: 0,
    players: state.players.map(p => ({ ...p, votesReceived: 0 }))
  })),

  resetGame: () => set({
    currentPhase: GAME_PHASES.SETUP,
    players: [],
    secretWord: '',
    imposterWord: '',
    category: '',
    startingPlayerId: null,
    activeRevealIndex: 0,
    activeVoteIndex: 0,
    fetchedImages: []
  })
}));

export default useGameStore;