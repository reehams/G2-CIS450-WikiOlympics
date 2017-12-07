// Set everything up
const express = require('express');
const router = express.Router();
const path = require('path');
const { Client } = require('pg');
const client = new Client({
    // replace this if the credentials change, then push to master
  connectionString: 'postgres://qovnnpgvwxzyrq:fcc5ab45891c3ec93f7c3248a993877ee355cfc16ccb785cb29927771c31d8be@ec2-174-129-15-251.compute-1.amazonaws.com:5432/dahe59g5ccfl76',
  ssl: true,
});
client.connect();

/* GET home page. */
router.get('/', function(req, res, next) {

    // uncomment sample query below

    // client.query('SELECT * FROM country;', (err, res) => {
    //   console.log("here");
    //   if (err) throw err;
    //   for (let row of res.rows) {
    //     console.log(JSON.stringify(row));
    //   }
    //   client.end();
    // });

    res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
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

/** 
 * GET the number of medals for both genders given country and/or sport 
 * For use in battle sexes
**/
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

//Get athlete information
/* GET country vs athlete data */
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
                
                var final = "SELECT a.name, a.gender, o.ioc FROM athlete a INNER JOIN origin o on a.athlete_id = o.athlete_id;"

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

// /* GET about us. */
router.get('/data', function(req, res, next) {
    console.log("in about us");

    // uncomment sample query below

    var query = 'SELECT * FROM country;';

    client.query(query, function(err, rows, fields) {
        if (err) console.log(err);
        else {
            // sending the stuff that we queried
            res.json(rows);
        }
    });
});





module.exports = router;
