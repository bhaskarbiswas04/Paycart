import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import CheckoutPage from "./pages/CheckoutPage";

import Navbar from "./components/Navbar";
import ProductListingPage from "./pages/ProductListingPage";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProductListingPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
