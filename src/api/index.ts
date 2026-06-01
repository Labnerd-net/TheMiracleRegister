import { OpenAPIHono } from "@hono/zod-openapi";
import miracles from "./routes/miracles";
import saints from "./routes/saints";
import search from "./routes/search";
import types from "./routes/types";

type Env = { Bindings: { DATABASE_URL: string } };

const app = new OpenAPIHono<Env>().basePath("/api/v1");

app.route("/saints", saints);
app.route("/miracles", miracles);
app.route("/types", types);
app.route("/search", search);

app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "The Miracles Register API", version: "1.0.0" },
});

export default app;
