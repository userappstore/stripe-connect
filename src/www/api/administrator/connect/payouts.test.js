/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/connect/payouts', () => {
  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      const offset = 1
      global.delayDiskWrites = true
      const administrator = await TestHelper.createOwner()
      const payouts = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      // const user = await TestStripeAccounts.createSubmittedIndividual('NZ')
      // TODO: swap with individual account
      // the Stripe test api has an error creating fully-activated accounts
      // so when that gets fixed this code can be changed to speed it up
        const user = await TestStripeAccounts.createSubmittedCompany('NZ')
        await TestHelper.createPayout(user)
        payouts.unshift(user.payout.id)
        await TestHelper.waitForPayout(administrator, user.stripeAccount.id, null)
      }
      const req = TestHelper.createRequest(`/api/administrator/connect/payouts?offset=${offset}`)
      req.account = administrator.account
      req.session = administrator.session
      const payoutsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(payoutsNow[i].id, payouts[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      // const user = await TestStripeAccounts.createSubmittedIndividual('NZ')
      // TODO: swap with individual account
      // the Stripe test api has an error creating fully-activated accounts
      // so when that gets fixed this code can be changed to speed it up
        const user = await TestStripeAccounts.createSubmittedCompany('NZ')
        await TestHelper.createPayout(user)
        await TestHelper.waitForPayout(administrator, user.stripeAccount.id, null)
      }
      const req = TestHelper.createRequest(`/api/administrator/connect/payouts?limit=${limit}`)
      req.account = administrator.account
      req.session = administrator.session
      const payoutsNow = await req.get()
      assert.strictEqual(payoutsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      const payouts = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      // const user = await TestStripeAccounts.createSubmittedIndividual('NZ')
      // TODO: swap with individual account
      // the Stripe test api has an error creating fully-activated accounts
      // so when that gets fixed this code can be changed to speed it up
        const user = await TestStripeAccounts.createSubmittedCompany('NZ')
        await TestHelper.createPayout(user)
        payouts.unshift(user.payout.id)
        await TestHelper.waitForPayout(administrator, user.stripeAccount.id, null)
      }
      const req = TestHelper.createRequest('/api/administrator/connect/payouts?all=true')
      req.account = administrator.account
      req.session = administrator.session
      const payoutsNow = await req.get()
      assert.strictEqual(payoutsNow.length, payouts.length)
    })
  })

  describe('returns', () => {
    it.only('array', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      // const user = await TestStripeAccounts.createSubmittedIndividual('NZ')
      // TODO: swap with individual account
      // the Stripe test api has an error creating fully-activated accounts
      // so when that gets fixed this code can be changed to speed it up
        const user = await TestStripeAccounts.createSubmittedCompany('NZ')
        await TestHelper.createPayout(user)
        await TestHelper.waitForPayout(administrator, user.stripeAccount.id, null)
      }
      const req = TestHelper.createRequest('/api/administrator/connect/payouts')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const payouts = await req.get()
      assert.strictEqual(payouts.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it.only('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      // const user = await TestStripeAccounts.createSubmittedIndividual('NZ')
      // TODO: swap with individual account
      // the Stripe test api has an error creating fully-activated accounts
      // so when that gets fixed this code can be changed to speed it up
        const user = await TestStripeAccounts.createSubmittedCompany('NZ')
        await TestHelper.createPayout(user)
        await TestHelper.waitForPayout(administrator, user.stripeAccount.id, null)
      }
      const req = TestHelper.createRequest('/api/administrator/connect/payouts')
      req.account = administrator.account
      req.session = administrator.session
      const payouts = await req.get()
      assert.strictEqual(payouts.length, global.pageSize)
    })
  })
})
