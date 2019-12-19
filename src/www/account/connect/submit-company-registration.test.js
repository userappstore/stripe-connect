/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/connect/submit-company-registration', () => {
  describe('SubmitCompanyRegistration#BEFORE', () => {
    it('should reject invalid stripeid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/connect/submit-company-registration?stripeid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-stripeid')
    })

    it('should reject individual registration', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'individual'
      })
      await TestHelper.createStripeRegistration(user, {
        business_profile_mcc: '7333',
        business_profile_url: 'https://www.' + user.profile.contactEmail.split('@')[1],
        individual_address_city: 'New York',
        individual_address_line1: '285 Fulton St',
        individual_address_postal_code: '10007',
        individual_address_state: 'NY',
        individual_dob_day: '1',
        individual_dob_month: '1',
        individual_dob_year: '1950',
        individual_email: user.profile.contactEmail,
        individual_first_name: user.profile.firstName,
        individual_id_number: '000000000',
        individual_last_name: user.profile.lastName,
        individual_phone: '456-123-7890',
        individual_ssn_last_4: '0000'
      })
      const req = TestHelper.createRequest(`/account/connect/submit-company-registration?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-stripe-account')
    })

    it('should bind Stripe account to req', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'company'
      })
      await TestHelper.createStripeRegistration(user, {
        business_profile_mcc: '8931',
        business_profile_url: 'https://' + user.profile.contactEmail.split('@')[1],
        company_address_city: 'New York',
        company_address_line1: '123 Park Lane',
        company_address_postal_code: '10001',
        company_address_state: 'NY',
        company_name: 'Company',
        company_phone: '456-123-7890',
        company_tax_id: '00000000000'
      })
      await TestHelper.createCompanyRepresentative(user, {
        relationship_representative_address_city: 'New York',
        relationship_representative_address_country: 'US',
        relationship_representative_address_line1: '285 Fulton St',
        relationship_representative_address_postal_code: '10007',
        relationship_representative_address_state: 'NY',
        relationship_representative_dob_day: '1',
        relationship_representative_dob_month: '1',
        relationship_representative_dob_year: '1950',
        relationship_representative_email: user.profile.contactEmail,
        relationship_representative_first_name: user.profile.firstName,
        relationship_representative_last_name: user.profile.lastName,
        relationship_representative_phone: '456-789-0123',
        relationship_representative_relationship_executive: 'true',
        relationship_representative_relationship_title: 'Owner',
        relationship_representative_ssn_last_4: '0000'
      }, {
        relationship_representative_verification_document_back: TestHelper['success_id_scan_back.png'],
        relationship_representative_verification_document_front: TestHelper['success_id_scan_front.png']
      })
      await TestHelper.createExternalAccount(user, {
        account_holder_name: `${user.profile.firstName} ${user.profile.lastName}`,
        account_holder_type: 'individual',
        account_number: '000123456789',
        country: 'US',
        currency: 'usd',
        routing_number: '110000000'
      })
      const req = TestHelper.createRequest(`/account/connect/submit-company-registration?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.stripeAccount.id, user.stripeAccount.id)
    })
  })

  describe('SubmitCompanyRegistration#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'company'
      })
      await TestHelper.createStripeRegistration(user, {
        business_profile_mcc: '8931',
        business_profile_url: 'https://' + user.profile.contactEmail.split('@')[1],
        company_address_city: 'New York',
        company_address_line1: '123 Park Lane',
        company_address_postal_code: '10001',
        company_address_state: 'NY',
        company_name: 'Company',
        company_phone: '456-123-7890',
        company_tax_id: '00000000000'
      })
      await TestHelper.createCompanyRepresentative(user, {
        relationship_representative_address_city: 'New York',
        relationship_representative_address_country: 'US',
        relationship_representative_address_line1: '285 Fulton St',
        relationship_representative_address_postal_code: '10007',
        relationship_representative_address_state: 'NY',
        relationship_representative_dob_day: '1',
        relationship_representative_dob_month: '1',
        relationship_representative_dob_year: '1950',
        relationship_representative_email: user.profile.contactEmail,
        relationship_representative_first_name: user.profile.firstName,
        relationship_representative_last_name: user.profile.lastName,
        relationship_representative_phone: '456-789-0123',
        relationship_representative_relationship_executive: 'true',
        relationship_representative_relationship_title: 'Owner',
        relationship_representative_ssn_last_4: '0000'
      }, {
        relationship_representative_verification_document_back: TestHelper['success_id_scan_back.png'],
        relationship_representative_verification_document_front: TestHelper['success_id_scan_front.png']
      })
      await TestHelper.createExternalAccount(user, {
        account_holder_name: `${user.profile.firstName} ${user.profile.lastName}`,
        account_holder_type: 'individual',
        account_number: '000123456789',
        country: 'US',
        currency: 'usd',
        routing_number: '110000000'
      })
      await TestHelper.setCompanyRepresentative(user)
      await TestHelper.submitBeneficialOwners(user)
      const req = TestHelper.createRequest(`/account/connect/submit-company-registration?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should reject registration that hasn\'t submitted payment details', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'company'
      })
      await TestHelper.createStripeRegistration(user, {
        business_profile_mcc: '8931',
        business_profile_url: 'https://' + user.profile.contactEmail.split('@')[1],
        company_address_city: 'New York',
        company_address_line1: '123 Park Lane',
        company_address_postal_code: '10001',
        company_address_state: 'NY',
        company_name: 'Company',
        company_phone: '456-123-7890',
        company_tax_id: '00000000000'
      })
      await TestHelper.createCompanyRepresentative(user, {
        relationship_representative_address_city: 'New York',
        relationship_representative_address_country: 'US',
        relationship_representative_address_line1: '285 Fulton St',
        relationship_representative_address_postal_code: '10007',
        relationship_representative_address_state: 'NY',
        relationship_representative_dob_day: '1',
        relationship_representative_dob_month: '1',
        relationship_representative_dob_year: '1950',
        relationship_representative_email: user.profile.contactEmail,
        relationship_representative_first_name: user.profile.firstName,
        relationship_representative_last_name: user.profile.lastName,
        relationship_representative_phone: '456-789-0123',
        relationship_representative_relationship_executive: 'true',
        relationship_representative_relationship_title: 'Owner',
        relationship_representative_ssn_last_4: '0000'
      }, {
        relationship_representative_verification_document_back: TestHelper['success_id_scan_back.png'],
        relationship_representative_verification_document_front: TestHelper['success_id_scan_front.png']
      })
      await TestHelper.setCompanyRepresentative(user)
      await TestHelper.submitBeneficialOwners(user)
      const req = TestHelper.createRequest(`/account/connect/submit-company-registration?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      const page = await req.get()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-payment-details')
    })
  })

  describe('SubmitCompanyRegistration#POST', () => {
    it('should submit registration', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'company'
      })
      await TestHelper.createStripeRegistration(user, {
        business_profile_mcc: '8931',
        business_profile_url: 'https://' + user.profile.contactEmail.split('@')[1],
        company_address_city: 'New York',
        company_address_line1: '285 Fulton St',
        company_address_postal_code: '10007',
        company_address_state: 'NY',
        company_name: 'Company',
        company_phone: '456-123-7890',
        company_tax_id: '00000000000'
      })
      await TestHelper.createCompanyRepresentative(user, {
        relationship_representative_address_city: 'New York',
        relationship_representative_address_line1: '285 Fulton St',
        relationship_representative_address_postal_code: '10007',
        relationship_representative_address_state: 'NY',
        relationship_representative_address_country: 'US',
        relationship_representative_dob_day: '1',
        relationship_representative_dob_month: '1',
        relationship_representative_dob_year: '1950',
        relationship_representative_email: user.profile.contactEmail,
        relationship_representative_first_name: user.profile.firstName,
        relationship_representative_last_name: user.profile.lastName,
        relationship_representative_phone: '456-789-0123',
        relationship_representative_relationship_executive: 'true',
        relationship_representative_relationship_title: 'Owner',
        relationship_representative_ssn_last_4: '0000'
      }, {
        relationship_representative_verification_document_back: TestHelper['success_id_scan_back.png'],
        relationship_representative_verification_document_front: TestHelper['success_id_scan_front.png']
      })
      await TestHelper.createExternalAccount(user, {
        account_holder_name: `${user.profile.firstName} ${user.profile.lastName}`,
        account_holder_type: 'individual',
        account_number: '000123456789',
        country: 'US',
        currency: 'usd',
        routing_number: '110000000'
      })
      await TestHelper.setCompanyRepresentative(user)
      await TestHelper.submitBeneficialOwners(user)
      const req = TestHelper.createRequest(`/account/connect/submit-company-registration?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {}
      const page = await req.post()
      const doc = TestHelper.extractDoc(page)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
