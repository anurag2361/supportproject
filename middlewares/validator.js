exports.signup = function (req, res, next) {  //used to validate data recieved by signup form
    console.log("Accessing signup");
    if (!req.body.name || !req.body.email || !req.body.mobile || !req.body.password) {
        res.status(400).end("Enter all details");
    } else {
        console.log("Signup done");
        next();
    }
}

exports.login = function (req, res, next) {  //used to validate data recieved by login form
    console.log("Accessing login");
    if (!req.body.email || !req.body.password) {
        res.status(400).end("Enter correct email and pasword");
    } else {
        next();
    }
}