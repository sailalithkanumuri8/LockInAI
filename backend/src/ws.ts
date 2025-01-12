import type { APIGatewayProxyEvent } from "aws-lambda";
import { db, lockin } from "./db";
import { messages, sendMessage } from "./message";
import { eq, or } from "drizzle-orm";

export const connect = async (event: APIGatewayProxyEvent) => {
  console.log(event);
  // noop
  return { statusCode: 200, body: "connected" };
};
export const disconnect = async (req: APIGatewayProxyEvent) => {
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
      db.update(lockin)
        .set({
          phoneId: null,
        })
        .where(eq(lockin.code, li.code));
    } else {
      if (li.phoneId) {
        sendMessage(li.phoneId, { type: "lockin_ending" });
      }

      db.delete(lockin).where(eq(lockin.code, li.code));
    }
  } else {
    // we dont really care about this connection
    return { statusCode: 200, body: "Disconnected" };
  }
};
export const handleEvent = async (req: APIGatewayProxyEvent) => {
  console.log(req);
  const connectionId = req.requestContext.connectionId!;
  const event = messages.parse(JSON.parse(req.body || "{}"));
  const [li] = await db
    .select()
    .from(lockin)
    .where(
      or(eq(lockin.computerId, connectionId), eq(lockin.phoneId, connectionId)),
    );

  console.log(li);
  if (
    event.type === "phone_connected" ||
    event.type === "phone_disconnected" ||
    event.type === "lockin_ending"
  ) {
    // should be impossible
    console.log("how are we here");
  } else if (event.type === "send_code") {
    // this is a phone connecting to a certain code
  } else if (event.type === "looked_away") {
    // forward to phone
  } else if (event.type === "request_code") {
    // make a new lockin
  } else {
    let unreachable: never = event;
  }
};
