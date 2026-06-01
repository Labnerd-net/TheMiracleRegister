import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import app from "../../../api/index";

export const ALL: APIRoute = ({ request }) => app.fetch(request, env);
