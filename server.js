var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var methodOverride = require('method-override'); //importing express modules
var path = require('path');
var fs = require('fs');
var cors = require('cors');
var logger = require('morgan');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());//used to parse cookies

app.use(express.static(path.resolve(__dirname, './public')));

var userModel = require('./models/User');//importing user model
var ticketModel = require('./models/Ticket');//importing ticket model

var routeController = require('./controllers/routes');//importing route controller
app.use('/users', routeController); //assigning a route to routeController

var ticketController = require('./controllers/tickets');//importing ticket controller
app.use('/tickets', ticketController);//assigning a route to ticketcontroller

var port = process.env.PORT || 3000;

app.use(logger('dev'));

var database = require('./config/database');
mongoose.connect(database.url);
mongoose.connection.once('open', function () {
    console.log('Succesfully connected to database');
});

app.use(function (req, res, next) {
    res.status(404); //handling 404 error
    if (req.accepts('json')) {
        res.send({
            error: 'Not Found'
        });
        return;
    }
    res.send('Not Found');
});

app.listen(port, function () {
    console.log("app running on port:" + port);
});