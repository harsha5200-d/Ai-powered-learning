const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  const resp = { success: true, message };
  if (data !== null) {
    resp.data = data;
  }
  return res.status(statusCode).json(resp);
};

const errorResponse = (res, message = "An error occurred", statusCode = 400, errors = null) => {
  const resp = { success: false, message };
  if (errors) {
    resp.errors = errors;
  }
  return res.status(statusCode).json(resp);
};

const validateEmail = (email) => {
  const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return pattern.test(email);
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, msg: "Password must be at least 8 characters long." };
  }
  return { valid: true, msg: "" };
};

module.exports = {
  successResponse,
  errorResponse,
  validateEmail,
  validatePassword
};
