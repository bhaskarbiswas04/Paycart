import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

function CartPage() {
  const {
    cartItems,
    totalItems,
    subtotalPaise,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="mb-3 text-3xl font-bold">Your Cart is Empty</h1>

        <p className="mb-6 text-gray-500">
          Looks like you haven't added anything yet.
        </p>

        <Link
          to="/"
          className="inline-block rounded-lg bg-black px-6 py-3 text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="mt-1 text-gray-500">
            {totalItems} item(s) in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{item.name}</h2>

                <p className="mt-1 text-sm text-gray-500">{item.category}</p>

                <p className="mt-2 font-medium">
                  {formatCurrency(item.pricePaise)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-9 w-9 rounded border disabled:opacity-40"
                  aria-label={`Decrease ${item.name} quantity`}
                >
                  −
                </button>

                <span className="w-6 text-center">{item.quantity}</span>

                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="h-9 w-9 rounded border disabled:opacity-40"
                  aria-label={`Increase ${item.name} quantity`}
                >
                  +
                </button>
              </div>

              <div className="text-right sm:min-w-28">
                <p className="font-semibold">
                  {formatCurrency(item.pricePaise * item.quantity)}
                </p>

                <button
                  onClick={() => removeItem(item._id)}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border p-6">
          <h2 className="mb-5 text-xl font-bold">Order Summary</h2>

          <div className="flex justify-between py-2 text-gray-600">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="flex justify-between py-2 text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotalPaise)}</span>
          </div>

          <div className="my-4 border-t" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(subtotalPaise)}</span>
          </div>

          <button
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-lg bg-black px-4 py-3 text-white opacity-50"
          >
            Checkout — Coming in Phase 6
          </button>

          <Link
            to="/"
            className="mt-4 block text-center text-sm text-gray-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;