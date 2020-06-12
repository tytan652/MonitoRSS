const FeedModel = require('../../../models/Feed.js')
const { MongoMemoryServer } = require('mongodb-memory-server')
const intitialize = require('../../../initialization/index.js')
const mongoose = require('mongoose')
const CON_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

describe('Int::models/middleware/Feed', function () {
  let server
  /**
   * @type {import('mongoose').Connection}
   */
  let con
  beforeAll(async function () {
    server = new MongoMemoryServer()
    const uri = await server.getUri()
    con = await mongoose.createConnection(uri, CON_OPTIONS)
    await intitialize.setupModels(con)
  })
  beforeEach(async function () {
    await con.db.dropDatabase()
  })
  it('throws an error if feed tries to change guild', async function () {
    const id = 'wq23etr54ge5hu'
    const guildId = new mongoose.Types.ObjectId()
    const newGuildId = new mongoose.Types.ObjectId()
    await con.db.collection('feeds').insertOne({
      id,
      title: 'aedsg',
      channel: 'sewry',
      url: 'asedwt',
      guild: guildId
    })
    const feed = await FeedModel.Model.findOne({ id }).exec()
    feed.guild = newGuildId.toHexString()
    await expect(feed.save())
      .rejects.toThrow('Guild cannot be changed')
  })
  afterAll(async function () {
    await con.close()
    await server.close()
  })
})
