const mongoose = require('mongoose')
const Schema = mongoose.schema

const eventSchema = new Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  startDatetime: { type: Date, required: true },
  endDatetime: { type: Date, required: true },
  description: String,
  viewPublic: { type: Boolean, required: true }
})

module.exports = mongoose.model('Event', eventSchema)
