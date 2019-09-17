
/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/connect/stripe-accounts', () => {
  describe('exception', () => {
    describe('invalid-payoutid', () => {
      it('missing querystring payoutid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/connect/stripe-acounts')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring payoutid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/connect/stripe-acounts?accountid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/connect/stripe-acounts?accountid=${user.account.accountid}`)
        req.account = user2.account
        req.session = user2.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('should limit Stripe accounts to one page', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'US'
        })
      }
      const req = TestHelper.createRequest(`/api/user/connect/stripe-accounts?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const stripeAccounts = await req.get()
      assert.strictEqual(stripeAccounts.length, global.pageSize)
    })

    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'US'
        })
      }
      const req = TestHelper.createRequest(`/api/user/connect/stripe-accounts?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const stripeAccounts = await req.get()
      assert.strictEqual(stripeAccounts.length, global.pageSize)
    })

    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const stripeAccounts = []
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const stripeAccount = await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'US'
        })
        stripeAccounts.unshift(stripeAccount)
      }
      const req = TestHelper.createRequest(`/api/user/connect/stripe-accounts?accountid=${user.account.accountid}&offset=${offset}`)
      req.account = user.account
      req.session = user.session
      const stripeAccountsNow = await req.get()
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(stripeAccountsNow[i].id, stripeAccounts[offset + i].id)
      }
    })

    it('optional querystring all (boolean)', async () => {
      const user = await TestHelper.createUser()
      const stripeAccounts = []
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const stripeAccount = await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'US'
        })
        stripeAccounts.unshift(stripeAccount)
      }
      const req = TestHelper.createRequest(`/api/user/connect/stripe-accounts?accountid=${user.account.accountid}&all=true`)
      req.account = user.account
      req.session = user.session
      const stripeAccountsNow = await req.get()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        assert.strictEqual(stripeAccountsNow[i].id, stripeAccounts[i].id)
      }
    })
  })
})
