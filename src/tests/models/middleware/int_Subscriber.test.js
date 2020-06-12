const { MongoMemoryServer } = require('mongodb-memory-server')
const SubscriberModel = require('../../../models/Subscriber.js')
const initialize = require('../../../initialization/index.js')
const mongoose = require('mongoose')
const CON_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

describe('Int::models/middleware/Subscriber', function () {
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
    const subscriber = new SubscriberModel.Model({
      id: 'asd',
      type: 'role',
      feed: new mongoose.Types.ObjectId().toHexString()
    })

    await expect(subscriber.save())
      .rejects.toThrowError(/specified feed/)
  })
  it('throws an error if subscriber tries to change feed', async function () {
    const id = 'wq23etr54ge5hu'
    const feedId = new mongoose.Types.ObjectId()
    const newFeedId = new mongoose.Types.ObjectId()
    await Promise.all([
      con.db.collection('subscribers').insertOne({
        id,
        type: 'role',
        feed: feedId
      }),
      con.db.collection('feeds').insertOne({
        _id: feedId
      }),
      con.db.collection('feeds').insertOne({
        _id: newFeedId
      })
    ])

    const doc = await SubscriberModel.Model.findOne({ id })
    const subscriber = new SubscriberModel.Model(doc, true)
    subscriber.feed = newFeedId.toHexString()
    await expect(subscriber.save())
      .rejects.toThrow('Feed cannot be changed')
  })
  afterAll(async function () {
    await con.close()
    await server.close()
  })
})
