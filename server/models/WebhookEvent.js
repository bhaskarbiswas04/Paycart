
import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },

    eventType: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Received", "Processed", "Ignored", "Failed"],
      default: "Received",
    },

    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const WebhookEvent = mongoose.model(
  "WebhookEvent",
  webhookEventSchema
);

export default WebhookEvent;