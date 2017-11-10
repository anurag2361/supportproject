myApp.factory('authenticationService', ['$window', function ($window) { //factory to manage tokens
    var authToken = {};

    var store = $window.localStorage; //With local storage, web applications can store data locally within the user's browser.
    var key = 'auth-token';

    authToken.getToken = function () { //this function gets token from browser's local storage
        return store.getItem(key);
    }

    authToken.setToken = function (token) { //this function sets token in browser's local storage
        if (token) {
            store.setItem(key, token);
        } else {
            store.removeItem(key);
        }
    }
    return authToken;
}]);