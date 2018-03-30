const MongoClient = require('mongodb').MongoClient

var conn, db;

async function setupDatabase(dbUrl, dbName) {
    try {
        conn = await MongoClient.connect(dbUrl);
        db = conn.db(dbName);
    } catch (e) {
        console.log("error connecting to database", e);
        return;
    }
}


async function cursorToArray(cursor) {
    let result = []
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        result.push(doc)
    }
    return result
}

async function findSchoolsInRadius(radius) {
    // there's just GP available this time. So, just consider that
    let kuruduGp = await db.collection('Panchayat').findOne()

    let cursor = await db.collection('School').find(
        {
            location: {
                $near: {
                    $geometry: kuruduGp.centroid,
                    $maxDistance: radius,
                    $minDistance: 0
                }
            }
        }
    )

    let schools = await cursorToArray(cursor)
    return schools
}


async function findHospitalsInRadius(radius) {
    // there's just GP available this time. So, just consider that
    let kuruduGp = await db.collection('Panchayat').findOne()

    let cursor = await db.collection('Hospital').find(
        {
            location: {
                $near: {
                    $geometry: kuruduGp.centroid,
                    $maxDistance: radius,
                    $minDistance: 0
                }
            }
        }
    )

    let hospitals = await cursorToArray(cursor)
    return hospitals
}


module.exports = {
    setupDatabase,
    findSchoolsInRadius,
    findHospitalsInRadius
}


if (require.main === module) {
    async function _inner() {
        let dbUrl = 'mongodb://localhost:27017'
        let dbName = 'sih'
        await setupDatabase(dbUrl, dbName)

        console.log(await findSchoolsInRadius(1000))
        console.log(await findHospitalsInRadius(2000))

        conn.close()
    }
    _inner()
}