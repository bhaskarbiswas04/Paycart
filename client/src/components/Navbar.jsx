import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-slate-900"
        >
          Pay<span className="text-blue-600">Cart</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
          <Link to="/" className="transition hover:text-blue-600">
            Home
          </Link>

          <Link to="/" className="transition hover:text-blue-600">
            Shop
          </Link>
        </div>

        {/* Cart */}
        <Link
          to="/cart"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          Cart
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;