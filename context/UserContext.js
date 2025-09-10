import { createContext, useContext, useEffect, useState } from "react";

const adminEmail = "ken@hotmail.com"; // CHANGE this to your admin email!

// Util functions for localStorage persistence
function getUsers() {
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem("users") || "{}");
}
function saveUsers(users) {
  if (typeof window === "undefined") return;
  localStorage.setItem("users", JSON.stringify(users));
}
function getCurrentUser() {
  if (typeof window === "undefined") return null;
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}
function saveCurrentUser(user) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem("currentUser", JSON.stringify(user));
  else localStorage.removeItem("currentUser");
}

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined at first for SSR

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  function updateUser(newUser) {
    setUser(newUser);
    saveCurrentUser(newUser);
    if (newUser && newUser.email) {
      const users = getUsers();
      users[newUser.email] = newUser;
      saveUsers(users);
    }
  }

  function throwError(message) {
    throw new Error(message);
  }

  async function register({ name, email, password }) {
    await new Promise(r => setTimeout(r, 700));
    const users = getUsers();
    if (!email || !password || !name) throwError("All fields are required.");
    if (users[email]) throwError("Email already registered.");
    const newUser = {
      name,
      email,
      password,
      isAdmin: email === adminEmail,
      portfolio: {},
      transactions: [],
      created_at: new Date().toISOString(),
    };
    users[email] = newUser;
    saveUsers(users);
    saveCurrentUser(newUser);
    setUser(newUser);
    return newUser;
  }

  async function login({ email, password }) {
    await new Promise(r => setTimeout(r, 700));
    const users = getUsers();
    if (!email || !password) throwError("Please enter email and password.");
    const foundUser = users[email];
    if (!foundUser || foundUser.password !== password) throwError("Invalid email or password.");
    // Update admin flag if admin email
    if (email === adminEmail && !foundUser.isAdmin) {
      foundUser.isAdmin = true;
      users[email] = foundUser;
      saveUsers(users);
    }
    saveCurrentUser(foundUser);
    setUser(foundUser);
    return foundUser;
  }

  function logout() {
    saveCurrentUser(null);
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, updateUser, register, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

