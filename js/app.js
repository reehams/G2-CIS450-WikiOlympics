var app = angular.module('wikiOlympicsApp',['ngMessages', 'ngRoute']);

/* Add a page here
// Make your html file have some static html which has a button/drop down
// clicking on an option in the drop down/ or clicking a button should trigger
// a function that you have within a controller */

app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html"
        })
        .when("/about-us", {
            templateUrl : "views/about-us.html"
        })
        .when("/battle-sexes", {
            templateUrl : "views/battle-sexes.html"
        })
        .when("/country-vs-athlete", {
            templateUrl : "views/country-vs-athlete.html"
        })
        .when("/the-top-athlete", {
            templateUrl : "views/the-top-athlete.html"
        })
    ;
});


app.controller('cvaController', function($scope, $http, $window, $route) {
    // Insert is the name of the button -> check the about-us.html page for the button and how I registered its name
    $scope.CVA = function() {
        // checking out the get request in router.js where I query the db

        var request = $http.get('/cva/' + $scope.firstname + '/' + $scope.surname);
        console.log("get data");
        request.success(function(data) {
            console.log("SENDING DATA");
            // check out the about-us html where I display the data
            console.log(data);

            if (data.message == undefined) {
                $scope.data = data;
            } else {
                $window.alert(data.message);
                $route.reload();
            }
        });
    };
});


app.controller('battleController', function($scope, $http, $window, $route) {
    $scope.SEXES = function() {

        var country = 'undefined';
        var sport = 'undefined';

        if ($scope.country) country = $scope.country;
        if ($scope.sport) sport = $scope.sport

        var request = $http.get('/battle/' + country + '/' + sport);
        console.log("getting counts for both genders");
        request.success(function(data) {
            console.log(data);
            $scope.data = data;
        });
    };
});


Controller for Top Athlete Aspect 
app.controller('topAthleteController', function($scope,$http,$window,$route) {
    $scope.TOPATHLETES = function() {
        
        var country = 'undefined'; 
        
        if($scope.country) country = $scope.country; 
        
        var request = $http.get('/topathletes/' + country); 
        console.log("getting data for top athletes"); 
        request.success(function(data) {
            console.log(data); 
            $scope.data = data; 
        }); 
    }; 
}); 



/*
    As a general rule: have 1 controller per button or drop-down menu
    This controller is registered with an insert button on the about-us page.
    Only have that button as an example. we'll remove that later on.
    You need to have a cont
*/
// app.controller('insertController', function($scope, $http) {
//     // Insert is the name of the button -> check the about-us.html page for the button and how I registered its name
//     $scope.Insert = function() {
//         // checking out the get request in router.js where I query the db
//         var request = $http.get('/data');
//         console.log("get data");
//         request.success(function(data) {
//             console.log("SENDING DATA");
//             // check out the about-us html where I display the data
//             $scope.data = data;
//         });
//     };
// });
