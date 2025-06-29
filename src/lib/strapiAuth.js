// Handles talking to Strapi's /auth endpoints

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("strapi_jwt")
    : null;
}

export function setToken(jwt) {
  localStorage.setItem("strapi_jwt", jwt);
}

export async function login({ email, password }) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json(); // { jwt, user }
}

export async function register({ username, email, password }) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json(); // { jwt, user }
}

export async function fetchMe() {
  const jwt = getToken();
  if (!jwt) return null;
  const res = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) return null;
  return res.json();
}
