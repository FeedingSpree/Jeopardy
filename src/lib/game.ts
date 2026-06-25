import { db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { GameState, Category } from '../types';

export const GAME_DOC_ID = 'default_room';
export const gameDocRef = doc(db, 'games', GAME_DOC_ID);

export const subscribeToGame = (callback: (state: GameState | null) => void) => {
  return onSnapshot(gameDocRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as GameState);
    } else {
      callback(null);
    }
  });
};

export const initializeGameDoc = async () => {
  const snap = await getDoc(gameDocRef);
  if (!snap.exists()) {
    const initialState: GameState = {
      status: 'setup',
      categories: [],
      players: {},
      currentQuestionId: null,
      buzzedPlayerId: null,
      hostSocketId: null,
    };
    await setDoc(gameDocRef, initialState);
    return initialState;
  }
  return snap.data() as GameState;
};

// Host Actions

export const claimHost = async (hostId: string) => {
  await updateDoc(gameDocRef, { hostSocketId: hostId });
};

export const releaseHost = async () => {
  await updateDoc(gameDocRef, { hostSocketId: null });
};

export const updateBoard = async (categories: Category[]) => {
  await updateDoc(gameDocRef, { categories });
};

export const startGame = async () => {
  await updateDoc(gameDocRef, { status: 'board' });
};

export const openQuestion = async (questionId: string) => {
  await updateDoc(gameDocRef, { 
    status: 'question',
    currentQuestionId: questionId,
    buzzedPlayerId: null
  });
};

export const closeQuestion = async (categories: Category[], currentQuestionId: string) => {
  // Mark current as answered
  const newCategories = categories.map(cat => {
    return {
      ...cat,
      questions: cat.questions.map(q => {
        if (q.id === currentQuestionId) {
          return { ...q, answered: true };
        }
        return q;
      })
    };
  });

  await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(gameDocRef);
      if (!snap.exists()) return;
      const data = snap.data() as GameState;

      // also clear buzzedAt for everyone
      for (const p in data.players) {
        delete data.players[p].buzzedAt;
      }

      transaction.update(gameDocRef, {
        categories: newCategories,
        status: 'board',
        currentQuestionId: null,
        buzzedPlayerId: null,
        players: data.players
      });
  });
};

export const resolveBuzz = async (correct: boolean, categories: Category[], currentQuestionId: string, buzzedPlayerId: string, points: number) => {
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(gameDocRef);
    if (!snap.exists()) return;
    const data = snap.data() as GameState;
    if (!data.players[buzzedPlayerId]) return;

    if (correct) {
      data.players[buzzedPlayerId].score += Number(points);
      // mark answered
      const newCategories = categories.map(cat => ({
        ...cat,
        questions: cat.questions.map(q => q.id === currentQuestionId ? { ...q, answered: true } : q)
      }));
      data.categories = newCategories;
      data.status = 'board';
      data.currentQuestionId = null;
    } else {
      data.players[buzzedPlayerId].score -= Number(points);
      // return to question so others can buzz
      data.status = 'question';
    }

    data.buzzedPlayerId = null;
    for (const p in data.players) {
      delete data.players[p].buzzedAt;
    }

    transaction.set(gameDocRef, data);
  });
};

export const resetGame = async () => {
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(gameDocRef);
    if (!snap.exists()) return;
    const data = snap.data() as GameState;
    transaction.set(gameDocRef, {
      status: 'setup',
      categories: [],
      players: {},
      currentQuestionId: null,
      buzzedPlayerId: null,
      hostSocketId: data.hostSocketId // Preserve host
    });
  });
};

// Player Actions

export const joinAsPlayer = async (playerId: string, name: string) => {
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(gameDocRef);
    if (!snap.exists()) return;
    const data = snap.data() as GameState;
    
    if (!data.players[playerId]) {
      data.players[playerId] = { id: playerId, name, score: 0 };
      transaction.update(gameDocRef, { players: data.players });
    }
  });
};

export const buzz = async (playerId: string) => {
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(gameDocRef);
    if (!snap.exists()) return;
    const data = snap.data() as GameState;
    
    if (data.status !== 'question') return;
    if (!data.players[playerId]) return;
    if (data.buzzedPlayerId) return; // someone already buzzed
    
    data.buzzedPlayerId = playerId;
    data.players[playerId].buzzedAt = Date.now();
    data.status = 'buzzed';
    
    transaction.set(gameDocRef, data);
  });
};
