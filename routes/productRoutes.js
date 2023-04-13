const {
  createProduct, // post
  getAllProducts, // get
  getSingleProduct, // get
  updateProduct, // patch
  deleteProduct, // delete
  uploadImage, //patch
} = require("../controllers/productController");
const { getSingleProductReviews } = require("../controllers/reviewController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const express = require("express");
const router = express.Router();

router.route("/").get(getAllProducts);
router
  .route("/")
  .post(
    authenticateUser,
    authorizePermissions("admin", "owner"),
    createProduct
  );
router
  .route("/uploadImage")
  .post([authenticateUser, authorizePermissions("admin")], uploadImage);
router
  .route("/:id")
  .get(getSingleProduct)
  .patch(authenticateUser, authorizePermissions("admin"), updateProduct)
  .delete(authenticateUser, authorizePermissions("admin"), deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
