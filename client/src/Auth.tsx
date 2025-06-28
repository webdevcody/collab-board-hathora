import { useState } from "react";
import { login } from "./backendClient";
import { Outlet, useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";

const STORAGE_KEY = "userToken";

export default function Auth() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(sessionStorage.getItem(STORAGE_KEY));

  if (token == null) {
    return (
      <Login
        onLogin={(userToken) => {
          sessionStorage.setItem(STORAGE_KEY, userToken);
          setToken(userToken);
        }}
      />
    );
  }

  const { userId } = jwtDecode<{ userId: string }>(token);
  return (
    <>
      <div>Logged in as: {userId}</div>
      <button
        onClick={() => {
          sessionStorage.removeItem(STORAGE_KEY);
          setToken(null);
          navigate("/");
        }}
      >
        Logout
      </button>
      <Outlet context={{ token, userId }} />
    </>
  );
}

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      />
      <button
        disabled={loading}
        onClick={async () => {
          if (username != null && username !== "") {
            setLoading(true);
            const userToken = await login(username);
            setLoading(false);
            onLogin(userToken);
          }
        }}
      >
        Login
      </button>
    </div>
  );
}
