import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { formatCurrency } from "../utils/formatCurrency";
import { createRazorpayOrder } from "../services/paymentService";
import { loadRazorpayScript } from "../utils/loadRazorpayScript";

function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;

  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentResponse, setPaymentResponse] = useState(null);

  const handlePayment = async () => {
    if (!order?.id || loading || paymentResponse) return;

    setLoading(true);
    setPaymentError("");

    try {
      // 1. Load Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout. Please try again.");
      }

      // 2. Request Razorpay order from backend
      const response = await createRazorpayOrder(order.id);

      if (!response.success || !response.payment) {
        throw new Error("Unable to initialize payment");
      }

      const payment = response.payment;

      // 3. Configure Razorpay Checkout
      const options = {
        key: payment.keyId,

        amount: payment.amount,
        currency: payment.currency,

        name: "PayCart",
        description: "Payment for your order",

        order_id: payment.razorpayOrderId,

        prefill: {
          name: order.customer?.name || "",
          email: order.customer?.email || "",
          contact: order.customer?.phone ? `+91${order.customer.phone}` : "",
        },

        notes: {
          localOrderId: payment.localOrderId,
        },

        theme: {
          color: "#111827",
        },

        // 4. Successful Checkout callback
        handler: function (razorpayResponse) {
          setPaymentResponse(razorpayResponse);
          setLoading(false);
        },

        // 5. Customer closes checkout
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // 6. Create and open Razorpay Checkout
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        setPaymentError(
          response.error?.description || "Payment failed. Please try again.",
        );

        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      setPaymentError(error.message || "Unable to start payment");

      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Order details unavailable</h1>

        <p className="my-4 text-gray-500">
          Please return to the products page.
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

        <p className="mt-3 text-gray-500">Your order is ready for payment.</p>

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
            <span className="font-semibold text-amber-600">Pending</span>
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

        {paymentError && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {paymentError}
          </div>
        )}

        {paymentResponse && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left"
          >
            <p className="font-semibold text-amber-800">
              Payment response received
            </p>

            <p className="mt-2 text-sm text-amber-700">
              Razorpay returned a payment response. Our server must verify its
              signature before marking this order as Paid.
            </p>

            <p className="mt-2 break-all text-xs text-gray-600">
              Payment ID: {paymentResponse.razorpay_payment_id}
            </p>
          </div>
        )}

        {!paymentResponse && (
          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Initializing Payment..."
              : `Pay ${formatCurrency(order.amountPaise)}`}
          </button>
        )}

        <Link
          to="/"
          className="mt-5 block text-sm text-gray-500 hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;