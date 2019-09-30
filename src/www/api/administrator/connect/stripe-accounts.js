const dashboard = require('@userdashboard/dashboard')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let stripeids
    if (req.query.all) {
      stripeids = await dashboard.StorageList.listAll(`${req.appid}/stripeAccounts`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) || 0 : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) || 0 : 0
      stripeids = await dashboard.StorageList.list(`${req.appid}/stripeAccounts`, offset, limit)
    }
    if (!stripeids || !stripeids.length) {
      return null
    }
    const stripeAccounts = []
    req.query = req.query || {}
    for (const stripeid of stripeids) {
      req.query.stripeid = stripeid
      const stripeAccount = await global.api.administrator.connect.StripeAccount.get(req)
      stripeAccounts.push(stripeAccount)
    }
    return stripeAccounts
  }
}
