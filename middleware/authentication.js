const CustomError = require("../errors");
const { verifyToken } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("authentication invalid");
  }
  try {
    const { name, userId, role } = verifyToken({ token });
    req.user = {
      name,
      userId,
      role,
    };
  } catch (error) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }
  next();
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "forbidden - unauthorized to access this resource"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
