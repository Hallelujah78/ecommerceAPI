const mongoose = require("mongoose");
const Product = require("./Product");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "please enter a value for rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      required: [true, "please provide a title"],
      maxlength: 40,
    },

    comment: { type: String, required: [true, "please provide review text"] },
    user: {
      type: mongoose.Types.ObjectId,
      required: [true, "please provide a user"],
      ref: "User",
    },
    product: {
      type: mongoose.Types.ObjectId,
      required: [true, "reviews must be associated with a product"],
      ref: "Product",
    },
  },
  { timestamps: true }
);
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    // match
    { $match: { product: productId } },
    // grouping
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
