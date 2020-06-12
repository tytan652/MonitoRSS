const mongoose = require('mongoose')

const FoobarSchema = new mongoose.Schema({
  foo: String,
  baz: Number,
  undefinedField: String,
  array: [String],
  object: {
    key: String
  },
  objectId: mongoose.Types.ObjectId
})

/**
 * @type {import('mongoose').Model}
 */
exports.Model = null

/**
 * @param {import('mongoose').Connection} connection
 */
function setup (connection) {
  const model = connection.model('Foobar', FoobarSchema)
  exports.Model = model
}

exports.setup = setup
