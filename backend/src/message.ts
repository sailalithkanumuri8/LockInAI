import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { Resource } from "sst";
import { z } from "zod";

export const messages = z.discriminatedUnion("type", [
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

export async function sendMessage(
  ConnectionId: string,
  message: z.output<typeof messages>,
) {
  const manager = new ApiGatewayManagementApi({
    endpoint: Resource.wsManagementEndpoint.managementEndpoint,
  });
  const Data = JSON.stringify(message);
  console.log(`posting ${Data} to connection ${ConnectionId}`);
  await manager.postToConnection({ ConnectionId, Data });
}
