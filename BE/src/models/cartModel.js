const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variants: [
          {
            color: { type: String, required: true },
            transmission: { type: String, required: true },
            engine: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1, default: 1 },
          },
        ],
      },
    ],
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
