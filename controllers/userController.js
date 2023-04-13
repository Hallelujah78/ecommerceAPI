const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  if (!users) {
    throw new CustomError.NotFoundError(
      "there are no users with this role in the system"
    );
  }
  res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;

  const user = await User.findOne({ _id: userId }, "-password");
  if (!user) {
    throw new CustomError.NotFoundError("no such user exists");
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json(req.user);
};
// update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError(
//       "please provide valid name and email values"
//     );
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res
//     .status(StatusCodes.OK)
//     .json({ msg: "user information successfullly updated" });
// };

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findOne({ _id: req.user.userId });
  if (!email || !name) {
    throw new CustomError.BadRequestError(
      "please provide a valid email and name"
    );
  }
  user.email = email;
  user.name = name;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "user successfully updated" });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "please provide a new and old password"
    );
  }
  const user = await User.findById({ _id: req.user.userId });
  // we don't check if user exists because if we pass authentication, then we know there is a user with a valid ID
  const isOldPasswordMatch = await user.comparePassword(oldPassword);

  if (!isOldPasswordMatch) {
    throw new CustomError.UnauthenticatedError("invalid authentication");
  }
  user.password = newPassword;
  await user.save(); // triggers Schema pre and post save hooks

  res.status(StatusCodes.OK).json({ msg: "password updated successfully" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
