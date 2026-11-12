
# PayCart - E-Commerce Checkout with Razorpay

PayCart is a full-stack e-commerce checkout application built using React, Tailwind CSS, Node.js, Express.js, and MongoDB. It integrates Razorpay to provide a secure online payment experience with backend payment verification and webhook handling.

## Live Demo

- [Client](https://paycart-cvqi.vercel.app/)
- [Server Health Check](https://paycart-alpha.vercel.app/api/health)

## Features

### Frontend
- Responsive e-commerce product listing.
- Product browsing and product details.
- Add products to cart.
- Increase and decrease product quantities.
- Automatic cart total calculation.
- Customer checkout form.
- Razorpay payment integration.
- Payment success and failure handling.
- Payment verification status.
- Order confirmation page with Payment ID.

### Backend
- RESTful APIs using Node.js and Express.js.
- MongoDB database integration.
- Product and Order management.
- Secure Razorpay order creation.
- Server-side Razorpay payment signature verification.
- Payment status management.
- Razorpay webhook endpoint.
- Webhook signature validation.
- Duplicate webhook event handling.

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | React.js |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP Client | Axios |
| Backend | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Payment Gateway | Razorpay |
| Deployment | Vercel |
| Version Control | Git & GitHub |

## Application Architecture

```text
PayCart/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── server.js
│
└── README.md
```

*Note: The directory structure above is illustrative. Adjust it to match the actual repository structure.*

## Payment Workflow

1. The customer adds products to the shopping cart.
2. The customer proceeds to checkout and enters their details.
3. The frontend sends an order creation request to the backend.
4. The backend validates the order and stores it in MongoDB with Pending payment status.
5. The backend creates a Razorpay order using server-side credentials.
6. Razorpay Checkout opens on the frontend.
7. The customer completes the payment.
8. Razorpay returns the payment ID, order ID, and signature.
9. The frontend sends these details to the backend for verification.
10. The backend verifies the payment signature using the Razorpay secret.
11. The order payment status is updated to Paid after successful verification.
12. Razorpay webhooks provide additional server-to-server payment event notifications.

## Database Models

### Product
Stores product information, including:
- Name
- Slug
- Description
- Price
- Category
- Images
- Stock
- Active status

### Order
Stores customer and transaction information, including:
- Customer details
- Ordered products
- Total amount
- Currency
- Payment status
- Razorpay Order ID
- Razorpay Payment ID
- Payment signature
- Payment timestamp

Payment statuses:
- Pending
- Paid
- Failed

## Environment Variables

Create `.env` files in the appropriate frontend and backend directories.

### Backend (.env)

```env
PORT=4000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

CLIENT_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Never commit actual API keys, database credentials, or webhook secrets to GitHub.

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd PayCart
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the server directory and configure MongoDB and Razorpay credentials.

### 4. Start the backend

```bash
npm run dev
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Configure frontend environment variables

Create the frontend `.env` file and configure the API URL and Razorpay Key ID.

### 7. Start the frontend

```bash
npm run dev
```

The application should now be available at:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:4000
```

## API Endpoints

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create an order |
| POST | `/api/orders/:orderId/razorpay` | Create Razorpay order |
| POST | `/api/orders/:orderId/verify-payment` | Verify payment |

### Webhooks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/webhooks/razorpay` | Handle Razorpay webhook events |

## Security Implementation

- Razorpay secret credentials are maintained on the backend.
- Payment signatures are verified server-side.
- Webhook requests are validated using HMAC SHA-256 signatures.
- Raw request bodies are used for webhook signature verification.
- Payment amounts and currencies are validated against stored orders.
- Duplicate webhook event IDs are detected.
- Payment status updates are handled on the backend.

## Screenshots

Add your application screenshots below.

### Home Page
![Home Page](screenshots/home.png)

### Shopping Cart
![Shopping Cart](screenshots/cart.png)

### Checkout Page
![Checkout Page](screenshots/checkout.png)

### Payment Success
![Payment Success](screenshots/payment-success.png)

### Order Confirmation
![Order Confirmation](screenshots/order-confirmation.png)

## Testing

The application was tested for the following workflows:

- Product listing and retrieval.
- Cart quantity updates.
- Cart total calculation.
- Order creation.
- Razorpay order initialization.
- Successful payment processing.
- Backend payment signature verification.
- Payment failure handling.
- Payment status updates.
- Webhook signature validation.
- Duplicate webhook event handling.

## Future Improvements

- User authentication and authorization.
- Order history and tracking.
- Admin product management.
- Inventory management.
- Refund management.
- Automated payment integration tests.

## Author

**Your Name**

GitHub: [Your GitHub Profile](YOUR_GITHUB_PROFILE_URL)

---

**PayCart** - A full-stack e-commerce checkout application with secure Razorpay payment integration.
