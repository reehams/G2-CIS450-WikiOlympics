const express = require('express');
const firebase = require('firebase');
const router = express.Router();
const path = require('path');


const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://qovnnpgvwxzyrq:fcc5ab45891c3ec93f7c3248a993877ee355cfc16ccb785cb29927771c31d8be@ec2-174-129-15-251.compute-1.amazonaws.com:5432/dahe59g5ccfl76',
  ssl: true
});
client.connect();


router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});

router.get('/index.html', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});
router.get('/athlete_information.html', function(req, res, next) {
       res.sendFile(path.join(__dirname, '../', 'views', 'athlete_information.html'));
  });
router.get('/country_information.html', function(req, res, next) {
       res.sendFile(path.join(__dirname, '../', 'views', 'country_information.html'));
  });
router.get('/top_athlete.html', function(req, res, next) {
       res.sendFile(path.join(__dirname, '../', 'views', 'top_athlete.html'));
  });

router.get('/country_vs_athlete.html', function(req, res, next) {
       res.sendFile(path.join(__dirname, '../', 'views', 'country_vs_athlete.html'));
  });

router.get('/battle_sexes.html', function(req, res, next) {
       res.sendFile(path.join(__dirname, '../', 'views', 'battle_sexes.html'));
  });

router.get('/demographic_performance.html', function(req, res, next) {
       res.sendFile(path.join(__dirname, '../', 'views', 'demographic_performance.html'));
  });

router.get('/about_us.html', function(req, res, next) {
       res.sendFile(path.join(__dirname, '../', 'views', 'about_us.html'));
  });

//Get athlete information
router.get('/athlete/:firstname/:surname', function(req, res, next) {

    var athlete_name = "";

    if (req.params.firstname && req.params.surname) {
        athlete_name = req.params.surname.toUpperCase() + ', ' + req.params.firstname.charAt(0).toUpperCase() + req.params.firstname.toLowerCase().slice(1);
    }


    client.query("SELECT * FROM athlete WHERE name = '" + athlete_name + "';", function(err, result, fields) {
        if (err) console.log(err);
        else {
            if (result.rows.length == 0) {
                res.json({message: 'Athlete doesn\'t exist' });
            } else {
                var final = "SELECT a.name, a.gender, c.name as country FROM athlete a INNER JOIN origin o ON a.athlete_id = o.athlete_id INNER JOIN country c ON c.ioc = o.ioc WHERE a.name = '"+ athlete_name +"';"

                client.query(final, function(err, result, fields) {
                    if (err) console.log(err);
                    else {
                        // sending the stuff that we queried
                        res.json(result.rows);
                    }
                });
            }

        }
    });
});

//Get country information
router.get('/countryHostInfo/:country', function(req, res, next) {

    var country_name = "";

    if (req.params.country) {
        country_name = req.params.country.toUpperCase();
    }
    var query = "SELECT c.name, c.ioc, COALESCE(h.year, -1) as year FROM country c LEFT JOIN hosts h ON c.ioc = h.ioc WHERE c.name = '"+ country_name +"';"
    client.query(query, function(err, result, fields) {
        if (err) console.log(err);
        else {
            if (result.rows.length == 0) {
                res.json({message: "No Data"});
            } else {
                // send results
                res.json(result.rows);
            }
        }
    });
});


// Get the total medal count for a given country - TODO NOT COMPLETE
router.get('/countryMedalCount/:country/:medal_type', function(req, res, next) {

    var country_name = "";
    var medal_type = "";

    if (req.params.medal_type) {
        medal_type = req.params.medal_type.toLowerCase();
        if (medal_type == "gold") medal_type = "Gold";
        else if (medal_type == "bronze") medal_type = "Bronze";
        else if (medal_type == "silver") medal_type = "Silver";
    }

    if (req.params.country) {
        country_name = req.params.country.toUpperCase();
    }

    var query = "SELECT '"+ country_name +"'" + " as country, COALESCE(sum(country_medal_count), 0) as medal_count FROM "
    + "(SELECT c.name, COUNT(*) as country_medal_count FROM Origin o, WonMedal m, Country c "
    + "WHERE o.athlete_id = m.athlete_id AND c.IOC = o.IOC AND m.medal_type = '"+ medal_type +"'"
    + " AND c.name = '"+ country_name +"'" + " GROUP BY c.name) as foo;";

    client.query(query, function(err, result, fields) {
        if (err) console.log(err);
        else {
            if (result.rows.length == 0) {
                res.json({message: "No Data"});
            } else {
                // send results
                res.json(result.rows);
            }
        }
    });
});

//Get TOP athletes
router.get('/topathletes/:country',function(req, res) {
    console.log("getting " + req.params.country);

    var query = "";

    if(req.params.country != 'undefined') {
        var country = req.params.country.toUpperCase();
        var medal = "WITH medal AS(SELECT wm.athlete_id AS a_id, COUNT(wm.medal_type) AS medal_count FROM wonmedal wm GROUP BY wm.athlete_id),";
        var medal_country = "medal_country AS (SELECT nm.a_id AS c_a_id, nm.medal_count AS medal_count, o.ioc AS c_ioc FROM medal nm INNER JOIN origin o ON nm.a_id = o.athlete_id),";
        var proportions = "proportions AS(SELECT c_a_id, medal_count,mc. c_ioc FROM medal_country mc INNER JOIN(SELECT max(mc1.medal_count) AS max_medal_count,mc1.c_ioc FROM medal_country mc1 GROUP BY mc1.c_ioc) grouped_medal_c ON mc.c_ioc = grouped_medal_c.c_ioc AND mc.medal_count = max_medal_count)";
        query = medal + medal_country + proportions + "SELECT a.name, p.medal_count FROM athlete a INNER JOIN proportions p ON a.athlete_id = p.c_a_id INNER JOIN country c ON p.c_ioc = c.ioc AND c.name LIKE \'%" + country + "%\';";
    }

    else {
    var medal = "WITH medal AS (SELECT wm.athlete_id AS a_id, COUNT(wm.medal_type) AS medal_count FROM wonmedal wm GROUP BY wm.athlete_id)";
    query = medal + "SELECT a.name, nm.medal_count FROM athlete a INNER JOIN medal nm on a.athlete_id = nm.a_id ORDER BY nm.medal_count DESC LIMIT 3;";
    }
    // execute query
    client.query(query, function(err, result, fields) {
        if (err) console.log(err);
        else {
            // send results
            res.json(result.rows);
        }
    });
});

/* GET country vs athlete data */
router.get('/cva/:firstname/:surname', function(req, res, next) {

    var athlete_name = "";

    if (req.params.firstname && req.params.surname) {
        athlete_name = req.params.surname.toUpperCase() + ', ' + req.params.firstname.charAt(0).toUpperCase() + req.params.firstname.toLowerCase().slice(1);
    }


    client.query("SELECT * FROM athlete WHERE name = '" + athlete_name + "';", function(err, result, fields) {
        if (err) console.log(err);
        else {
            if (result.rows.length == 0) {
                res.json({message: 'Athlete doesn\'t exist' });
            } else {
                var athlete_medals = "WITH phelps_medals AS (SELECT COUNT(*) AS num_medals\nFROM Athlete a, WonMedal m\nWHERE a.name = '"+ athlete_name +"' AND a.athlete_id = m.athlete_id),";

                var IOC_medal_counts = "IOC_medal_counts AS (SELECT o.IOC, COUNT(*) AS num_medals FROM Origin o, WonMedal m WHERE o.athlete_id = m.athlete_id GROUP BY o.IOC)";

                var final = "SELECT c.name FROM Country c, IOC_medal_counts mc, phelps_medals WHERE c.IOC = mc.IOC AND mc.num_medals = phelps_medals.num_medals;";

                client.query(athlete_medals + IOC_medal_counts + final, function(err, result, fields) {
                    if (err) console.log(err);
                    else {
                        // sending the stuff that we queried
                        res.json(result.rows);
                    }
                });
            }

        }
    });
});

router.get('/battle/:country/:sport', function(req, res) {

    console.log("getting " + req.params.country + " " + req.params.sport);

    var query = "";

    // if given both
    if (req.params.country != 'undefined' && req.params.sport != 'undefined') {
        var country = req.params.country.toUpperCase();
        var sport = req.params.sport.toUpperCase();
        var athletes = "WITH athletes AS (SELECT athlete.athlete_id, athlete.gender FROM athlete, origin, country WHERE athlete.athlete_id=origin.athlete_id AND origin.ioc=country.ioc AND country.name LIKE \'%" + country + "%\')";
        query = athletes + "SELECT A.gender, COUNT(*) FROM athletes A INNER JOIN wonmedal W ON A.athlete_id=W.athlete_id AND W.medal_event LIKE \'%" + sport + "%\' GROUP BY A.gender ORDER BY A.gender;";
    } else if (req.params.country != 'undefined') {
        // make first letter of country upper case and rest lower caes
        var country = req.params.country.toUpperCase();
        var athletes = "WITH athletes AS (SELECT athlete.athlete_id, athlete.gender FROM athlete, origin, country WHERE athlete.athlete_id=origin.athlete_id AND origin.ioc=country.ioc AND country.name LIKE \'%" + country + "%\')";
        query = athletes + "SELECT A.gender, COUNT(*) FROM athletes A INNER JOIN wonmedal W ON A.athlete_id=W.athlete_id GROUP BY A.gender ORDER BY A.gender;";
    } else if (req.params.sport != 'undefined') {
        var sport = req.params.sport.toUpperCase();
        query = "SELECT A.gender, COUNT(*) FROM athlete A INNER JOIN wonmedal W ON A.athlete_id=W.athlete_id AND W.medal_event LIKE \'%" + sport + "%\' GROUP BY A.gender ORDER BY A.gender;";
    } else {
        // given nothing
        query = "SELECT A.gender, COUNT(*) FROM athlete A INNER JOIN wonmedal W ON A.athlete_id=W.athlete_id GROUP BY A.gender ORDER BY A.gender;";
    }

    // execute query
    client.query(query, function(err, result, fields) {
        if (err) console.log(err);
        else {
            if (result.rows.length == 0) {
                res.json({message: "No such thing"});
            } else {
                // send results
                res.json(result.rows);
            }
        }
    });
});

//Get country information
router.get('/medalCount/:medal_type', function(req, res, next) {

    var query = "SELECT c.name, COUNT(*) as medal_count FROM Origin o, WonMedal m, Country c"
    + " WHERE o.athlete_id = m.athlete_id AND c.IOC = o.IOC "

    var medal_type = ""
    if (req.params.medal_type && req.params.medal_type.toLowerCase() != "all") {
        medal_type = req.params.medal_type.toLowerCase()
        query = query + "AND m.medal_type = '"+ medal_type +"'";
    }
    query = query + "GROUP BY c.name ORDER BY c.name ASC;";
    client.query(query, function(err, result, fields) {
        if (err) console.log(err);
        else {
            if (result.rows.length == 0) {
                res.json({message: "No Data"});
            } else {
                // send results
                res.json(result.rows);
            }
        }
    });
});


// Get demographic information of a county
router.get('/demographicInfo/:category', function(req, res, next) {


    var category = req.params.category;
    // send results
    var dbRef = firebase.database().ref(category).orderByKey();
    dbRef.on('value', function(snapshot) {
        var completeResults = [];
        var i = 0;
        snapshot.forEach(function(childSnapshot) {
            var country = childSnapshot.key;
            var demographicInfo = childSnapshot.val();
            completeResults[i] = {country: country, demographicInfo: demographicInfo};
            i++;
        });
        res.json(completeResults);
    });

});




module.exports = router;
