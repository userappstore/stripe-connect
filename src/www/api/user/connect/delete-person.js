const connect = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.personid) {
      throw new Error('invalid-personid')
    }
    const person = await global.api.user.connect.Person.get(req)
    if (!person) {
      throw new Error('invalid-personid')
    }
    if (person.relationship.representative) {
      throw new Error('invalid-person')
    }
    await stripeCache.execute('accounts', 'deletePerson', person.account, req.query.personid, req.stripeKey)
    await stripeCache.delete(req.query.personid)
    try {
      await connect.Storage.delete(`${req.appid}/map/personid/stripeid/${req.query.personid}`)
    } catch (error) {
    }
    try {
      await connect.StorageList.remove(`${req.appid}/stripeAccount/persons/${person.account}`, req.query.personid)
    } catch (error) {
    }
    try {
      await connect.StorageList.remove(`${req.appid}/persons`, req.query.personid)
    } catch (error) {
    }
    return true
  }
}
