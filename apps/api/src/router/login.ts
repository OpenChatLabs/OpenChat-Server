import { Hono } from "hono";
import { LoginRequest, LoginResponse } from "../types/login";

export const loginRouter = new Hono();

loginRouter.post("/", async (c) => {
  const { username, password } = await c.req.json<LoginRequest>();
  return c.json({ message: "Login successful" });
});