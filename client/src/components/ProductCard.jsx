import { formatCurrency } from "../utils/formatCurrency";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const image = product.images?.[0];
  const { addItem } = useCart();

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Product Image */}
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-5xl text-slate-400">
              {product.category === "Electronics"
                ? "🎧"
                : product.category === "Fashion"
                  ? "👕"
                  : "👛"}
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {product.category}
        </span>
      </div>

      {/* Product Information */}
      <div className="p-5">
        <h3 className="truncate text-lg font-semibold text-slate-900">
          {product.name}
        </h3>

        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(product.pricePaise)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => addItem(product)}
            disabled={product.stock < 1}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {product.stock < 1 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;