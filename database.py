import pgdb
import csv

# may need to update
hostname = 'ec2-174-129-15-251.compute-1.amazonaws.com'
username = 'qovnnpgvwxzyrq'
password = 'fcc5ab45891c3ec93f7c3248a993877ee355cfc16ccb785cb29927771c31d8be'
database = 'dahe59g5ccfl76'

# test query on database
def updateCountries(conn):
    cursor = conn.cursor()

    count = 0
    print("Inserting countries...")
    with open('ioc.csv') as file:
        my_csv = csv.reader(file)
        for row in my_csv:
            count += 1
            if count == 1:
                continue
            print(count)
            # get rid of apostrophes in names (causes syntax error)
            country = row[0].replace('\'', "")
            cursor.execute("INSERT INTO country VALUES(\'{}\', \'{}\', \'{}\');".format(row[1], country, "p"))
    print("Finished inserting countries")

def updateAthletes(conn):
    cursor = conn.cursor()

    count = 0
    print("Inserting athletes...")
    with open('athletes.csv') as file:
        my_csv = csv.reader(file)

        # seen athletes
        seen = set()
        for row in my_csv:
            # get rid of apostrophes in names (causes syntax error)
            name = row[4].replace('\'', "")
            # check if already seen athlete
            if name in seen:
                continue
            count += 1
            if count == 1:
                continue
            print(count)
            gender = "M" if row[6] == "Men" else "F"
            # add to seen
            seen.add(name)
            # temporarily just putting the country of everyone as USA (column to be deleted)
            cursor.execute("INSERT INTO athlete VALUES({}, \'{}\', \'{}\', \'{}\');".format(count, name, "USA", gender))

def updateOrigin(conn):
    # go through all rows

    cursor = conn.cursor()

    count = 0
    print("Inserting for origin...")
    with open("athletes.csv") as file:
        my_csv = csv.reader(file)

        # seen athletes
        seen = set()
        for row in my_csv:
            # get rid of apostrophes in names (causes syntax error)
            name = row[4].replace('\'', "")
            if name in seen:
                continue
            count += 1
            if count == 1:
                continue
            print(count)
            seen.add(name)

            # check country in country table
            cursor.execute("SELECT * FROM country WHERE ioc = \'{}\'".format(row[5]))

            # if it exists, add athlete and ioc to origin table
            if(cursor.rowcount):
                cursor.execute("INSERT INTO origin VALUES({}, \'{}\')".format(count, row[5]))

def updateWonMedal(conn):
    cursor = conn.cursor()

    count = 0
    print("Inserting won medals...")
    with open("athletes.csv") as file:
        my_csv = csv.reader(file)

        # seen athletes to id
        seen = dict()
        for row in my_csv:
            # get rid of apostrophes in names (causes syntax error)
            name = row[4].replace('\'', "")
            if name not in seen:
                count += 1
                seen[name] = count
            if count == 1:
                continue
            print(count)

            # get athlete_id
            athlete_id = seen[name]
            year = row[1]
            medal_event = row[2] + ": " + row[7]
            medal_type = row[9]

            # execute query
            cursor.execute("INSERT INTO wonmedal VALUES(\'{}\', \'{}\', {}, {});".format(medal_type, medal_event, athlete_id, year))

def updateOlympics(conn):
    cursor = conn.cursor()

    print("Inserting olympic games...")
    with open("olympics.csv") as file:
        my_csv = csv.reader(file)

        num = 0

        count = 0

        for row in my_csv:
            # get rid of \ufeff char
            if count == 0:
                num = int(row[0][1:])
            else:
                num = int(row[0])
            count += 1
            cursor.execute("INSERT INTO olympics VALUES(\'{}\', {}, \'{}\');".format(row[5], num, row[7]))

def updateHosts(conn):
    cursor = conn.cursor()

    print("Inserting hosts...")

    cursor.execute("SELECT * FROM olympics;")

    for res in cursor.fetchall():
        cursor.execute("INSERT INTO hosts VALUES(\'{}\', \'{}\')".format(res[2], res[1]))

def selectQuery(conn):
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM country;")

    for result in cursor.fetchall():
        print(result)

# connect and execute queries
connection = pgdb.connect(host=hostname, user=username,
    password=password, database=database)
updateHosts(connection)
# still need to input continents
connection.commit()
print("Committed")
#selectQuery(connection)
connection.close()