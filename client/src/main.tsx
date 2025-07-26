import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./styles/index.css";
import { ClientRouter } from "./ClientRouter";

createRoot(document.getElementById("app")!).render(<App />);

function App() {
  return (
    <>
      <BrowserRouter>
        <ClientRouter />
      </BrowserRouter>
      <Footer />
    </>
  );
}

function Footer() {
  return <div className="global-footer"></div>;
}
