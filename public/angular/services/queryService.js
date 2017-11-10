//routes in this file correspond to routes.js and ticket.js in server part. Use these routes for testing purposes.

myApp.factory('queryService', function queryFactory($http, authenticationService, $q) { //factory service for signup, login and queries
    var queryArray = {};
    var baseUrl = "http://localhost:3000";

    queryArray.logIn = 1;
    queryArray.signup = 1;

    queryArray.signUp = function (userData) {
        return $http.post(baseUrl + '/users/signup', userData); //route to signup with user data defined in routes.js
    }

    queryArray.login = function (loginData) {
        return $http.post(baseUrl + '/users/login', loginData); //route to login
    }

    queryArray.getUser = function () {  //used to recieve the user currently logged in
        if (authenticationService.getToken()) {  //if token was recieved from browser's storage
            return $http.get(baseUrl + '/tickets/current?token=' + authenticationService.getToken(), null);
        } else {
            return $q.reject({ data: "User is not authorised" });
        }
    }

    queryArray.allQueries = function () { //used to fetch all queries for admin user
        return $http.get(baseUrl + '/tickets/all?token=' + authenticationService.getToken(), null);
    }

    queryArray.openClose = function (tNumber) { //used to change the status of a query from open to close or vice versa
        return $http.post(baseUrl + '/tickets/Ticket/' + tNumber + '/statusChange?token=' + authenticationService.getToken(), null);
    }

    queryArray.singleQuery = function (tNumber) { //open a single query by its ticket number
        return $http.get(baseUrl + '/tickets/ticket/' + tNumber + '?token=' + authenticationService.getToken(), null);
    }

    queryArray.newchatMsg = function (tNumber, msgData) { //used to reply to a query
        return $http.post(baseUrl + '/tickets/ticket/' + tNumber + '/query?token=' + authenticationService.getToken(), msgData);
    }

    queryArray.newAnswer = function (tNumber, msgData) { //used to add an answer to a query
        return $http.post(baseUrl + '/tickets/Ticket/Admin/' + tNumber + '?token=' + authenticationService.getToken(), msgData);
    }

    queryArray.editQuery = function (tNumber, queryData) {  //used to edit a query by its ticket number
        return $http.put(baseUrl + '/tickets/ticket/' + tNumber + '/query/edit?token=' + authenticationService.getToken(), queryData);
    }

    queryArray.deleteQuery = function (tNumber) {  //used to delete a query by its ticket number
        return $http.post(baseUrl + '/tickets/ticket/' + tNumber + '/delete?token=' + authenticationService.getToken(), null);
    }

    queryArray.allUsers = function () {  //used to get all user info
        return $http.get(baseUrl + '/tickets/user/details?token=' + authenticationService.getToken(), null);
    }

    queryArray.newQuery = function (id, queryData) {  //create a new query by query data
        return $http.post(baseUrl + '/tickets/query?token=' + authenticationService.getToken(), queryData);
    }

    queryArray.alluserQueries = function (id) {  //used to fetch all queries of a particular user(used in filter searchbox)
        return $http.get(baseUrl + '/tickets/allTickets/' + id + '?token=' + authenticationService.getToken(), null);
    }

    return queryArray;
});