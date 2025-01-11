import type { APIGatewayProxyEvent } from "aws-lambda";

export const connect = async (event: APIGatewayProxyEvent) => {
  console.log(event);
};
export const disconnect = async (event: APIGatewayProxyEvent) => {
  console.log(event);
};
export const handleEvent = async (event: APIGatewayProxyEvent) => {
  console.log(event);
};
