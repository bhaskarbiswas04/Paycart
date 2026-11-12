import { Link, useLocation } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";

function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Order details unavailable</h1>

        <p className="my-4 text-gray-500">
          Please visit your products page to continue shopping.
        </p>

        <Link to="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="text-3xl font-bold">Order Created Successfully!</h1>

        <p className="mt-3 text-gray-500">
          Your order has been recorded. Payment is still pending.
        </p>

        <div className="my-8 rounded-xl bg-gray-50 p-5 text-left">
          <div className="flex justify-between gap-4 py-2">
            <span className="text-gray-500">Order ID</span>
            <span className="break-all text-right font-medium">{order.id}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold">
              {formatCurrency(order.amountPaise)}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-500">Payment Status</span>
            <span className="font-semibold text-amber-600">
              {order.paymentStatus}
            </span>
          </div>
        </div>

        <h2 className="mb-4 text-left font-semibold">Ordered Products</h2>

        <div className="space-y-3 text-left">
          {order.items.map((item, index) => (
            <div
              key={`${item.product}-${index}`}
              className="flex justify-between gap-4 border-b pb-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p className="font-medium">
                {formatCurrency(item.pricePaise * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Link
          to="/"
          className="mt-8 block rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;