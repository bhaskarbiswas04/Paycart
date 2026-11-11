import { useEffect, useState } from "react";

import { getProducts } from "../services/productService";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import ProductSkeleton from "../components/ProductSkeleton";

function ProductListingPage() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    limit: 10,
  });

  // Fetch products whenever filters change
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: 10,
          sort,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (category !== "All") {
          params.category = category;
        }

        if (minPrice !== "") {
          params.minPrice = minPrice;
        }

        if (maxPrice !== "") {
          params.maxPrice = maxPrice;
        }

        const response = await getProducts(params, {
          signal: controller.signal,
        });

        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.message);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [search, category, minPrice, maxPrice, sort, page]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, minPrice, maxPrice, sort]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Discover your favourites
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Explore Products
          </h1>

          <p className="mt-3 text-slate-500">
            Find the perfect products for your everyday needs.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters */}
          <div className="lg:col-span-1">
            <ProductFilters
              category={category}
              setCategory={setCategory}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sort={sort}
              setSort={setSort}
            />
          </div>

          {/* Products */}
          <section className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {loading
                  ? "Loading products..."
                  : `${pagination.totalProducts} products found`}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-700">
                  Something went wrong
                </p>

                <p className="mt-2 text-sm text-red-600">{error}</p>

                <button
                  type="button"
                  onClick={() => setPage((current) => current)}
                  className="mt-3 text-sm font-semibold text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading */}
            {!error && loading && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((current) => current - 1)}
                      className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="text-sm font-medium text-slate-600">
                      Page {page} of {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <p className="text-4xl">🔍</p>

                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  No products found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProductListingPage;
