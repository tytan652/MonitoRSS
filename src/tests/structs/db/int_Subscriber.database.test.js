const Subscriber = require('../../../structs/db/Subscriber.js')
const initialize = require('../../../initialization/index.js')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const CON_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

jest.mock('../../../config.js', () => ({
  get: () => ({
    database: {
      uri: 'mongodb://'
    }
  })
}))

describe('Int::structs/db/subscriber Database', function () {
  let server
  /** @type {import('mongoose').Connection} */
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
  it('saves properly', async function () {
    const feedId = new mongoose.Types.ObjectId()
    const feedData = {
      _id: feedId
    }
    await con.db.collection('feeds').insertOne(feedData)
    const subData = {
      feed: feedId.toHexString(),
      id: '3etwg',
      type: 'role',
      filters: {
        title: ['hzz', 'hg'],
        de: ['e4', 'sgd']
      }
    }
    const subscriber = new Subscriber(subData)
    await subscriber.save()
    const found = await con.db.collection('subscribers').findOne({
      feed: feedId
    })
    expect(JSON.parse(JSON.stringify(found))).toEqual(expect.objectContaining(subData))
  })
  afterAll(async function () {
    await con.close()
    await server.close()
  })
})
