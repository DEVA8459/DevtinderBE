const validator = require("validator");
const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not valid");
  }
};

const validateProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "about",
    "gender",
    "photoUrl",
    "age",
    "contact",
    "city",
    "country",
    "skills",
    "hobby",
    "education",
    "movies",
  ];

  const isEditAllowed = Object.keys(req.body).every((fields) =>
    allowedEditFields.includes(fields)
  );

  return isEditAllowed
};

module.exports = {
  validateSignupData,validateProfileData
};
