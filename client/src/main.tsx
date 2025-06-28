import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Auth from "./Auth";
import Home from "./Home";
import Session from "./Session";
import "./styles.css";

createRoot(document.getElementById("app")!).render(<App />);

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Auth />}>
            <Route path="/" element={<Home />} />
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
