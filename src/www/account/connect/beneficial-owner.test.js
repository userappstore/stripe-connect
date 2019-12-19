/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/connect/beneficial-owner', () => {
  describe('BeneficialOwner#BEFORE', () => {
    it('should reject invalid ownerid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/connect/beneficial-owner?ownerid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-ownerid')
    })

    it('should bind owner to req', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'FR',
        type: 'company'
      })
      const person = TestHelper.nextIdentity()
      await TestHelper.createBeneficialOwner(user, {
        relationship_owner_address_city: 'Berlin',
        relationship_owner_address_country: 'DE',
        relationship_owner_address_line1: 'First Street',
        relationship_owner_address_postal_code: '01067',
        relationship_owner_address_state: 'BW',
        relationship_owner_dob_day: '1',
        relationship_owner_dob_month: '1',
        relationship_owner_dob_year: '1950',
        relationship_owner_email: person.email,
        relationship_owner_first_name: person.firstName,
        relationship_owner_last_name: person.lastName
      }, {
        relationship_owner_verification_document_back: TestHelper['success_id_scan_back.png'],
        relationship_owner_verification_document_front: TestHelper['success_id_scan_front.png']
      })
      const req = TestHelper.createRequest(`/account/connect/beneficial-owner?ownerid=${user.owner.ownerid}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.owner.ownerid, user.owner.ownerid)
    })
  })

  describe('BeneficialOwner#GET', () => {
    it('should show table for owner', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'GB',
        type: 'company'
      })
      const person = TestHelper.nextIdentity()
      await TestHelper.createBeneficialOwner(user, {
        relationship_owner_address_city: 'Berlin',
        relationship_owner_address_country: 'DE',
        relationship_owner_address_line1: 'First Street',
        relationship_owner_address_postal_code: '01067',
        relationship_owner_address_state: 'BW',
        relationship_owner_dob_day: '1',
        relationship_owner_dob_month: '1',
        relationship_owner_dob_year: '1950',
        relationship_owner_email: person.email,
        relationship_owner_first_name: person.firstName,
        relationship_owner_last_name: person.lastName
      }, {
        relationship_owner_verification_document_back: TestHelper['success_id_scan_back.png'],
        relationship_owner_verification_document_front: TestHelper['success_id_scan_front.png']
      })
      const req = TestHelper.createRequest(`/account/connect/beneficial-owner?ownerid=${user.owner.ownerid}`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const row = doc.getElementById(user.owner.ownerid)
      assert.strictEqual(row.tag, 'tbody')
    })
  })
})
