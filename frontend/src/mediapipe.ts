import { createStore } from "zustand";
import { gameStateStore } from "./state";

export const isLookingAwayStore = createStore<{
  count: number;
  lookAway: () => void;
  lookAtScreen: () => void;
}>((set) => ({
  count: 0,
  lookAtScreen: () => set((state) => ({ count: Math.max(state.count - 2, 0) })),
  lookAway: () =>
    set((state) => {
      if (state.count > 5) {
        const gameState = gameStateStore.getState();
        if (gameState.stage === "locked_in") gameState.lookedAway();
        return { count: 0 };
      } else return { count: state.count + 1 };
    }),
}));
