const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const Blacklist = require('../../../structs/db/Blacklist.js')
const initialize = require('../../../initialization/index.js')
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

describe('Int::structs/db/Blacklist Database', function () {
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
    collection = con.db.collection('blacklists')
  })
  beforeEach(async function () {
    await con.db.dropDatabase()
  })
  it('saves correctly', async function () {
    const data = {
      _id: '12436',
      type: Blacklist.TYPES.USER,
      name: 'ahhh'
    }
    const blacklist = new Blacklist(data)
    await blacklist.save()
    const doc = await collection.findOne({ _id: data._id })
    expect(doc).toBeDefined()
    for (const key in data) {
      expect(doc[key]).toEqual(data[key])
    }
  })
  it('gets correctly', async function () {
    const data = {
      _id: 'foozxczdg',
      type: Blacklist.TYPES.GUILD,
      name: 'srfdetuj6y'
    }
    await collection.insertOne(data)
    const blacklist = await Blacklist.get(data._id)
    expect(blacklist).toBeDefined()
    for (const key in data) {
      expect(blacklist[key]).toEqual(data[key])
    }
  })
  afterAll(async function () {
    await con.close()
    await server.close()
  })
})
