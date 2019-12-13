/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/connect/set-beneficial-owners-submitted', () => {
  describe('exceptions', () => {
    describe('invalid-stripeid', () => {
      it('missing querystring stripeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/connect/set-beneficial-owners-submitted')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-stripeid')
      })

      it('invalid querystring stripeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/connect/set-beneficial-owners-submitted?stripeid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-stripeid')
      })
    })

    describe('invalid-stripe-account', () => {
      it('ineligible stripe account for individual', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'individual',
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/connect/set-beneficial-owners-submitted?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-stripe-account')
      })

      it('ineligible beneficial owners are submitted', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'US'
        })
        const person = TestHelper.nextIdentity()
        await TestHelper.createBeneficialOwner(user, {
          relationship_owner_first_name: person.firstName,
          relationship_owner_last_name: person.lastName,
          relationship_owner_address_country: 'DE',
          relationship_owner_address_city: 'Berlin',
          relationship_owner_address_postal_code: '01067',
          relationship_owner_address_line1: 'First Street',
          relationship_owner_dob_day: '1',
          relationship_owner_dob_month: '1',
          relationship_owner_dob_year: '1950'
        })
        await TestHelper.submitBeneficialOwners(user)
        const req = TestHelper.createRequest(`/api/user/connect/set-beneficial-owners-submitted?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-stripe-account')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/connect/set-beneficial-owners-submitted?stripeid=${user.stripeAccount.id}`)
        req.account = user2.account
        req.session = user2.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'AT'
      })
      const req = TestHelper.createRequest(`/api/user/connect/set-beneficial-owners-submitted?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      const accountNow = await req.patch()
      assert.strictEqual(accountNow.company.owners_provided, true)
    })
  })

  describe('configuration', () => {
    it('environment STRIPE_JS', async () => {
      global.stripeJS = 3
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/account/connect/create-beneficial-owner?stripeid=${user.stripeAccount.id}`)
      req.waitOnSubmit = true
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_owner_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_owner_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = {
        relationship_owner_first_name: person.firstName,
        relationship_owner_last_name: person.lastName,
        relationship_owner_address_country: 'DE',
        relationship_owner_address_state: 'BW',
        relationship_owner_address_city: 'Berlin',
        relationship_owner_address_postal_code: '01067',
        relationship_owner_address_line1: 'First Street',
        relationship_owner_dob_day: '1',
        relationship_owner_dob_month: '1',
        relationship_owner_dob_year: '1950'
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/user/connect/set-beneficial-owners-submitted?stripeid=${user.stripeAccount.id}`)
      req2.account = user.account
      req2.session = user.session
      const accountNow = await req2.patch()
      assert.strictEqual(accountNow.company.owners_provided, true)
    })
  })
})
