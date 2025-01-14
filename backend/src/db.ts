import { drizzle } from "drizzle-orm/libsql/node";
import * as t from "drizzle-orm/sqlite-core";
import { Resource } from "sst";

export const db = drizzle({
  connection: {
    url: Resource.Database.url,
    authToken: Resource.Database.token,
  },
});

export const lockin = t.sqliteTable("lockin", {
  code: t.text().primaryKey(),
  computerId: t.text().notNull().unique(),
  phoneId: t.text(),
});
