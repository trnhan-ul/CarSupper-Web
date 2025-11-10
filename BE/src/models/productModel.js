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
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
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

// Create text index for search
productSchema.index({ name: "text", description: "text" });

// Create indexes for filtering and sorting
productSchema.index({ price: 1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Product", productSchema);
