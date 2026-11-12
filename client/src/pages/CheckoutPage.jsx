import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

function CheckoutPage() {
  const { cartItems, totalItems, subtotalPaise } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!/^\d{6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = "Enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Backend order creation will be connected in Stage 6B.
    console.log("Checkout form data:", formData);
    console.log("Cart items:", cartItems);
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="mb-3 text-2xl font-bold">Your cart is empty</h1>

        <Link to="/" className="text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const inputClass = (field) =>
    `mt-1 w-full rounded-lg border px-3 py-3 outline-none focus:border-black ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const renderError = (field) =>
    errors[field] && (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Customer Information */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border p-6">
            <h2 className="mb-5 text-xl font-semibold">Customer Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass("fullName")}
                  placeholder="Enter your full name"
                />
                {renderError("fullName")}
              </div>

              <div>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass("email")}
                  placeholder="example@gmail.com"
                />
                {renderError("email")}
              </div>

              <div>
                <label htmlFor="phone">Mobile Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass("phone")}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                {renderError("phone")}
              </div>
            </div>
          </section>

          {/* Delivery Address */}
          <section className="rounded-xl border p-6">
            <h2 className="mb-5 text-xl font-semibold">Delivery Address</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="addressLine1">
                  House / Flat / Street Address
                </label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={inputClass("addressLine1")}
                  placeholder="Flat number, building, street"
                />
                {renderError("addressLine1")}
              </div>

              <div>
                <label htmlFor="addressLine2">Landmark (Optional)</label>
                <input
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className={inputClass("addressLine2")}
                  placeholder="Nearby landmark"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass("city")}
                    placeholder="Bengaluru"
                  />
                  {renderError("city")}
                </div>

                <div>
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputClass("state")}
                    placeholder="Karnataka"
                  />
                  {renderError("state")}
                </div>
              </div>

              <div>
                <label htmlFor="postalCode">PIN Code</label>
                <input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={inputClass("postalCode")}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                />
                {renderError("postalCode")}
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-gray-800"
          >
            Place Order
          </button>
        </form>

        {/* Order Summary */}
        <aside className="h-fit rounded-xl border p-6">
          <h2 className="mb-5 text-xl font-semibold">Order Summary</h2>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500">Quantity: {item.quantity}</p>
                </div>

                <p className="font-medium">
                  {formatCurrency(item.pricePaise * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="my-5 border-t" />

          <div className="flex justify-between py-2">
            <span className="text-gray-600">Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(subtotalPaise)}</span>
          </div>

          <div className="my-4 border-t" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(subtotalPaise)}</span>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Final payable amount will be calculated and verified securely by our
            server.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;