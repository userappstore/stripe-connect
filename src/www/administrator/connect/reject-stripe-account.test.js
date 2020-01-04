/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/connect/reject-stripe-account', () => {
  describe('RejectStripeAccount#BEFORE', () => {
    it('should bind Stripe account to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'individual'
      })
      const req = TestHelper.createRequest(`/administrator/connect/reject-stripe-account?stripeid=${user.stripeAccount.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.stripeAccount.id, user.stripeAccount.id)
    })
  })

  describe('RejectStripeAccount#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'individual'
      })
      const req = TestHelper.createRequest(`/administrator/connect/reject-stripe-account?stripeid=${user.stripeAccount.id}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should present the Stripe account table', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'individual'
      })
      const req = TestHelper.createRequest(`/administrator/connect/reject-stripe-account?stripeid=${user.stripeAccount.id}`)
      req.account = administrator.account
      req.session = administrator.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const row = doc.getElementById(user.stripeAccount.id)
      assert.strictEqual(row.tag, 'tr')
    })
  })

  describe('RejectStripeAccount#POST', () => {
    it('should update the Stripe account as rejected (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'individual'
      })
      await TestHelper.createStripeRegistration(user, {
        business_profile_mcc: '7997',
        business_profile_url: 'https://www.' + user.profile.contactEmail.split('@')[1],
        address_city: 'New York',
        address_line1: '285 Fulton St',
        address_postal_code: '10007',
        address_state: 'NY',
        dob_day: '1',
        dob_month: '1',
        dob_year: '1950',
        email: user.profile.contactEmail,
        first_name: user.profile.firstName,
        last_name: user.profile.lastName,
        phone: '456-789-0123',
        ssn_last_4: '0000'
      }, {
        verification_document_back: TestHelper['success_id_scan_back.png'],
        verification_document_front: TestHelper['success_id_scan_front.png']
      })
      const req = TestHelper.createRequest(`/administrator/connect/reject-stripe-account?stripeid=${user.stripeAccount.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        reason: 'fraud'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/connect' },
        { click: '/administrator/connect/stripe-accounts' },
        { click: `/administrator/connect/stripe-account?stripeid=${user.stripeAccount.id}` },
        { click: `/administrator/connect/reject-stripe-account?stripeid=${user.stripeAccount.id}` },
        { fill: '#submit-form' }
      ]
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
