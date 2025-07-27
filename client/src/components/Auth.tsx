import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { jwtDecode } from "jwt-decode";
import { login } from "../api/auth";
import { Header } from "./Header";
import logo from "../assets/logo.svg";
import collaborationIllustration from "../assets/collaboration-illustration.svg";

const STORAGE_KEY = "userToken";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
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
      <div className="auth-page">
        <div className="auth-logo">
          <Link to="/" className="auth-logo-link">
            <img src={logo} alt="Collaborative Boards" />
            <span>Collaborative Boards</span>
          </Link>
        </div>
        <div className="auth-content">
          <Login onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  const { userId } = jwtDecode<{ userId: string }>(token);
  const isOnRoomPage = location.pathname.startsWith("/boards/");

  return (
    <div className="auth-container">
      {!isOnRoomPage && <Header userId={userId} onLogout={handleLogout} />}
      <div className="auth-content">
        <Outlet context={{ token, userId }} />
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
    <div className="login-container">
      <div className="login-illustration">
        <img
          src={collaborationIllustration}
          alt="Collaborative drawing illustration"
        />
        <div className="login-text">
          <h2>Welcome to Collaborative Boards</h2>
          <p>Create, draw, and collaborate in real-time with your team</p>
        </div>
      </div>
      <div className="login-form">
        <h1>Get Started</h1>
        <p>Choose a username to begin your collaborative journey</p>
        <input
          className="input"
          type="text"
          disabled={loading}
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => {
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
    </div>
  );
}
