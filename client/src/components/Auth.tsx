import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { login } from "../backendClient";

const STORAGE_KEY = "userToken";

export default function Auth() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem(STORAGE_KEY)
  );

  const handleLogin = (userToken: string) => {
    sessionStorage.setItem(STORAGE_KEY, userToken);
    setToken(userToken);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
    navigate("/");
  };

  if (token == null) {
    return (
      <div className="auth-content">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  const { userId } = jwtDecode<{ userId: string }>(token);
  return (
    <div className="auth-container">
      <AuthHeader userId={userId} onLogout={handleLogout} />
      <div className="auth-content">
        <Outlet context={{ token, userId }} />
      </div>
    </div>
  );
}

function AuthHeader({
  userId,
  onLogout,
}: {
  userId: string;
  onLogout: () => void;
}) {
  return (
    <div className="auth-header">
      <div className="auth-title">Collaborative Boards</div>
      <div className="auth-actions">
        <span>Welcome, {userId}</span>
        <button className="button button-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { token } = await login(username.trim());
      onLogin(token);
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h1>Collaborative Boards</h1>
      <p>Choose a username to get started</p>
      <input
        className="input"
        type="text"
        disabled={loading}
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && username.trim() !== "") {
            handleLogin();
          }
        }}
      />
      <button
        className="button"
        disabled={loading || username.trim() === ""}
        onClick={handleLogin}
      >
        {loading ? "Logging in..." : "Continue"}
      </button>
    </div>
  );
}
