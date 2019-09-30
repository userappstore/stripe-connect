const dashboard = require('@userdashboard/dashboard')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let payoutids
    if (req.query.all) {
      payoutids = await dashboard.StorageList.listAll(`${req.appid}/payouts`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      payoutids = await dashboard.StorageList.list(`${req.appid}/payouts`, offset, limit)
    }
    if (!payoutids || !payoutids.length) {
      return
    }
    const payouts = []
    req.query = req.query || {}
    for (const payoutid of payoutids) {
      req.query.payoutid = payoutid
      const payout = await global.api.administrator.connect.Payout.get(req)
      payouts.push(payout)
    }
    return payouts
  }
}
