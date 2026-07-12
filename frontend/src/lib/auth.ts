import { Role } from "./enums";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as AuthUser;
}

export async function signup(email: string, password: string, name: string, role: Role) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, name, role }),
  });

  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as AuthUser;
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as AuthUser;
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok && response.status !== 401) {
    throw new Error(await parseError(response));
  }
}
