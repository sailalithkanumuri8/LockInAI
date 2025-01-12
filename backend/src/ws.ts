import type { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { db, lockin } from "./db";
import { messages, sendMessage } from "./message";
import { eq, or } from "drizzle-orm";
import { customAlphabet } from "nanoid";

export const connect: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  console.log(event);
  // noop
  return { statusCode: 200, body: "connected" };
};

export const disconnect: APIGatewayProxyWebsocketHandlerV2 = async (req) => {
  const connectionId = req.requestContext.connectionId!;
  console.log(req);

  const [li] = await db
    .select()
    .from(lockin)
    .where(
      or(eq(lockin.computerId, connectionId), eq(lockin.phoneId, connectionId)),
    );

  if (li) {
    if (li.phoneId === connectionId) {
      // could theoretically promise.all but im lazy
      sendMessage(li.computerId, { type: "phone_disconnected" });
      await db
        .update(lockin)
        .set({
          phoneId: null,
        })
        .where(eq(lockin.code, li.code));
    } else {
      if (li.phoneId) {
        sendMessage(li.phoneId, { type: "lockin_ending" });
      }

      await db.delete(lockin).where(eq(lockin.code, li.code));
    }
    return { statusCode: 200, body: "Disconnected" };
  } else {
    // we dont really care about this connection
    return { statusCode: 200, body: "Disconnected" };
  }
};

export const handleEvent: APIGatewayProxyWebsocketHandlerV2 = async (req) => {
  const connectionId = req.requestContext.connectionId!;
  const event = messages.parse(JSON.parse(req.body || "{}"));
  const [li] = await db
    .select()
    .from(lockin)
    .where(
      or(eq(lockin.computerId, connectionId), eq(lockin.phoneId, connectionId)),
    );

  if (event.type === "phone_connected" || event.type === "lockin_ending") {
    console.log("how are we here", li, event.type);
  } else if (event.type === "send_code") {
    const [liWithCode] = await db
      .select()
      .from(lockin)
      .where(eq(lockin.code, event.code));

    if (!liWithCode) {
      sendMessage(connectionId, { type: "request_code" });
      return { statusCode: 404 };
    }

    if (liWithCode.phoneId) {
      await sendMessage(liWithCode.phoneId, { type: "phone_disconnected" });
    } else {
      await sendMessage(liWithCode.computerId, { type: "phone_connected" });
    }

    await db
      .update(lockin)
      .set({ phoneId: connectionId })
      .where(eq(lockin.code, event.code));

    await sendMessage(connectionId, { type: "phone_connected" });
  } else if (event.type === "looked_away") {
    if (!li?.phoneId)
      throw new Error("sending looked_away to non existent lockin or phone");
    // forward to phone
    await sendMessage(li.phoneId, { type: "looked_away" });
  } else if (event.type === "request_code") {
    // make a new lockin
    const code = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ")(4);
    await db.insert(lockin).values({
      code,
      computerId: connectionId,
    });

    await sendMessage(connectionId, { type: "send_code", code });
  } else if (event.type === "phone_disconnected") {
    if (li) {
      await db
        .update(lockin)
        .set({ phoneId: undefined })
        .where(eq(lockin.code, li.code));
    }
  } else {
    let unreachable: never = event;
  }
  return { statusCode: 200, body: "Disconnected" };
};
