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
        cloudflare: "5.47.0",
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
        url: $interpolate`libsql://${db.id}-rgodha.aws-us-east-1.turso.io`,
      },
    });
    new sst.x.DevCommand("Studio", {
      link: [database],
      dev: {
        command: "bun drizzle-kit studio",
        autostart: true,
        directory: "backend",
      },
    });
    const ws = new sst.aws.ApiGatewayWebSocket("Websocket", {
      domain:
        $app.stage === "production"
          ? {
              name: "ws.lockinai.rohangodha.com",
              dns: sst.cloudflare.dns(),
            }
          : undefined,
    });

    ws.route("$connect", {
      handler: "backend/src/ws.connect",
      link: [database, ws],
      nodejs: {
        install: ["@libsql/client", "@libsql/linux-x64-gnu"],
      },
    });
    ws.route("$disconnect", {
      handler: "backend/src/ws.disconnect",
      link: [database, ws],
      nodejs: {
        install: ["@libsql/client", "@libsql/linux-x64-gnu"],
      },
    });
    ws.route("$default", {
      handler: "backend/src/ws.handleEvent",
      link: [database, ws],
      nodejs: {
        install: ["@libsql/client", "@libsql/linux-x64-gnu"],
      },
    });

    const site = new sst.aws.StaticSite("Site", {
      path: "frontend/",
      environment: {
        VITE_WS_URL: ws.url,
      },
      build: {
        command: "pnpm build",
        output: "dist",
      },
      domain:
        $app.stage === "production"
          ? {
              name: "lockinai.rohangodha.com",
              dns: sst.cloudflare.dns(),
            }
          : undefined,
    });
    return {
      url: site.url,
      ws: ws.url,
    };
  },
});
