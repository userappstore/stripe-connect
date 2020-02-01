/* eslint-env mocha */
// TODO: this script now only supports information specified
// in the requirements.currently_due and eventually_due
// collections.  Testing most fields is disabled until
// they submit data that fails validation first.

const assert = require('assert')
const connect = require('../../../../../index.js')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/connect/update-company-representative', () => {
  describe('exceptions', () => {
    describe('invalid-personid', () => {
      it('missing querystring personid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/connect/update-company-representative')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-personid')
      })

      it('invalid querystring personid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/connect/update-company-representative?personid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-personid')
      })
    })

    describe('invalid-person', () => {
      it('ineligible person is not representative', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          country: 'US',
          type: 'company'
        })
        await TestHelper.createBeneficialOwner(user, TestStripeAccounts.createPostData(TestStripeAccounts.beneficialOwnerData.US), {
          verification_document_back: TestHelper['success_id_scan_back.png'],
          verification_document_front: TestHelper['success_id_scan_front.png']
        })
        const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.owner.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-person')
      })

      it('ineligible person has no required information', async () => {
        const user = await TestStripeAccounts.createSubmittedCompany('DE')
        const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-person')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createStripeAccount(user, {
          country: 'US',
          type: 'company'
        })
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
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

  describe('receives', () => {
    it('optionally-required posted token', async () => {
      // global.stripeJS = 3
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.representativeToken, 'token')
    })

    it('optionally-required posted dob_day', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.dob.day, 7)
    })

    it('optionally-required posted dob_month', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.dob.month, 11)
    })

    it('optionally-required posted dob_year', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.dob.year, 1951)
    })

    it('optionally-required posted file verification_document_front', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.notStrictEqual(personNow.verification.document.front, null)
      // assert.notStrictEqual(personNow.verification.document.front, undefined)
    })

    it('optionally-required posted file verification_document_back', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.notStrictEqual(personNow.verification.document.back, null)
      // assert.notStrictEqual(personNow.verification.document.back, undefined)
    })

    it('optionally-required posted first_name', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.first_name, user.profile.firstName)
    })

    it('optionally-required posted last_name', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.last_name, user.profile.lastName)
    })

    it('optionally-required posted email', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.email, user.profile.contactEmail)
    })

    it('optionally-required posted phone', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.phone, '+14567890123')
    })

    it('optionally-required posted gender', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.gender, 'female')
    })

    it('optionally-required posted ssn_last_4', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.ssn_last_4_provided, true)
    })

    it('optionally-required posted id_number', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'CA',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.CA))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.id_number_provided, true)
    })

    it('optionally-required posted address_city', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address.city, 'New York')
    })

    it('optionally-required posted address_state', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address.state, 'NY')
    })

    it('optionally-required posted address_postal_code', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_postal_code, '10007')
    })

    it('optionally-required posted address_country', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address.country, 'US')
    })

    it('optionally-required posted address_line1', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'US',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address.line1, '285 Fulton St')
    })

    it('optionally-required posted relationship_percent_ownership', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'CA',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.CA))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.relationship.percent_ownership, '100')
    })

    it('optionally-required posted relationship_title', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'CA',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.CA))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.relationship.title, 'Owner')
    })

    it('optionally-required posted relationship_director', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'CA',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.CA))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.relationship.director, true)
    })

    it('optionally-required posted relationship_executive', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'CA',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.CA))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.relationship_executive, true)
    })

    it('optionally-required posted first_name_kana', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kanji.line1, '２７－１５')
    })

    it('optionally-required posted last_name_kana', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.last_name_kana, 'ﾄｳｷﾖｳﾄ')
    })

    it('optionally-required posted address_kana_city', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kana.city, 'ｼﾌﾞﾔ')
    })

    it('optionally-required posted address_kana_state', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kana.state, 'ﾄｳｷﾖｳﾄ')
    })

    it('optionally-required posted address_kana_postal_code', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kana.postal_code, '1500001')
    })

    it('optionally-required posted address_kana_town', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kana.town, 'ｼﾞﾝｸﾞｳﾏｴ 3-')
    })

    it('optionally-required posted address_kana_line1', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kana.line1, '27-15')
    })

    it('optionally-required posted first_name_kanji', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.first_name_kanji, '東京都')
    })

    it('optionally-required posted last_name_kanji', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.last_name_kanji, '東京都')
    })

    it('optionally-required posted address_kanji_city', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kanji.city, '渋谷区')
    })

    it('optionally-required posted address_kanji_state', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kanji.state, '東京都')
    })

    it('optionally-required posted address_kanji_postal_code', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kanji.postal_code, '1500001')
    })

    it('optionally-required posted address_kanji_town', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kanji.town, '神宮前 ３丁目')
    })

    it('optionally-required posted address_kanji_line1', async () => {
      // const user = await TestHelper.createUser()
      // await TestHelper.createStripeAccount(user, {
      //   country: 'JP',
      //   type: 'company'
      // })
      // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
      // req.account = user.account
      // req.session = user.session
      // req.uploads = {
      //   verification_document_back: TestHelper['success_id_scan_back.png'],
      //   verification_document_front: TestHelper['success_id_scan_front.png']
      // }
      // req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.JP))
      // const personNow = await req.patch()
      // assert.strictEqual(personNow.address_kanji.line1, '２７－１５')
    })
  })

  describe('returns', () => {
    for (const country of connect.countrySpecs) {
      it('object (' + country.id + ')', async () => {
        // const user = await TestHelper.createUser()
        // await TestHelper.createStripeAccount(user, {
        //   country: country.id,
        //   type: 'company'
        // })
        // const req = TestHelper.createRequest(`/api/user/connect/update-company-representative?personid=${user.representative.id}`)
        // req.account = user.account
        // req.session = user.session
        // req.body = TestStripeAccounts.createPostData(TestStripeAccounts.representativeData[country.id], user.profile)
        // req.uploads = {
        //   verification_document_front: TestHelper['success_id_scan_back.png'],
        //   verification_document_back: TestHelper['success_id_scan_back.png']
        // }
        // req.body = TestHelper.createMultiPart(req, req.body)
        // req.filename = __filename
        // req.saveResponse = true
        // const personNow = await req.patch()
        // assert.notStrictEqual(personNow.verification.document.front, null)
        // assert.notStrictEqual(personNow.verification.document.front, undefined)
        // assert.notStrictEqual(personNow.verification.document.back, null)
        // assert.notStrictEqual(personNow.verification.document.back, undefined)
      })
    }
  })

  describe('configuration', () => {
    it('environment STRIPE_JS', async () => {
      global.stripeJS = 3
      const user = await TestHelper.createUser()
      await TestHelper.createStripeAccount(user, {
        country: 'US',
        type: 'company'
      })
      const req = TestHelper.createRequest(`/account/connect/edit-company-representative?personid=${user.representative.id}`)
      req.waitOnSubmit = true
      req.account = user.account
      req.session = user.session
      req.uploads = {
        verification_document_back: TestHelper['success_id_scan_back.png'],
        verification_document_front: TestHelper['success_id_scan_front.png']
      }
      const person = await TestHelper.nextIdentity()
      req.body = req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US, person))
      await req.post()
      const req2 = TestHelper.createRequest(`/account/connect/edit-company-representative?personid=${user.representative.id}`)
      req2.waitOnSubmit = true
      req2.account = user.account
      req2.session = user.session
      req2.uploads = {
        verification_document_back: TestHelper['success_id_scan_back.png'],
        verification_document_front: TestHelper['success_id_scan_front.png']
      }
      req2.body = req.body = TestHelper.createMultiPart(req, TestStripeAccounts.createPostData(TestStripeAccounts.representativeData.US, person))
      await req2.post()
      const personNow = await global.api.user.connect.StripeAccount.get(req2)
      assert.notStrictEqual(personNow.metadata.token, 'false')
    })
  })
})
