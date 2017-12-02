var app = angular.module('wikiOlympicsApp',['ngRoute']);


app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html"
        })
        .when("/about-us", {
            templateUrl : "views/about-us.html"
        })
        .when("/bro", {
            templateUrl : "views/about-us.html"
        })
    ;
});


app.controller('myController', function($scope, $http) {

    $scope.Submit = function() {
        var email = $scope.email;
        if (email == '') email = 'undefined'; // this allows you to always search even if the box is empty
        var request = $http.get('/data/'+email);
        request.success(function(data) {
            $scope.data = data;
        });
        request.error(function(data){
            console.log('err');
        });
    };

});
