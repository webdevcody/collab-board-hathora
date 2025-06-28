import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Auth from "./components/Auth";
import Lobby from "./components/Lobby";
import Session from "./components/Session";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/responsive.css";

createRoot(document.getElementById("app")!).render(<App />);

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Auth />}>
            <Route path="/" element={<Lobby />} />
            <Route path="/room/:roomId" element={<Session />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function NotFound() {
  return <div>Not Found</div>;
}
