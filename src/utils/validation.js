
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

module.exports={
    signUpValidator
}