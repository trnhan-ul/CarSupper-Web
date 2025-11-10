const express = require("express");
const router = express.Router();
const { uploadProductImages } = require("../middleware/uploadMiddleware");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStatusProduct,
  advancedSearch,
  getTrendingProducts,
  getPopularProducts,
  getLatestProducts,
} = require("../controllers/productController");
const {
  verifyToken,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// Advanced search and filter routes (phải đặt trước routes với :id)
router.get("/search/advanced", advancedSearch);
router.get("/search/trending", getTrendingProducts);
router.get("/search/popular", getPopularProducts);
router.get("/search/latest", getLatestProducts);

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
