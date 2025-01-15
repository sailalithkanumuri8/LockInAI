import { Results } from "@mediapipe/face_detection";
import { createStore } from "zustand";
import { gameStateStore } from "./state";

function isLookingAtScreen(results: Results): boolean {
  return results.detections.length === 1 && Math.random() > 0.7;
}

export function onResults(results: Results) {
  if (isLookingAtScreen(results)) {
    console.log("looking at screen W");
    isLookingAwayStore.getState().lookAtScreen();
  } else {
    console.log("looking away");
    isLookingAwayStore.getState().lookAway();
  }
}

const isLookingAwayStore = createStore<{
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
