const { MongoMemoryServer } = require('mongodb-memory-server')
const FilteredFormatModel = require('../../../models/FilteredFormat.js')
const initialize = require('../../../initialization/index.js')
const mongoose = require('mongoose')
const CON_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

describe('Int::models/middleware/FilteredFormat', function () {
  let server
  let con
  beforeAll(async function () {
    server = new MongoMemoryServer()
    const uri = await server.getUri()
    con = await mongoose.createConnection(uri, CON_OPTIONS)
    await initialize.setupModels(con)
  })
  beforeEach(async function () {
    await con.db.dropDatabase()
  })
  it('throws an error if the feed does not exist', async function () {
    const format = new FilteredFormatModel.Model({
      text: 'ase',
      feed: new mongoose.Types.ObjectId().toHexString()
    })

    await expect(format.save())
      .rejects.toThrowError(/specified feed/)
  })
  it('throws an error if format tries to change feed', async function () {
    const filteredFormatID = new mongoose.Types.ObjectId()
    const feedId = new mongoose.Types.ObjectId()
    const newFeedId = new mongoose.Types.ObjectId()
    await Promise.all([
      con.db.collection('filtered_formats').insertOne({
        _id: filteredFormatID,
        text: 'abc',
        feed: feedId
      }),
      con.db.collection('feeds').insertOne({
        _id: feedId
      }),
      con.db.collection('feeds').insertOne({
        _id: newFeedId
      })
    ])

    const doc = await FilteredFormatModel.Model.findOne({ _id: filteredFormatID })
    const format = new FilteredFormatModel.Model(doc, true)
    format.feed = newFeedId.toHexString()
    await expect(format.save())
      .rejects.toThrow('Feed cannot be changed')
  })
  afterAll(async function () {
    await con.close()
    await server.close()
  })
})
