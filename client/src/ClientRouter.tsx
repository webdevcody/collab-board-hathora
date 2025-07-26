import { Routes, Route, Link } from "react-router";
import Auth from "./components/Auth";
import Lobby from "./components/Lobby";
import Session from "./components/Session";
import Landing from "./components/Landing";
import "./styles/index.css";

export function ClientRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Auth />}>
        <Route path="/dashboard" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Session />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="container">
      <div className="card not-found-container">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="button">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
