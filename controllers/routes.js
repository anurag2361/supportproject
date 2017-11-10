var express = require('express');
var Router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ticket = mongoose.model('Ticket');
var responseGenerator = require('./../response/responseGenerator');
var validator = require('./../middlewares/validator');
var jsonwebtoken = require('jsonwebtoken');

var token;
var jwtsecret = "98ix0b84gs3r@&$#*np9bgkpfjeib1f9ipe";  //used in jsonwebtoken package

//Routes here correspond to queryService file in public folder

Router.post('/login', validator.login, function (req, res) {  //login route
    User.findOne({ email: req.body.email }, function (error, user) {
        if (error) {
            var err = responseGenerator.generate(true, "Some error occured: " + error, 500, null);
            res.json(err);
        } else if (user === null || user === undefined || user.name === null || user.name === undefined) {
            var response = responseGenerator.generate(true, "No user found", 400, null);
            res.json(response);
        } else if (!user.compareHash(req.body.password)) {
            var response = responseGenerator.generate(true, "Wrong password", 401, null);
            res.json(response);
        } else { //when all conditions suffice, user will be assigned a token
            token = jsonwebtoken.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                id: user._id,
                email: user.email,
                name: user.name,
                mobile: user.mobile
            }, jwtsecret);

            var response = responseGenerator.generate(false, "Logged In", 200, user);
            response.token = token;
            res.json(response);
        }
    });
});

Router.post('/signup', validator.signup, function (req, res) {  //signup route
    User.findOne({ email: req.body.email }, function (error, user) {
        if (error) {
            var err = responseGenerator.generate(true, "Some error occured: " + error, 500, null);
            res.json(err);
        } else if (user) {
            var err = responseGenerator.generate(true, "Email already exists", 400, null);
            res.json(err);
        } else {
            var newUser = new User({   //creating a user
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile
            });

            newUser.password = newUser.generateHash(req.body.password);  //generating a hashed password for security
            newUser.save(function (error) {
                if (error) {
                    var response = responseGenerator.generate(true, "Some error occured:" + error, 500, null);
                    res.json(response);
                } else {
                    token = jsonwebtoken.sign({
                        exp: Math.floor(Date.now() / 1000) + (60 * 60),
                        id: newUser._id,
                        email: newUser.email,
                        name: newUser.name,
                        mobile: newUser.mobile
                    }, jwtsecret);

                    var response = responseGenerator.generate(false, "Signup successful", 200, newUser);
                    response.token = token;
                    res.json(response);
                }
            });
        }
    });
});
module.exports = Router;