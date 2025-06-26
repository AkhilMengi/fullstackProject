const adminAuth = (req, res, next) => {
    const token ="xyz"
    const isAuthorized = token === "xyz";

    if (!isAuthorized) {
        res.status(401).send("Unauthorized User"); // use `.send()` or `.json()`, not `.message()`
    } else {
        next();
    }
};

const userAuth = (req, res, next) => {
    const token ="xyz"
    const isAuthorized = token === "xyz";

    if (!isAuthorized) {
        res.status(401).send("Unauthorized User"); 
    } else {
        next();
    }
};

module.exports = {
    adminAuth,
    userAuth
};
