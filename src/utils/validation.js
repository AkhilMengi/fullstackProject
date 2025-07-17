
const validator = require("validator")
const signUpValidator = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        const err = new Error("Name is not valid");
        err.type = "validation";
        throw err;
    } else if (!validator.isEmail(emailId)) {
        const err = new Error("Email is not valid");
        err.type = "validation";
        throw err;
    } else if (!validator.isStrongPassword(password)) {
        const err = new Error("Please enter a strong password");
        err.type = "validation";
        throw err;
    }

};

const validateStrongPassword = (password) => {
  if (!validator.isStrongPassword(password)) {
    const err = new Error("Please enter a strong password.");
    err.type = "validation";
    throw err;
  }
};


const profileUpdateValidator = (updates) => {
    const ALLOWED_UPDATES = ["skills", "about", "lastName","gender"];

    if (!updates || Object.keys(updates).length === 0) {
        throw new Error("No updates provided");
    }

    const isUpdateAllowed = Object.keys(updates).every(k =>
        ALLOWED_UPDATES.includes(k)
    );

    if (!isUpdateAllowed) {
        throw new Error("Update not allowed");
    }

    if (updates.skills) {
        if (!Array.isArray(updates.skills)) {
            throw new Error("Skills must be an array.");
        }
        if (updates.skills.length > 10) {
            throw new Error("You can have at most 10 skills.");
        }
    }
};

module.exports={
    signUpValidator,
    profileUpdateValidator,
    validateStrongPassword
}