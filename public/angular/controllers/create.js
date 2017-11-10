myApp.controller('createController', ['$http', '$location', '$routeParams', 'queryService', 'authenticationService', function ($http, $location, $routeParams, queryService, authenticationService) {
    this.logged = function () {  //check a user if logged in
        if (queryService.logIn == 1) {
            return 1;
        } else {
            if (queryService.logIn == 0) {
                $location.path('/');
            }
        }
    }

    this.getName = function () {  //fetch the name of currently logged user
        queryService.getUser()
            .then(function successCallback(response) {
                main.user = response.data.name;
                queryService.logIn = 1;
            });
    }

    var main = this;
    this.userId = $routeParams.userId;

    this.createQuery = function () {  //used to create a query
        var data = {
            queryTitle: main.queryTitle,  //recieve title of query
            queryDetail: main.queryDetail  //recieve detail of query
        }

        var userId = main.userId;
        queryService.newQuery(userId, data)  //passsing user id and query data as parameters
            .then(function successCallback(response) {
                main.ticketNo = response.data.data;
                main.queryTitle = '';
                main.queryDetail = '';
                setTimeout(function () {  //popup
                    alert("Thanks for submitting a query");
                }, 100);
            }, function errorCallback(response) {
                alert("Error");
            });
    }

    this.logout = function () {  //used for logging out
        authenticationService.setToken();
        main.user = '';
        queryService.logged = 0;
        $location.path('/');
    }
}]);