import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // On app load, check Supabase Auth session and fetch profile
  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);

        const composedUser = {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || "",
          is_admin: !!profile?.is_admin, // ✅ pulled directly from DB
          profilePic: profile?.profilePic || "",
          ...profile,
        };

        setUser(composedUser);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("currentUser", JSON.stringify(composedUser));
        }
      } else {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data || {};
  }

  function updateUser(newUser) {
    setUser(newUser);
    if (typeof window !== "undefined") {
      if (newUser)
        window.sessionStorage.setItem("currentUser", JSON.stringify(newUser));
      else
        window.sessionStorage.removeItem("currentUser");
    }
  }

  function throwError(message) {
    throw new Error(message);
  }

  // Register using Supabase Auth and create profile
  async function register({ name, email, password }) {
    if (!email || !password || !name) throwError("All fields are required.");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throwError(error.message || "Could not register user.");
    if (!data.user) throwError("Registration failed.");

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        name,
        email,
        is_admin: false, // ✅ default to false (set manually in dashboard or SQL later)
      },
    ]);
    if (profileError)
      throwError(profileError.message || "Could not create user profile.");

    const userObj = {
      id: data.user.id,
      email: data.user.email,
      name,
      is_admin: false,
      profilePic: "",
    };
    updateUser(userObj);
    return userObj;
  }

  // Login using Supabase Auth and fetch profile
  async function login({ email, password }) {
    if (!email || !password) throwError("Please enter email and password.");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throwError(error.message || "Invalid email or password.");
    if (!data.user) throwError("Login failed.");

    const profile = await fetchProfile(data.user.id);
    const userObj = {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || "",
      is_admin: !!profile?.is_admin,
      profilePic: profile?.profilePic || "",
      ...profile,
    };
    updateUser(userObj);
    return userObj;
  }

  async function logout() {
    await supabase.auth.signOut();
    updateUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("df-messenger-chat-history");
      window.sessionStorage.removeItem("df-messenger-chat-history");
    }
  }

  // Modal controls
  function openAuthModal() {
    setShowAuthModal(true);
  }
  function closeAuthModal() {
    setShowAuthModal(false);
  }
  function openInvestModal(plan) {
    setSelectedPlan(plan || null);
    setShowInvestModal(true);
  }
  function closeInvestModal() {
    setShowInvestModal(false);
    setSelectedPlan(null);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        register,
        login,
        logout,
        showAuthModal,
        openAuthModal,
        closeAuthModal,
        showInvestModal,
        openInvestModal,
        closeInvestModal,
        selectedPlan,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
