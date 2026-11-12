import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { formatCurrency } from "../utils/formatCurrency";

import { createRazorpayOrder, verifyPayment } from "../services/paymentService";

import { loadRazorpayScript } from "../utils/loadRazorpayScript";

function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [paymentError, setPaymentError] = useState("");
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [verifiedPayment, setVerifiedPayment] = useState(null);

  // 1. Verify payment with our backend
  const handleVerifyPayment = async (response) => {
    if (!response || verifying || verifiedPayment) return;

    setVerifying(true);
    setPaymentError("");

    try {
      const verification = await verifyPayment(order.id, {
        razorpay_payment_id: response.razorpay_payment_id,

        razorpay_order_id: response.razorpay_order_id,

        razorpay_signature: response.razorpay_signature,
      });

      if (!verification.success || verification.paymentStatus !== "Paid") {
        throw new Error(
          "Payment could not be confirmed. Please try verification again.",
        );
      }

      setVerifiedPayment(verification);
    } catch (error) {
      setPaymentError(
        error.message ||
          "Payment verification failed. Please contact support if money was deducted.",
      );
    } finally {
      setVerifying(false);
    }
  };

  // 2. Initialize Razorpay payment
  const handlePayment = async () => {
    if (
      !order?.id ||
      loading ||
      verifying ||
      paymentResponse ||
      verifiedPayment
    ) {
      return;
    }

    setLoading(true);
    setPaymentError("");

    try {
      // Load Razorpay Checkout script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout. Please try again.");
      }

      // Request Razorpay order from backend
      const response = await createRazorpayOrder(order.id);

      if (!response.success || !response.payment) {
        throw new Error("Unable to initialize payment.");
      }

      const payment = response.payment;

      // Prepare customer phone number
      const rawPhone = String(order.customer?.phone || "").replace(/\D/g, "");

      const contact = rawPhone
        ? rawPhone.length === 10
          ? `+91${rawPhone}`
          : `+${rawPhone}`
        : "";

      // Razorpay Checkout configuration
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
          contact,
        },

        notes: {
          localOrderId: payment.localOrderId,
        },

        theme: {
          color: "#111827",
        },

        // Successful Razorpay Checkout callback
        handler: async function (razorpayResponse) {
          setLoading(false);

          // Preserve original response for verification retry
          setPaymentResponse(razorpayResponse);

          // Verify payment on backend
          await handleVerifyPayment(razorpayResponse);
        },

        // Customer closes Checkout
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // Create Razorpay instance
      const razorpay = new window.Razorpay(options);

      // Handle payment failure
      razorpay.on("payment.failed", function (response) {
        setPaymentError(
          response.error?.description || "Payment failed. Please try again.",
        );

        setLoading(false);
      });

      // Open Razorpay Checkout
      razorpay.open();
    } catch (error) {
      setPaymentError(error.message || "Unable to start payment.");

      setLoading(false);
    }
  };

  // 3. Handle missing order information
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

  // 4. Order confirmation UI
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border p-8 text-center">
        {/* Order icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="text-3xl font-bold">Order Created Successfully!</h1>

        <p className="mt-3 text-gray-500">Your order is ready for payment.</p>

        {/* Order summary */}
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

            <span
              className={`font-semibold ${
                verifiedPayment ? "text-green-600" : "text-amber-600"
              }`}
            >
              {verifiedPayment ? "Paid" : "Pending"}
            </span>
          </div>
        </div>

        {/* Ordered products */}
        <h2 className="mb-4 text-left font-semibold">Ordered Products</h2>

        <div className="space-y-3 text-left">
          {order.items.map((item, index) => (
            <div
              key={`${item.product || "product"}-${index}`}
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

        {/* Payment error */}
        {paymentError && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700"
          >
            {paymentError}
          </div>
        )}

        {/* Payment response received */}
        {paymentResponse && !verifiedPayment && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left"
          >
            <p className="font-semibold text-amber-800">
              Payment response received
            </p>

            <p className="mt-2 text-sm text-amber-700">
              Razorpay returned a payment response. Our server must verify it
              before marking this order as Paid.
            </p>

            <p className="mt-2 break-all text-xs text-gray-600">
              Payment ID: {paymentResponse.razorpay_payment_id}
            </p>
          </div>
        )}

        {/* Verification loading */}
        {verifying && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800"
          >
            Verifying your payment securely...
          </div>
        )}

        {/* Verified payment success */}
        {verifiedPayment && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-green-200 bg-green-50 p-5 text-left"
          >
            <h2 className="font-bold text-green-800">Payment Successful!</h2>

            <p className="mt-2 text-sm text-green-700">
              Your payment has been verified successfully. Your order is now
              confirmed.
            </p>

            <p className="mt-2 break-all text-xs text-gray-600">
              Payment ID: {verifiedPayment.paymentId}
            </p>
          </div>
        )}

        {/* Initial payment button */}
        {!paymentResponse && !verifiedPayment && (
          <button
            onClick={handlePayment}
            disabled={loading || verifying}
            className="mt-8 w-full rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Initializing Payment..."
              : `Pay ${formatCurrency(order.amountPaise)}`}
          </button>
        )}

        {/* Retry verification without paying again */}
        {paymentResponse && !verifiedPayment && (
          <button
            onClick={() => handleVerifyPayment(paymentResponse)}
            disabled={verifying}
            className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying ? "Verifying Payment..." : "Retry Payment Verification"}
          </button>
        )}

        {/* Continue shopping */}
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