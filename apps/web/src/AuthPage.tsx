import { useEffect, useState } from "react";
import type { AuthResponse, AuthUser } from "@fluidgym/shared-types";
import { signup, login, googleAuth, fetchMe } from "./api/authClient";
import { GoogleSignInButton } from "./components/GoogleSignInButton";

const TOKEN_STORAGE_KEY = "fluidgym_token";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));

  // Verifies the stored token still round-trips against the API rather than trusting localStorage blindly.
  useEffect(() => {
    if (!token) return;
    fetchMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
      });
  }, [token]);

  function handleAuthResponse(response: AuthResponse) {
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    setError(null);
  }

  async function handleSignup() {
    try {
      handleAuthResponse(await signup(email, password));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleLogin() {
    try {
      handleAuthResponse(await login(email, password));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleGoogleToken(idToken: string) {
    try {
      handleAuthResponse(await googleAuth(idToken));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  if (user) {
    return (
      <div>
        <p>Logged in as {user.email}</p>
        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 280 }}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" type="email" />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        type="password"
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleLogin}>Log in</button>
        <button onClick={handleSignup}>Sign up</button>
      </div>
      {error && <p style={{ color: "crimson", fontSize: 14 }}>{error}</p>}
      <GoogleSignInButton onIdToken={handleGoogleToken} />
    </div>
  );
}
