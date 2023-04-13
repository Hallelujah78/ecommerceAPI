const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Product = require("../models/Product");
const checkPermissions = require("../utils/checkPermissions");
// createOrder, getAllOrders, getSingleOrder, updateOrder, deleteOrder

// fake stripe api call
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  console.log(req.user);
  // check tax and shipping
  const { tax, shippingFee, items: cartItems } = req.body;
  // check cart not empty
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("please provide cart items");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "please provide values for tax, and shipping"
    );
  }
  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `product with ID ${item.product} does not exist`
      );
    }
    const { name, price, image, _id } = dbProduct;
    // here we are creating the SingleCartItem(schema)
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    orderItems = [...orderItems, singleOrderItem];
    // calculate subtotal
    subtotal += price * item.amount;
  }
  // calc total
  total = subtotal + shippingFee + tax;
  // get client secret mockup
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });
  // create the order
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`order with ID ${orderId} not found`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) {
    throw new CustomError.BadRequestError("payment intent ID is required");
  }
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`no order with ID ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  order.paymentIntent = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  getCurrentUserOrders,
};
