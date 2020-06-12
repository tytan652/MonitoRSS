process.env.TEST_ENV = true
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const FilteredFormatModel = require('../../models/FilteredFormat.js')
const initialize = require('../../initialization/index.js')
const CON_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

describe('Int::models/FilteredFormat', function () {
  let server
  /** @type {import('mongoose').Connection} */
  let con
  /** @type {import('mongoose').Collection} */
  let collection
  beforeAll(async function () {
    server = new MongoMemoryServer()
    const uri = await server.getUri()
    con = await mongoose.createConnection(uri, CON_OPTIONS)
    await initialize.setupModels(con)
    collection = con.db.collection('filtered_formats')
  })
  beforeEach(async function () {
    await con.dropDatabase()
  })
  it('saves with filters', async function () {
    const feedID = new mongoose.Types.ObjectId()
    await con.db.collection('feeds').insertOne({
      _id: feedID
    })
    const data = {
      feed: feedID,
      text: 'hello',
      filters: {
        title: ['hello', 'world']
      }
    }
    const filteredFormat = new FilteredFormatModel.Model(data)
    await filteredFormat.save()
    const found = await collection.findOne({ feed: feedID })
    expect(found).toBeDefined()
    expect(found).toEqual(expect.objectContaining(data))
  })
  it('allows multiple filtered formats with same feed', async function () {
    const feedID = new mongoose.Types.ObjectId()
    await con.db.collection('feeds').insertOne({
      _id: feedID
    })
    const data = {
      feed: feedID,
      text: 'hello',
      filters: {
        title: ['hello', 'world']
      }
    }
    const data2 = {
      feed: feedID,
      text: 'hello2',
      filters: {
        title: ['hello2', 'world2']
      }
    }
    const filteredFormat = new FilteredFormatModel.Model(data)
    const filteredFormat2 = new FilteredFormatModel.Model(data2)
    await Promise.all([
      filteredFormat.save(),
      filteredFormat2.save()
    ])
    const found = await collection.find({ feed: feedID }).toArray()
    expect(found).toHaveLength(2)
  })
  afterAll(async function () {
    await con.close()
    await server.close()
  })
})
