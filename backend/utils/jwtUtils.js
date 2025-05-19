const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const generateEmailVerificationToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: "1d" }
  );
};

module.exports = {
  generateToken,
  generateEmailVerificationToken,
};
