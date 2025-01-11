/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "backend",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        turso: {
          version: "0.2.3",
          organization: "rgodha",
          apiToken: process.env.TURSO_API_TOKEN,
        },
      },
    };
  },
  async run() {
    const group = await turso.getGroup({
      id: "group",
    });

    const db = new turso.Database("db", {
      group: group.id,
    });

    const database = new sst.Linkable("Database", {
      properties: {
        token: db.id.apply(
          async (id) => (await turso.getDatabaseToken({ id })).jwt,
        ),
        url: $interpolate`libsql://${db.id}-rgodha24.aws-us-east-1.turso.io`,
      },
    });

    const ws = new sst.aws.ApiGatewayWebSocket("Websocket");

    ws.route("$connect", { handler: "src/ws.connect", link: [database] });
    ws.route("$disconnect", "src/ws.disconnect");
    ws.route("$default", "src/ws.handleEvent");
  },
});
