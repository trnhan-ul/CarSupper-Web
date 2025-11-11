const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const cartRoutes = require("./cartRoutes");
const orderRoutes = require("./orderRoutes");
const statisticsRoutes = require("./statisticsRoutes");
const wishlistRoutes = require("./wishlistRoutes");

const route = (app) => {
  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);
  app.use("/products", productRoutes);
  app.use("/categories", categoryRoutes);
  app.use("/carts", cartRoutes);
  app.use("/orders", orderRoutes);
  app.use("/statistics", statisticsRoutes);
  app.use("/wishlist", wishlistRoutes);
};

module.exports = route;
