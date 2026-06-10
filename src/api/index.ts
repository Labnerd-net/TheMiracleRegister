import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import miracles from "./routes/miracles";
import metadata from "./routes/metadata";
import saints from "./routes/saints";
import search from "./routes/search";
import types from "./routes/types";
import type { ApiEnv } from "./env";

const app = new OpenAPIHono<ApiEnv>().basePath("/api/v1");

app.use("*", cors());

const cache = (maxAge: number) => async (c: any, next: () => Promise<void>) => {
  await next();
  c.header("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=60`);
};

app.use("/saints/*", cache(3600));
app.use("/miracles/*", cache(1800));
app.use("/types/*", cache(86400));
app.use("/metadata/*", cache(86400));
app.use("/search/*", async (c: any, next: () => Promise<void>) => {
  await next();
  c.header("Cache-Control", "no-store");
});

app.route("/saints", saints);
app.route("/miracles", miracles);
app.route("/types", types);
app.route("/metadata", metadata);
app.route("/search", search);

app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "The Miracle Register API", version: "1.0.0" },
});

export default app;
