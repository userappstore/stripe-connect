const dashboard = require('@userdashboard/dashboard')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.payoutid) {
      throw new Error('invalid-payoutid')
    }
    const stripeid = await dashboard.Storage.read(`${req.appid}/map/payoutid/stripeid/${req.query.payoutid}`)
    if (!stripeid) {
      throw new Error('invalid-payoutid')
    }
    const accountKey = {
      api_key: req.stripeKey.api_key,
      stripe_account: stripeid
    }
    const payout = await stripeCache.retrieve(req.query.payoutid, 'payouts', accountKey)
    if (!payout) {
      throw new Error('invalid-payoutid')
    }
    return payout
  }
}
