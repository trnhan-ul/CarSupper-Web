const express = require("express");
const router = express.Router();
const { uploadProductImages } = require("../middleware/uploadMiddleware");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStatusProduct,
} = require("../controllers/productController");
const {
  verifyToken,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// Basic routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  verifyToken,
  adminMiddleware,
  uploadProductImages.array("images", 5),
  createProduct
);

router.put("/:id/status", verifyToken, adminMiddleware, updateStatusProduct);
router.put(
  "/:id",
  verifyToken,
  adminMiddleware,
  uploadProductImages.array("images", 5),
  updateProduct
);

router.use((error, req, res, next) => {
  if (error instanceof Error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next();
});

module.exports = router;
