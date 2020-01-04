const dashboard = require('@userdashboard/dashboard')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.personid) {
      throw new Error('invalid-personid')
    }
    const stripeid = await dashboard.Storage.read(`${req.appid}/map/personid/stripeid/${req.query.personid}`)
    if (!stripeid) {
      throw new Error('invalid-personid')
    }
    req.query.stripeid = stripeid
    const stripeAccount = await global.api.user.connect.StripeAccount.get(req)
    if (!stripeAccount || stripeAccount.business_type !== 'company') {
      throw new Error('invalid-personid')
    }
    if (stripeAccount.metadata.representative !== req.query.personid) {
      throw new Error('invalid-personid')
    }
    try {
      const person = await stripeCache.retrievePerson(stripeid, req.query.personid, req.stripeKey)
      if (!person) {
        throw new Error('invalid-personid')
      }
      if (person.relationship.representative !== true) {
        throw new Error('invalid-person')
      }
      return person
    } catch (error) {
      if (process.env.DEBUG_ERRORS) { console.log(error); } throw new Error('unknown-error')
    }
  }
}