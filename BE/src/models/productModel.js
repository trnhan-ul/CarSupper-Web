const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: [{ type: String }],
    variants: [
      {
        color: { type: String, required: true },
        transmission: { type: String, required: true },
        engine: { type: String, required: true },
        stock: { type: Number, required: true, min: 0, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

productSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(
      new Error("Product name already exists. Please choose a different name!")
    );
  } else {
    next(error);
  }
});

module.exports = mongoose.model("Product", productSchema);
