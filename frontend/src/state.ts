import { createStore } from "zustand";
import { z } from "zod";

const messages = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("request_code"),
  }),
  z.object({
    type: z.literal("send_code"),
    code: z.string(),
  }),
  z.object({
    type: z.literal("phone_connected"),
  }),
  z.object({
    type: z.literal("phone_disconnected"),
  }),
  z.object({
    type: z.literal("lockin_ending"),
  }),
  z.object({
    type: z.literal("looked_away"),
  }),
]);

type State = {
  phoneConnect: () => void;
  phoneDisconnect: () => void;
  receiveCode: (code: string) => void;
} & (
  | { stage: "requesting_code" }
  | { stage: "waiting_for_phone"; code: string }
  | { stage: "locked_in"; code: string; lookedAway: () => void }
);

export const gameStateStore = createStore<State>((set) => ({
  stage: "requesting_code",
  phoneConnect: () =>
    set((state) => {
      if (state.stage === "requesting_code") {
        throw new Error("phone connecting without code set");
      }

      return {
        stage: "locked_in",
        code: state.code,
        lookedAway: () => send({ type: "looked_away" }),
      };
    }),
  phoneDisconnect: () =>
    set((state) => {
      if (state.stage !== "locked_in")
        throw new Error("phone disconnect when not locked in");

      return { stage: "waiting_for_phone", code: state.code };
    }),
  receiveCode: (code) => {
    set((state) => {
      if (state.stage !== "requesting_code")
        throw new Error("received code when not requesting_code");

      return { stage: "waiting_for_phone", code };
    });
  },
}));

const ws = new WebSocket(import.meta.env.VITE_WS_URL);
const send = (msg: z.output<typeof messages>) => {
  ws.send(JSON.stringify(msg));
};

ws.onopen = () => {
  console.log("opened!");
  send({ type: "request_code" });
};

ws.onmessage = (evt) => {
  let msg = messages.safeParse(JSON.parse(evt.data));
  if (msg.success) {
    if (msg.data.type === "send_code") {
      gameStateStore.getState().receiveCode(msg.data.code);
    } else if (msg.data.type === "phone_connected") {
      gameStateStore.getState().phoneConnect();
    } else if (msg.data.type === "phone_disconnected") {
      gameStateStore.getState().phoneDisconnect();
    } else {
      console.error("got unknown/unexpected message", msg.data);
    }
  } else {
    console.error("got unexpected message", msg);
  }
};

ws.onerror = console.error;
