
// import './index.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProductListingPage from "./pages/ProductListingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductListingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
