myApp.controller('singleController', ['$routeParams', '$http', '$location', '$route', 'queryService', 'authenticationService', function ($routeParams, $http, $location, $route, queryService, authenticationService) {
    this.logged = function () {  //check if a user is logged in
        if (queryService.logIn == 1) {
            return 1;
        } else {
            if (queryService.logIn == 0) {
                $location.path('/');
            }
        }
    }

    this.getName = function () {  //used to fetch the name and id of currently logged in user
        queryService.getUser()
            .then(function successCallback(response) {
                main.user = response.data.name;
                main.userID = response.data.id;
                queryService.logIn = 1;
            });
    }

    var main = this;
    this.tNumber = $routeParams.tNumber; //initializing ticket number from route
    this.userId = $routeParams.userId;  //initializing user id from route

    this.viewQuery = function (tNumber) {  //view single query thread
        queryService.singleQuery(tNumber)
            .then(function successCallback(response) {
                var data = response.data.data;
                main.title = data.queryTitle;
                main.Detail = data.queryDetail;
                main.messages = data.message;
                main.ticketStatus = data.ticketStatus;
                main.sender = data.name;
                main.date = data.created;
            }, function errorCallback(response) {
                alert("Error");
            });
    }

    this.viewQuery(this.tNumber);

    this.createMessage = function () {  //used to create a new reply message
        var data = {
            queryText: main.queryText
        }
        var tNumber = main.tNumber;
        if (main.user === "Admin") {  //if user is an admin, reply will be added as an answer
            queryService.newAnswer(tNumber, data)
                .then(function successCallback(response) {
                    var data = response.data.data;
                    main.messages = data.message;
                    main.created = data.created;
                    $('#messageText').val('');
                }, function errorCallback(response) {
                    alert("Error");
                });
        } else {
            queryService.newchatMsg(tNumber, data)  //if user is not an admin, it will remain a reply
                .then(function successCallback(response) {
                    var data = response.data.data;
                    main.messages = data.message;
                    main.created = data.created;
                    $('#messageText').val('');
                }, function errorCallback(response) {
                    alert("Error");
                });
        }
    }

    this.isAdmin = function (sender) {  //used to check if sender is an admin
        return (sender !== main.user);
    }

    this.openclose = function () {  //used to open or close a query
        queryService.openClose(main.tNumber)
            .then(function successCallback(response) {
                main.viewQuery(main.tNumber);  //viewQuery defined above
            }, function errorCallback(response) {
                alert("Error");
            });
    }

    this.getStatus = function () {  //used to fetch query status
        if (main.ticketStatus === "Open") {
            return "Close Ticket";
        } else {
            return "Reopen Ticket";
        }
    }

    this.logout = function () {  //used to log out a user
        authenticationService.setToken();
        main.user = '';
        queryService.logged = 0;
        $location.path('/');
    }
}]);