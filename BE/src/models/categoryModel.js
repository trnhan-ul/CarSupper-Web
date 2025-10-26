const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    gender: [
      {
        type: String,
        enum: ["Men", "Women"],
        validate: {
          validator: function (value) {
            return value.length > 0;
          },
          message: "At least one gender must be selected.",
        },
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

categorySchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(
      new Error("Category name already exists. Please choose a different name!")
    );
  } else {
    next(error);
  }
});

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
