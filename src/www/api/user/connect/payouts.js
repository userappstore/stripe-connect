const dashboard = require('@userdashboard/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    let payoutids
    if (req.query.all) {
      payoutids = await dashboard.StorageList.listAll(`${req.appid}/account/payouts/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      payoutids = await dashboard.StorageList.list(`${req.appid}/account/payouts/${req.query.accountid}`, offset, limit)
    }
    if (!payoutids || !payoutids.length) {
      return
    }
    const payouts = []
    for (const payoutid of payoutids) {
      req.query.payoutid = payoutid
      const payout = await global.api.user.connect.Payout.get(req)
      payouts.push(payout)
    }
    if (!payouts || !payouts.length) {
      return null
    }
    return payouts
  }
}
