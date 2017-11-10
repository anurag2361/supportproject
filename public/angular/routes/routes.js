myApp.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/index.html',
            controller: 'indexController',
            controllerAs: 'index'
        })
        .when('/dashboard/:userId', {
            templateUrl: 'views/dashboard.html',
            controller: 'dashController',
            controllerAs: 'dashboard'
        })
        .when('/create/:userId', {
            templateUrl: 'views/create.html',
            controller: 'createController',
            controllerAs: 'create'
        })
        .when('/query/:tNumber/:userId', {
            templateUrl: 'views/chatPanel.html',
            controller: 'singleController',
            controllerAs: 'single'
        })
        .otherwise({
            template: '<h2 class="well" style="margin: 10%;">404, page not found</h2>'
        });
}]);