var mongoose = require('mongoose'); //to interact with MongoDB
var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //lets us create middlewares to parse various data and requests through req.body
var xoauth2 = require('xoauth2'); //used to generate XOAUTH2 login tokens from user and client credentials
var shortid = require('shortid'); //generates non-sequential,short unique ids. In this case to generate ticket number
var nodemailer = require('nodemailer'); //used to send emails in nodejs
var events = require('events'); //event handling in nodejs
var eventEmitter = new events.EventEmitter(); //used to create event instances used for various tasks
var jsonwebtoken = require('jsonwebtoken'); //used to provide a JWT to a user for secure authentication
var ticketRouter = express.Router(); //https://expressjs.com/en/guide/routing.html

var User = mongoose.model('User'); //including user model
var Ticket = mongoose.model('Ticket'); //including ticket model

var responseGenerator = require('./../response/responseGenerator'); //generate a properly managed response
var decodedToken; //variable to store decoded jwt

var auth = function (req, res, next) {   //used to check whether the header, body or query parameters contain token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jsonwebtoken.verify(token, "98ix0b84gs3r@&$#*np9bgkpfjeib1f9ipe", function (err, decoded) {  //jsonwebtoken.verify(token, secretOrPublicKey, [options, callback]).secretOrPublicKey is a string or buffer containing either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
            if (err) {
                return res.json({ success: false, message: 'Token authentication failed' });
            } else {
                decodedToken = decoded; //if token authentication passes, decoded token is stored here.
                next();
            }
        });
    } else {
        return res.status(403).send({ success: false, message: 'Token not provided' });
    }
}

eventEmitter.on('sendMail', function (data) {  //https://nodemailer.com/about/    sendMail is an event
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: "samplenodeapp49@gmail.com", pass: "sample125" }
    });

    var mailOptions = {
        from: 'Support App<support@supportapp.com>',
        to: data.email,
        subject: 'Support App Alert',
        text: 'Answer recieved for ticket:' + data.ticketNo,
        html: '<h1>Hey ' + data.name + '</h1><br><h2>Someone posted an answer for your query (Ticket: ' + data.ticketNo + ')' + '</h2>'
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Sent Mail: " + info.response);
        }
    });
});

eventEmitter.on('StatusChange', function (data) {  //StatusChange is an event
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: "samplenodeapp49@gmail.com", pass: "sample125" }
    });

    var mailOptions = {
        from: 'Support App<support@supportapp.com>',
        to: data.email,
        subject: 'Support App alert',
        text: 'Status for your ticket number ' + data.ticketNo + "changed to: " + data.status,
        html: "<h1>Hey " + data.name + "</h1><br><h2>Status for your ticket number " + data.ticketNo + " changed to <b>" + data.status + "</b></h2>"
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(data);
            console.log("Sent Mail: " + info.response);
        }
    });
});

//All routes here correspond with queryService file in public folder

ticketRouter.get('/all', auth, function (req, res) { //A route to fetch all tickets. For testing purposes.
    console.log("Getting all tickets");
    Ticket.find(function (error, result) {
        if (error) {
            var err = responseGenerator.generate(true, "Something is wrong. Error: " + error, 500, null);
            res.send(err);
        } else if (result === null || result === undefined || result === [] || result === '') {
            var err = responseGenerator.generate(true, "No results", 204, null);
            res.send(err);
        } else {
            var response = responseGenerator.generate(false, "All queries fetched.", 200, result);
            res.send(result);
        }
    });
});

ticketRouter.post('/ticket/:tNumber/statusChange', auth, function (req, res) {    //Route where a ticket's status(open|close) can be changed. auth is also a parameter as this route requires authentication.
    Ticket.findOne({ "ticketNo": req.params.tNumber }, function (error, result) {
        if (error) {
            var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
            res.send(err);
        } else if (result.tickets === null || result === undefined || result === []) {
            var err = responseGenerator.generate(true, "No tickets found", 204, null);
            res.send(err);
        } else {              //if ticket is recieved
            var email = result.email;
            var name = result.name;  //ticket'ss info is stored
            var tNumber = req.params.tNumber;
            var status = result.ticketStatus;

            if (status === "Open") {   //changing ticket status
                result.ticketStatus = "Close";
                eventEmitter.emit('StatusChange', {  //changing status is an event. This is used above in nodemailer.
                    status: "Closed",
                    tNumber: tNumber,
                    email: email,
                    name: name
                });
            } else {
                result.ticketStatus = "Open";
                eventEmitter.emit('StatusChange', {
                    status: "Reopened",
                    tNumber: tNumber,
                    email: email,
                    name: name
                });
            }

            result.save(function (error) {  //saving current ticket status.
                if (error) {
                    res.send(error);
                } else {
                    var response = responseGenerator.generate(false, "Ticket status changed to: " + result.ticketStatus, 200, result);
                    res.send(response);
                }
            });
        }
    });
});

ticketRouter.get('/ticket/:tNumber', auth, function (req, res) {   //Route to find a particular ticket
    Ticket.findOne({ "ticketNo": req.params.tNumber }, function (error, result) {
        if (error) {
            var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
            res.send(err);
        } else if (result === null || result === undefined || result === []) {
            var err = responseGenerator.generate(true, "No results", 204, null);
            res.send(err);
        } else {
            var response = responseGenerator.generate(false, "Query accessed successfully", 200, result);
            res.send(response);
        }
    });
});

ticketRouter.post('/ticket/:tNumber/query', auth, function (req, res) {  //this routes generates a new chat message or a reply to your query.
    Ticket.findOne({ "ticketNo": req.params.tNumber }, function (error, result) {
        if (error) {
            var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
            res.send(err);
        } else if (result === null || result === undefined || result === []) {
            var err = responseGenerator.generate(true, "No results.", 204, null);
            res.send(err);
        } else {
            var newChat = req.body.newchatQuery; //used to store reply
            var newMessage = { sender: decodedToken.name, newchatQuery: newChat } //full message with name and reply

            result.message.push(newMessage); //push or add your message
            result.save(function (error) {
                if (error) {
                    res.send(error);
                } else { //sending an email of the message
                    var name = decodedToken.name;
                    var email = decodedToken.email;
                    var data = result.ticketNo;
                    eventEmitter.emit('sendMail', {
                        ticketNo: data,
                        name: name,
                        email: email
                    });
                    var response = responseGenerator.generate(false, "Chat message created", 200, result);
                    res.send(response);
                }
            });
        }
    });
});

ticketRouter.post('/ticket/:tNumber/query/edit', auth, function (req, res) { //This route is used to edit queries

    Ticket.findOne({ "ticketNo": req.params.tNumber }, function (error, result) {
        if (err) {
            var err = responseGenerator.generate(true, "There was a problem : " + error, 500, null);
            res.send(err);
        } else if (result === null || result === undefined || result === []) {
            var err = responseGenerator.generate(true, "No results", 204, null);
            res.send(err);
        } else {

            result.queryTitle = req.body.queryTitle; //storing tite of query
            result.queryDetail = req.body.queryDetail; //storing text of query.

            result.save(function (error) {
                if (error) {
                    res.send(error)
                } else {
                    var response = responseGenerator.generate(false, "Query edited", 200, result);
                    console.log(response)
                    res.send(response);
                }
            });
        }
    });

});

ticketRouter.post('/ticket/admin/:tNumber', auth, function (req, res) { //at this route, admin can post reply messages
    Ticket.findOne({ "ticketNo": req.params.tNumber }, function (error, result) {
        if (error) {
            var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
            res.send(err);
        } else if (result === null || result === undefined || result === []) {
            var err = responseGenerator.generate(true, "No results", 204, null);
            res.send(err);
        } else {
            var newChat = req.body.newchatQuery; //reply text
            var newMessage = { sender: "Admin", newchatQuery: newChat } //full reply text with message

            result.message.push(newMessage); //add message
            result.save(function (error) { //save message
                if (error) {
                    res.send(error);
                } else {
                    var name = result.name;
                    var email = result.email;
                    var data = result.ticketNo;
                    eventEmitter.emit('sendMail', { //sending a mail through sendMail event
                        ticketNo: data,
                        name: name,
                        email: email
                    });
                    var response = responseGenerator.generate(false, "Admin sent a message", 200, result);
                    res.send(response);
                }
            });
        }
    });
});

ticketRouter.post('/ticket/:tNumber/delete', auth, function (req, res) {  //delete a query
    Ticket.findOne({ "ticketNo": req.params.tNumber }, function (error, result) {
        if (error) {
            var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
            res.send(err);
        } else if (result === null || result === undefined || result === []) {
            var err = responseGenerator.generate(true, "No results", 204, null);
            res.send(err);
        } else {
            result.remove();
            result.save(function (error) {
                if (error) {
                    res.send(error);
                } else {
                    var response = responseGenerator.generate(false, "Ticket deleted successfully", 200, result);
                    console.log(response);
                    res.send(response);
                }
            });
        }
    });
});

ticketRouter.get('/current', auth, function (req, res) { //this route fetches user details by id
    res.send(decodedToken);
});

ticketRouter.get('/user/details', auth, function (req, res) { //this route gets user details
    User.find(function (error, allUsers) {
        if (error) {
            var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
            res.send(err);
        } else if (allUsers === null || allUsers === undefined) {
            var err = responseGenerator.generate(true, "No users found", 500, null);
            res.send(err);
        } else {
            var response = responseGenerator.generate(false, "All users found", 200, allUsers);
            res.send(response);
        }
    });
});

ticketRouter.get('/allTickets/:userId', auth, function (req, res) { //This is a route to fetch all queries by a particular user
    var userId = req.params.userId;
    console.log("User ID= " + userId);
    Ticket.find({ 'userId': userId }, function (error, result) {
        if (err) {
            var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
            res.send(err);
        } else if (result.length === 0) {
            var err = responseGenerator.generate(true, "User doesn't have any queries", 204, null);
            res.send(err);
        } else {
            var response = responseGenerator.generate(false, "All queries fetched", 200, result);
            res.send(response);
        }
    });
});

ticketRouter.post('/query', auth, function (req, res) {  //this route is used when we submit query data through ui form
    var userID = decodedToken.id; //store id of decoded token
    Ticket.findOne({ 'userId': userID }, function (error, ticket) {
        if (error) {
            var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
            res.send(err);
        } else {  //input and read data
            var newTicket = new Ticket({
                userId: decodedToken.id,
                name: decodedToken.name,
                email: decodedToken.email,
                mobile: decodedToken.mobile,
                ticketNo: shortid.generate(), //generate a short ticket number
                queryTitle: req.body.queryTitle,
                queryDetail: req.body.queryDetail
            });

            newTicket.save(function (error) {
                if (error) {
                    var err = responseGenerator.generate(true, "There was a problem: " + error, 500, null);
                    res.send(err);
                } else {
                    var response = responseGenerator.generate(false, "Ticket fetched", 200, newTicket.ticketNo);
                    res.send(response);
                }
            });
        }
    });
});

module.exports = ticketRouter;