import { create } from 'zustand';
import { WORD_BANK, fetchWordImages } from '../services/gameEngine';

export const GAME_PHASES = {
  SETUP: 'SETUP',
  PLAYER_SETUP: 'PLAYER_SETUP',
  LOBBY_HUB: 'LOBBY_HUB',
  WHEEL_OF_FATE: 'WHEEL_OF_FATE',
  ROLE_REVEAL: 'ROLE_REVEAL',
  VERBAL_ROUND: 'VERBAL_ROUND',
  VOTING: 'VOTING',
  SHOWDOWN: 'SHOWDOWN',
  RESOLUTION: 'RESOLUTION',
  REDEMPTION: 'REDEMPTION'
};

const useGameStore = create((set, get) => ({
  // ==========================================
  // --- Core Game State Slices ---
  // ==========================================
  currentPhase: GAME_PHASES.SETUP,
  players: [], // Array of: { id, name, avatar, score, isImposter, role, word, votesReceived }
  imposterMode: 'BLIND', // Options: 'BLIND' or 'INFILTRATOR'
  secretWord: '',
  imposterWord: '',
  category: '',
  startingPlayerId: null,
  activeRevealIndex: 0, // Sequential step counter for Pass & Play reveals
  activeVoteIndex: 0,   // Sequential step counter for casting secret ballots
  fetchedImages: [],    // Stores fetched image URLs or local category emoji data fallback

  // ==========================================
  // --- Game State Actions ---
  // ==========================================
  setPhase: (phase) => set({ currentPhase: phase }),

  // Updates a player's name and live-regenerates their Robohash seed avatar
  updatePlayerName: (id, name) => set((state) => ({
    players: state.players.map((p) => 
      p.id === id ? { ...p, name, avatar: `https://robohash.org/${encodeURIComponent(name || id)}?set=set2` } : p
    )
  })),

  // Initializes custom setup lobby names into persistent scoreboard track layers
  setInitialPlayersList: (inputPlayers) => set({
    players: inputPlayers.map(p => ({ ...p, score: 0, votesReceived: 0 })),
    currentPhase: GAME_PHASES.LOBBY_HUB
  }),

  // Switches between Hard (Blind) and Tactical (Infiltrator) game styles
  toggleImposterMode: () => set((state) => ({
    imposterMode: state.imposterMode === 'BLIND' ? 'INFILTRATOR' : 'BLIND'
  })),

  // Increments input slot counter allocations dynamically during player customization
  addPlayer: () => set((state) => {
    const nextId = (state.players.length + 1).toString();
    const defaultName = `Player ${nextId}`;
    return { players: [...state.players, { id: nextId, name: defaultName, avatar: `https://robohash.org/${defaultName}?set=set2` }] };
  }),

  // Decrements input slot counter allocations safely with strict minimum boundaries
  removePlayer: () => set((state) => {
    if (state.players.length <= 3) return {};
    return { players: state.players.slice(0, -1) };
  }),

  // Core Game Round Randomizer: Sets roles, fetches images, picks the starting reader
  initializeMatch: async () => {
    const { players, imposterMode } = get();
    
    // 1. Pick a random word pairing category from the local engine database bank
    const categories = Object.keys(WORD_BANK);
    const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    const wordPairs = WORD_BANK[chosenCategory];
    const pickedPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];

    // 2. Select index layout positions for the hidden Imposter and the starting speaker
    const imposterIndex = Math.floor(Math.random() * players.length);
    const starterIndex = Math.floor(Math.random() * players.length);

    // 3. Request image assets asynchronously via the core service pipeline
    const images = await fetchWordImages(pickedPair.civilian, chosenCategory);

    // 4. Distribute matching role assignments across the global session roster
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

  // Steps through the Pass & Play cycle, transitioning to descriptions when done
  advanceRevealPlayer: () => {
    const { activeRevealIndex, players } = get();
    if (activeRevealIndex + 1 >= players.length) {
      set({ currentPhase: GAME_PHASES.VERBAL_ROUND });
    } else {
      set({ activeRevealIndex: activeRevealIndex + 1 });
    }
  },

  // Resets local round indicators and activates the digital ballot screen layout
  startVotingPhase: () => set((state) => ({
    currentPhase: GAME_PHASES.VOTING,
    activeVoteIndex: 0,
    players: state.players.map(p => ({ ...p, votesReceived: 0 }))
  })),

  // Increments digital tally indicators or moves to final round parsing
  castSecretVote: (suspectId) => {
    const { players, activeVoteIndex } = get();
    const totalPlayers = players.length;
    
    const updatedPlayers = players.map(p => 
      p.id === suspectId ? { ...p, votesReceived: p.votesReceived + 1 } : p
    );

    if (activeVoteIndex + 1 >= totalPlayers) {
      set({ players: updatedPlayers, currentPhase: GAME_PHASES.RESOLUTION });
    } else {
      set({ players: updatedPlayers, activeVoteIndex: activeVoteIndex + 1 });
    }
  },

  // Tallies results, evaluates ties, and distributes scores dynamically
  resolveVotingResults: () => {
    const { players } = get();
    
    const maxVotes = Math.max(...players.map(p => p.votesReceived));
    const highestVotedPlayers = players.filter(p => p.votesReceived === maxVotes);

    // If there is a tie, route to the SHOWDOWN state
    if (highestVotedPlayers.length > 1 && maxVotes > 0) {
      set({ currentPhase: GAME_PHASES.SHOWDOWN });
      return { status: 'TIE', defendants: highestVotedPlayers };
    }

    const victim = highestVotedPlayers[0];
    
    const updatedPlayers = players.map(player => {
      // Civilians score points if they successfully execute the Imposter
      if (victim?.isImposter && !player.isImposter) {
        return { ...player, score: player.score + 1 };
      }
      // The Imposter scores if the group executes a Civilian instead
      if (!victim?.isImposter && player.isImposter) {
        return { ...player, score: player.score + 1 };
      }
      return player;
    });

    set({ players: updatedPlayers });
    return { status: 'DECIDED', victim };
  },
  resolveRedemption: (imposterGuessedCorrectly) => {
    const { players } = get();

    const updatedPlayers = players.map(player => {
      if (imposterGuessedCorrectly) {
        // Imposter guessed the word right! They steal the win (+1 pt)
        if (player.isImposter) return { ...player, score: player.score + 1 };
      } else {
        // Imposter guessed wrong! All Civilians get (+1 pt)
        if (!player.isImposter) return { ...player, score: player.score + 1 };
      }
      return player;
    });

    set({ 
      players: updatedPlayers, 
      currentPhase: GAME_PHASES.RESOLUTION // Redirect to show final points and vote break
    });
  },

  // Cleans up local round state variables to return safely to the Lobby Hub
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

  // Complete hard reset: Wipes everything and resets session back to the Welcome Home screen
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