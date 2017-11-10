myApp.controller('indexController', ['$http', '$location', 'queryService', 'authenticationService', function ($http, $location, queryService, authenticationService) {
    var main = this;
    this.logIn = 0;  //if logged in, this becomes 1, else 0
    this.signup = 0;

    queryService.logIn = this.logIn;
    queryService.signup = this.signup;

    this.logged = function () {  //checking if logged in
        if (queryService.logIn == 1) {
            return 1;
        } else {
            return 0;
        }
    }

    this.getName = function () {  //used to get the name of currently logged user
        queryService.getUser()
            .then(function successCallback(response) {
                main.user = response.data.name;
                queryService.logIn = 1;
            });
    }

    this.submitLogIn = function () {  //used to check login data after user enters it in the form and presses the submit button
        var data = {
            email: main.email,
            password: main.password
        }

        queryService.login(data)
            .then(function successCallback(response) {
                if (response.data.error === true) {
                    alert(response.data.message);
                } else {
                    var userId;
                    var data = response.data.data;

                    angular.element('#loginModal').modal('hide'); //hide login modal if everything is correct
                    queryService.logIn = 1;  //change logIn value to 1
                    authenticationService.setToken(response.data.token); //store recieved token
                    $location.path('/dashboard/' + data._id); //redirect to dashboard
                }
            }, function errorCallback(response) {
                alert("Error");
            });
    }

    this.submitSignup = function () {  //used to process signup data after user enters it in the form
        var data = {
            name: main.name,
            email: main.email,
            password: main.password,
            mobile: main.mobile
        }
        queryService.signUp(data)
            .then(function successCallback(response) {
                if (response.data.error === true) {
                    alert(response.data.message);
                } else {
                    angular.element('#signupModal').modal('hide');  //hide signup modal if everything is right
                    queryService.logIn = 1; //change logIn value to 1
                    authenticationService.setToken(response.data.token);  //store token value
                    var data = response.data.data;
                    $location.path('/dashboard/' + data._id); //redirect to dashboard
                }
            }, function errorCallback(response) {
                if (response.status === 400) {
                    alert(response.data);
                } else {
                    alert(response.data.message);
                }
            });
    }
}]);