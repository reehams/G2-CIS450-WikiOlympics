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
        .when("/athlete-info", {
            templateUrl: "views/athlete-info.html"
        })
        .when("/country-info", {
            templateUrl: "views/country-info.html"
        })
        .when("/demographic-performance", {
            templateUrl: "views/demographic-performance.html"
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


// controller for battle of the sexes form
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
            // send data and draw chart
            $scope.data = data;
            if (data.message) {
                $window.alert("No such event or medal winners! Please try another search");
                $route.reload();
            } else {
                if (data.length < 2) {
                    if (data[0].gender == 'F') {
                        drawChart(data[0].gender, data[0].count, 'M', 0);
                    } else {
                        drawChart('F', 0, data[0].gender, data[0].count);
                    }
                } else {
                    drawChart(data[0].gender, data[0].count, data[1].gender, data[1].count);
                }
            }
            
        });
    };
});


//Controller for Top Athlete Aspect 
app.controller('topAthleteController', function($scope,$http,$window,$route) {

    $scope.country = "South Africa"

    $scope.countryNames = COUNTRY_NAMES;

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

//Controller for Athlete info
app.controller('athleteInfoController', function($scope, $http, $window, $route) {
    // Insert is the name of the button -> check the about-us.html page for the button and how I registered its name
    $scope.ATHLETE = function() {
        // checking out the get request in router.js where I query the db

        var request = $http.get('/athlete/' + $scope.firstname + '/' + $scope.surname);
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

//Controller for Athlete info
app.controller('countryInfoController', function($scope, $http, $window, $route) {
    // Insert is the name of the button -> check the about-us.html page for the button and how I registered its name
    $scope.COUNTRY = function() {
        // checking out the get request in router.js where I query the db

        var request = $http.get('/country/' + $scope.country);
        console.log("get data");
        request.success(function(data) {
            console.log("SENDING DATA");
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

//Controller for demographic performance page
app.controller('demographicPerformanceController', function($scope, $http, $window, $route, $q) {
    // set default options

    $scope.demographicOptions = [ // TODO REPLACE THESE THINGS
        {option : "None", tableColumnName : "Total Medals"},
        {option : "Area", tableColumnName : "Medals / 10,000 sq km"},
        {option : "GDP", tableColumnName : "Medals / 100 Billion $ of GDP"},
        {option : "Population", tableColumnName : "Medals / 10 Million in Population"},
        {option : "Unemployment", tableColumnName : "Medals / % Unemploymnet"},
    ]

    $scope.selectedDemographic = $scope.demographicOptions[0];
    $scope.thirdColumnName = $scope.selectedDemographic.tableColumnName;

    // Insert is the name of the button -> check the about-us.html page for the button and how I registered its name
    $scope.SUBMIT = function() {
        var demographicOption  = $scope.selectedDemographic.option
        var medalDataReq = $http.get('/medalCount/all', {cache: false});
        var demographicReq = $http.get('/demographicInfo/' + demographicOption, {'cache': false}); // todo

        // Use a promise so the code inside the {} gets executed only after both requests succeed. 
        $q.all([medalDataReq, demographicReq]).then(function(values) {
            // Get the data
            var medalData = values[0].data;
            var demographicData = values[1].data;
            // Create a map from a country name in lowercase to the demographic info about it 
            var mapFromCountryToInfo = {}
            for (var i = 0; i < demographicData.length; i++) {
                var countryName = String(demographicData[i].country);
                var demographicInfo = demographicData[i].demographicInfo;
                mapFromCountryToInfo[countryName.toLowerCase()] = demographicInfo;
            }
            // Create our final data - the country, medal count, and adjusted count relative to the demographic info
            var finalData = [];
            for (var i = 0; i < medalData.length; i++) {
                var countryName = medalData[i].name.toLowerCase();
                var medalCount = medalData[i].medal_count;
                var demoInfo = mapFromCountryToInfo[countryName];
                var adjustedMedals = medalCount;
                if (demographicOption == 'Area') {
                    adjustedMedals = medalCount / (parseFloat(demoInfo) / 10000); // medals per 10,000 sq km 
                }
                else if (demographicOption == 'GDP') {
                    var unemploymentPercent = (parseFloat(demoInfo));
                    if (unemploymentPercent > 0) {
                        adjustedMedals = medalCount / (parseFloat(demoInfo) / 100000000000); // medals per $100B in GDP
                    }
                    else {
                        adjustedMedals = "N/A";
                    }
                }
                else if (demographicOption == 'Population') {
                    adjustedMedals = medalCount / (parseFloat(demoInfo) / 10000000); // medals per 10 million in pop  
                }
                else if (demographicOption == 'Unemployment') {
                    var unemploymentPercent = (parseFloat(demoInfo));
                    if (unemploymentPercent > 0) {
                         adjustedMedals = medalCount / (parseFloat(demoInfo)); // medals % unemployment
                    }
                    else {
                        adjustedMedals = "N/A";
                    }
                }
                $scope.thirdColumnName = $scope.selectedDemographic.tableColumnName;
                finalData[i] = {name: countryName, medalCount: medalCount, adjustedCount: adjustedMedals}
            }
            $scope.data = finalData;
        });
    };


    // Convert a sting to sentence case (i.e. first letter capitalized)
    $scope.sentenceCase = function (str) {
      if ((str===null) || (str===''))
           return false;
      else
       str = str.toString();

     return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    // Code taken from w3 schools tutorial: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sort_table_desc
    $scope.sortTable = function (n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("myTable");
        switching = true;
        //Set the sorting direction to ascending:
        dir = "asc"; 
        /*Make a loop that will continue until
        no switching has been done:*/
        while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.getElementsByTagName("TR");
        /*Loop through all table rows (except the
        first, which contains table headers):*/
        for (i = 1; i < (rows.length - 1); i++) {
          //start by saying there should be no switching:
          shouldSwitch = false;
          /*Get the two elements you want to compare,
          one from current row and one from the next:*/
          x = rows[i].getElementsByTagName("TD")[n];
          y = rows[i + 1].getElementsByTagName("TD")[n];
          /*check if the two rows should switch place,
          based on the direction, asc or desc:*/
          var comp1 = x.innerHTML.toLowerCase();
          var comp2 = y.innerHTML.toLowerCase();
          // Comapre on numbers if not the first column
          if (n != 0) {
            if (comp1 == 'n/a') {
                comp1 = -1;
            }
            else {
                comp1 = parseFloat(comp1);
            }
            if (comp2 == 'n/a') {
                comp2 = -1;
            }
            else {
                comp2 = parseFloat(comp2);
            }
          }
          if (dir == "asc") {
            if (comp1 > comp2) {
              //if so, mark as a switch and break the loop:
              shouldSwitch= true;
              break;
            }
          } else if (dir == "desc") {
            if (comp1 < comp2) {
              //if so, mark as a switch and break the loop:
              shouldSwitch= true;
              break;
            }
          }
        }
        if (shouldSwitch) {
          /*If a switch has been marked, make the switch
          and mark that a switch has been done:*/
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          //Each time a switch is done, increase this count by 1:
          switchcount ++;      
        } else {
          /*If no switching has been done AND the direction is "asc",
          set the direction to "desc" and run the while loop again.*/
          if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
          }
        }
      }
    }
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
