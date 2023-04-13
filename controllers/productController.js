const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productID } = req.params;
  const product = await Product.findOne({ _id: productID }).populate("reviews");
  if (!product) {
    throw new CustomError.NotFoundError(
      `product with ID ${productID} does not exist`
    );
  }
  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id: productID } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productID }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError(
      `product with ID ${productID} not found`
    );
  }
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const { id: productID } = req.params;

  const product = await Product.findOne({ _id: productID });
  if (!product) {
    throw new CustomError.NotFoundError(`no product with id: ${productID}`);
  }
  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "product deleted" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("file not uploaded");
  }
  const image = req.files.image;
  if (!image.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("uploaded file is not an image");
  }
  if (image.size > 51200) {
    throw new CustomError.BadRequestError("file size must be less than 5MB");
  }
  const imagePath = path.join(__dirname, `../public/images/` + `${image.name}`);
  await image.mv(imagePath);

  res.status(StatusCodes.OK).json({ image: { src: `images/${image.name}` } });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
