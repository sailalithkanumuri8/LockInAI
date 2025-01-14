import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "zustand";
import { gameStateStore } from "../state";

export const Route = createFileRoute("/lockin")({
  component: LockInComponent,
  beforeLoad: () => {
    navigator.mediaDevices;
  },
});

function LockInComponent() {
  const gameState = useStore(gameStateStore);
  const code =
    gameState.stage === "requesting_code" ? undefined : gameState.code;

  return (
    <div>
      <div>stage: {gameState.stage}</div>
      <div>code: {code}</div>

      {gameState.stage === "locked_in" ? (
        <button onClick={() => gameState.lookedAway()}> lookedAway </button>
      ) : null}
    </div>
  );
}
