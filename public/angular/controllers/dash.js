myApp.controller('dashController', ['$filter', '$http', '$location', '$routeParams', 'queryService', 'authenticationService', function ($filter, $http, $location, $routeParams, queryService, authenticationService) {
    this.logged = function () { //check if logged in. if not,redirect to main page
        if (queryService.logIn == 1) {
            return 1;
        } else {
            $location.path('/');
        }
    }

    this.getName = function () {  //used to fetch the name os user currently logged in
        queryService.getUser()
            .then(function successCallback(response) {
                main.user = response.data.name;
                queryService.logIn = 1;
            });
    }

    var main = this;
    this.userId = $routeParams.userId;

    this.show = false; //to show/hide parts of query cards

    this.getUser = function () {
        queryService.getUser()  //fetch current userto check if he is admin
            .then(function successCallback(response) {
                main.user = response.data.name;
                if (main.user) {
                    queryService.allQueries() //open all queries for admin
                        .then(function successCallback(response) {
                            if (response.data.error === true) {
                                main.noMsg = response.data.message;
                                main.noDiv = 1;
                            } else {
                                main.adminQuery = response.data;
                                main.getQueries(); //defined below
                            }
                        });
                }
            });
    }

    this.getUser();

    this.getQueries = function () {  //used to get all queries of user logged in. Also check if he's an admin
        if (main.user === "Admin") {
            main.heading = "List Of All The Queries";
            main.allQueries = main.adminQuery;
            main.queries = main.adminQuery;
        } else { //if normal user
            main.heading = "Dashboard";
            queryService.alluserQueries(main.userId)
                .then(function successCallback(response) {
                    var data = response.data.data;
                    if (response.data.error) {
                        main.allQueries = [];
                        main.queries = [];
                    } else {
                        main.allQueries = response.data.data;
                        main.queries = response.data.data;
                    }
                }, function errorCallback(response) {
                    alert("Error");
                });
        }
    }

    this.open = function () {  //used to filter out open tickets
        main.queries = $filter('filter')(main.allQueries, {
            ticketStatus: "Open"
        });
    }

    this.close = function () {  //used to filter out closed ticket
        main.queries = $filter('filter')(main.allQueries, {
            ticketStatus: "Close"
        });
    }

    this.all = function () {  //show all queries
        main.queries = main.allQueries;
    }

    this.alluserQueries = function () {  //filter all open queries for admin
        queryService.allQueries()
            .then(function successCallback(response) {
                if (response.data.error === true) {
                    main.noMsg = response.data.message;
                    main.noDiv = 1;
                } else {
                    main.queries = $filter('filter')(response.data, {
                        ticketStatus: "Open"
                    });
                }
            });
    }

    this.alluserClosedQueries = function () {  //filter all closed queries for admin
        queryService.allQueries()
            .then(function successCallback(response) {
                if (response.data.error === true) {
                    main.noMsg = response.data.message;
                    main.noDiv = 1;
                } else {
                    main.queries = $filter('filter')(response.data, {
                        ticketStatus: "Close"
                    });
                }
            });
    }

    this.deleteQuery = function (tNumber, index) {  //delete a query
        queryService.deleteQuery(tNumber)
            .then(function successCallback(response) {
                main.queries.splice(index, 1);
            }, function errorCallback(response) {
                alert("Error");
            });
    }

    this.openClose = function (tNumber) {  //used to open/close a query
        queryService.openClose(tNumber)
            .then(function successCallback(response) {
                main.getQueries();
            }, function errorCallback(response) {
                alert("Error");
            });
    }

    this.getStatus = function (index) {  //used to fetch the current status of a query
        var query = main.queries[index];
        var status = query.ticketStatus;
        if (status === "Open") {
            return "Close Ticket";
        } else {
            return "Reopen Ticket";
        }
    }

    this.logout = function () { //used to log a user out of app
        authenticationService.setToken();
        main.user = '';
        queryService.logged = 0;
        $location.path('/');
    }
}]);