import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./style/index.scss";

import Home from "./components/home/Home";
import About from "./components/about/About";
import Id from "./components/id/Id";

import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import Formacao from "./components/formacao/formacao";
import ScrollToTop from "./utils/scrollToTop";
import { Privacy } from "./components/privacy";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/formacao/financiada" element={<Formacao />} />
        <Route path="/formacao/financiada/:id" element={<Id />} />

        <Route path="/formacao/nao-financiada" element={<Formacao />} />
        <Route path="/formacao/nao-financiada/:id" element={<Id />} />
        <Route path="/sobre-nos" element={<About />} />

        <Route path="/privacy-policy" element={<Privacy />} />
      </Routes>

      <Footer />
    </Router>
  </StrictMode>
);
