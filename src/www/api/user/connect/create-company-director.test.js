/* eslint-env mocha */
const assert = require('assert')
const connect = require('../../../../../index.js')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/connect/create-company-director', () => {
  describe('exceptions', () => {
    describe('invalid-stripeid', () => {
      it('missing querystring stripeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/connect/create-company-director')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-stripeid')
      })

      it('invalid querystring stripeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/connect/create-company-director?stripeid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-stripeid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'US'
        })
        await TestHelper.createStripeRegistration(user, {
          company_name: 'Company',
          company_tax_id: '8',
          company_phone: '456-123-7890',
          company_address_city: 'New York',
          company_address_line1: '123 Park Lane',
          company_address_postal_code: '10001',
          company_address_state: 'NY',
          company_address_country: 'US',
          business_profile_mcc: '8931',
          business_profile_url: 'https://' + user.profile.contactEmail.split('@')[1]
        })
        await TestHelper.createCompanyRepresentative(user, {
          relationship_representative_dob_day: '1',
          relationship_representative_dob_month: '1',
          relationship_representative_dob_year: '1950',
          relationship_representative_first_name: user.profile.firstName,
          relationship_representative_last_name: user.profile.lastName,
          relationship_representative_executive: 'true',
          relationship_representative_title: 'Owner',
          relationship_representative_email: user.profile.contactEmail,
          relationship_representative_ssn_last_4: '0000',
          relationship_representative_phone: '456-789-0123',
          relationship_representative_address_city: 'New York',
          relationship_representative_address_state: 'NY',
          relationship_representative_address_country: 'US',
          relationship_representative_address_line1: '285 Fulton St',
          relationship_representative_address_postal_code: '10007'
        })
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user2.account
        req.session = user2.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-stripe-account', () => {
      it('ineligible stripe account for individual', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'individual',
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-stripe-account')
      })
    })

    describe('invalid-relationship_director_first_name', () => {
      it('missing posted relationship_director_first_name', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const person = TestHelper.nextIdentity()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        req.uploads = {
          relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
          relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
        }
        req.body = TestHelper.createMultiPart(req, {
          relationship_director_first_name: '',
          relationship_director_last_name: person.lastName
        })
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-relationship_director_first_name')
      })
    })

    describe('invalid-relationship_director_last_name', () => {
      it('missing posted relationship_director_last_name', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const person = TestHelper.nextIdentity()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        req.uploads = {
          relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
          relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
        }
        req.body = TestHelper.createMultiPart(req, {
          relationship_director_first_name: person.firstName,
          relationship_director_last_name: ''
        })
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-relationship_director_last_name')
      })
    })

    describe('invalid-relationship_director_email', () => {
      it('missing posted relationship_director_email', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const person = TestHelper.nextIdentity()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        req.uploads = {
          relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
          relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
        }
        req.body = TestHelper.createMultiPart(req, {
          relationship_director_first_name: person.firstName,
          relationship_director_last_name: ''
        })
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-relationship_director_last_name')
      })
    })

    describe('invalid-relationship_director_dob_day', () => {
      it('missing posted relationship_director_dob_day', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const person = TestHelper.nextIdentity()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        req.uploads = {
          relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
          relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
        }
        req.body = TestHelper.createMultiPart(req, {
          relationship_director_first_name: person.firstName,
          relationship_director_last_name: person.lastName,
          relationship_director_email: person.email,
          relationship_director_dob_day: '',
          relationship_director_dob_month: '1',
          relationship_director_dob_year: '1950'
        })
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-relationship_director_dob_day')
      })
    })

    describe('invalid-relationship_director_dob_month', () => {
      it('missing posted relationship_director_dob_month', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const person = TestHelper.nextIdentity()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        req.uploads = {
          relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
          relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
        }
        req.body = TestHelper.createMultiPart(req, {
          relationship_director_first_name: person.firstName,
          relationship_director_last_name: person.lastName,
          relationship_director_email: person.email,
          relationship_director_dob_day: '1',
          relationship_director_dob_month: '',
          relationship_director_dob_year: '1950'
        })
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-relationship_director_dob_month')
      })
    })

    describe('invalid-relationship_director_dob_year', () => {
      it('missing posted relationship_director_dob_year', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const person = TestHelper.nextIdentity()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        req.uploads = {
          relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
          relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
        }
        req.body = TestHelper.createMultiPart(req, {
          relationship_director_first_name: person.firstName,
          relationship_director_last_name: person.lastName,
          relationship_director_email: person.email,
          relationship_director_dob_day: '1',
          relationship_director_dob_month: '1',
          relationship_director_dob_year: ''
        })
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-relationship_director_dob_year')
      })
    })

    describe('invalid-relationship_director_verification_document_front', () => {
      it('missing posted file relationship_director_verification_document_front', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const person = TestHelper.nextIdentity()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        req.uploads = {
          relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
        }
        req.body = TestHelper.createMultiPart(req, {
          relationship_director_first_name: person.firstName,
          relationship_director_last_name: person.lastName,
          relationship_director_email: person.email,
          relationship_director_dob_day: '1',
          relationship_director_dob_month: '1',
          relationship_director_dob_year: '1950'
        })
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-relationship_director_verification_document_front')
      })
    })

    describe('invalid-relationship_director_verification_document_back', () => {
      it('missing posted file relationship_director_verification_document_back', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          type: 'company',
          country: 'DE'
        })
        const person = TestHelper.nextIdentity()
        const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
        req.account = user.account
        req.session = user.session
        req.uploads = {
          relationship_director_verification_document_front: TestHelper['success_id_scan_front.png']
        }
        req.body = TestHelper.createMultiPart(req, {
          relationship_director_first_name: person.firstName,
          relationship_director_last_name: person.lastName,
          relationship_director_email: person.email,
          relationship_director_dob_day: '1',
          relationship_director_dob_month: '1',
          relationship_director_dob_year: '1950'
        })
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-relationship_director_verification_document_back')
      })
    })
  })

  describe('receives', () => {
    it('required posted relationship_director_first_name', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.strictEqual(owner.relationship_director_first_name, person.firstName)
    })

    it('required posted relationship_director_last_name', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.strictEqual(owner.relationship_director_last_name, person.lastName)
    })

    it('optionally-required posted relationship_director_email', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'AU'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_email: person.email,
        relationship_director_relationship_title: 'XXX',
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.strictEqual(owner.relationship_director_email, person.email)
    })

    it('optionally-required posted relationship_director_relationship_title', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'AU'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_email: person.email,
        relationship_director_relationship_title: 'SVP Sales',
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.strictEqual(owner.relationship_director_relationship_title, 'SVP Sales')
    })

    it('required posted relationship_director_dob_day', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.strictEqual(owner.relationship_director_dob_day, '1')
    })

    it('required posted relationship_director_dob_month', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '2',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.strictEqual(owner.relationship_director_dob_month, '2')
    })

    it('required posted relationship_director_dob_year', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.strictEqual(owner.relationship_director_dob_year, '1950')
    })

    it('required posted file relationship_director_verification_document_front', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_email: person.email,
        relationship_director_address_country: 'GB',
        relationship_director_address_city: 'London',
        relationship_director_address_line1: 'A building',
        relationship_director_address_postal_code: 'EC1A 1AA',
        relationship_director_address_state: 'LND',
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.notStrictEqual(owner.relationship_director_verification_document_front, null)
      assert.notStrictEqual(owner.relationship_director_verification_document_front, undefined)
    })

    it('required posted file relationship_director_verification_document_back', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_email: person.email,
        relationship_director_address_country: 'GB',
        relationship_director_address_city: 'London',
        relationship_director_address_line1: 'A building',
        relationship_director_address_postal_code: 'EC1A 1AA',
        relationship_director_address_state: 'LND',
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      const owner = await req.post()
      assert.notStrictEqual(owner.relationship_director_verification_document_back, null)
      assert.notStrictEqual(owner.relationship_director_verification_document_back, undefined)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        type: 'company',
        country: 'DE'
      })
      const person = TestHelper.nextIdentity()
      const req = TestHelper.createRequest(`/api/user/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = TestHelper.createMultiPart(req, {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      })
      await req.post()
      const stripeAccountNow = await global.api.user.connect.StripeAccount.get(req)
      const directorsNow = connect.MetaData.parse(stripeAccountNow.metadata, 'directors')
      assert.strictEqual(directorsNow.length, 1)
      assert.strictEqual(directorsNow[0].relationship_director_first_name, person.firstName)
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
      const req = TestHelper.createRequest(`/account/connect/create-company-director?stripeid=${user.stripeAccount.id}`)
      req.waitOnSubmit = true
      req.account = user.account
      req.session = user.session
      req.uploads = {
        relationship_director_verification_document_front: TestHelper['success_id_scan_front.png'],
        relationship_director_verification_document_back: TestHelper['success_id_scan_back.png']
      }
      req.body = {
        relationship_director_first_name: person.firstName,
        relationship_director_last_name: person.lastName,
        relationship_director_dob_day: '1',
        relationship_director_dob_month: '1',
        relationship_director_dob_year: '1950'
      }
      await req.post()
      const stripeAccountNow = await global.api.user.connect.StripeAccount.get(req)
      const directorsNow = connect.MetaData.parse(stripeAccountNow.metadata, 'directors')
      assert.strictEqual(directorsNow.length, 1)
      assert.notStrictEqual(directorsNow[0].token, null)
      assert.notStrictEqual(directorsNow[0].token, undefined)
    })
  })
})
