// localStorage-backed storage helpers for demo-only app
const USERS_KEY = "demo_users_v1";
const SESSION_KEY = "demo_session_v1";

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers() {
  return readJSON(USERS_KEY, {});
}
export function saveUsers(users) {
  writeJSON(USERS_KEY, users);
}
export function createUser({ name, email, password }) {
  const users = getUsers();
  if (users[email]) throw new Error("User already exists");
  users[email] = {
    name,
    email,
    password,
    portfolio: { BTC: 0 },
    transactions: []
  };
  saveUsers(users);
  return users[email];
}
export function authenticate(email, password) {
  const users = getUsers();
  const u = users[email];
  if (!u) throw new Error("No account for that email");
  if (u.password !== password) throw new Error("Invalid password");
  return u;
}
export function saveUser(user) {
  const users = getUsers();
  users[user.email] = user;
  saveUsers(users);
}

export function setSession(email) {
  localStorage.setItem(SESSION_KEY, email);
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
export function currentSessionUser() {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const users = getUsers();
  return users[email] || null;
}