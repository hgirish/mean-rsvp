db.events.insert([{
  "title": "Test Event Past",
  "location": "Home",
  "description": "This event took place in the past.",
  "startDatetime": ISODate("2018-05-04T18:00:00.000-04:00"),
  "endDatetime": ISODate("2018-05-04T20:00:00.000-04:00"),
  "viewPublic": true
}, {
  "title": "MongoBooster Test",
  "location": "Seattle, WA",
  "description": "I entered this seed event into the database using Mongo shell.",
  "startDatetime": ISODate("2018-08-12T20:00:00.000-04:00"),
  "endDatetime": ISODate("2018-08-13T10:00:00.000-04:00"),
  "viewPublic": true
}, {
  "title": "Bob's Private Event",
  "location": "Bob's House",
  "description": "An event at Bob's house.",
  "startDatetime": ISODate("2018-10-05T12:30:00.000-04:00"),
  "endDatetime": ISODate("2018-10-05T14:30:00.000-04:00"),
  "viewPublic": false
}])