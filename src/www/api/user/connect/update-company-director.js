const connect = require('../../../../../index.js')
const stripe = require('stripe')()
stripe.setApiVersion(global.stripeAPIVersion)
if (global.maxmimumStripeRetries) {
  stripe.setMaxNetworkRetries(global.maximumStripeRetries)
}
stripe.setTelemetryEnabled(false)
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.personid) {
      throw new Error('invalid-personid')
    }
    const person = await global.api.user.connect.CompanyDirector.get(req)
    if (!person) {
      throw new Error('invalid-personid')
    }
    req.query.stripeid = person.account
    const stripeAccount = await global.api.user.connect.StripeAccount.get(req)
    if (!stripeAccount.requirements.currently_due.length && !stripeAccount.requirements.eventually_due.length) {
      throw new Error('invalid-person')
    }
    req.body = req.body || {}
    if (global.stripeJS === 3 && !req.body.token) {
      throw new Error('invalid-token')
    }
    const directorInfo = {}
    if (global.stripeJS === 3) {
      directorInfo.person_token = req.body.token
    } else {
      let validateDOB = false
      if (req.body.dob_day) {
        validateDOB = true
        try {
          const day = parseInt(req.body.dob_day, 10)
          if (!day || day < 1 || day > 31) {
            throw new Error('invalid-dob_day')
          }
        } catch (s) {
          throw new Error('invalid-dob_day')
        }
      }
      if (req.body.dob_month) {
        validateDOB = true
        try {
          const month = parseInt(req.body.dob_month, 10)
          if (!month || month < 1 || month > 12) {
            throw new Error('invalid-dob_month')
          }
        } catch (s) {
          throw new Error('invalid-dob_month')
        }
      }
      if (req.body.dob_year) {
        validateDOB = true
        try {
          const year = parseInt(req.body.dob_year, 10)
          if (!year || year < 1900 || year > new Date().getFullYear() - 18) {
            throw new Error('invalid-dob_year')
          }
        } catch (s) {
          throw new Error('invalid-dob_year')
        }
      }
      if (validateDOB) {
        if (!req.body.dob_day) {
          throw new Error('invalid-dob_day')
        }
        if (!req.body.dob_month) {
          throw new Error('invalid-dob_month')
        }
        if (!req.body.dob_year) {
          throw new Error('invalid-dob_year')
        }
        try {
          Date.parse(`${req.body.dob_year}/${req.body.dob_month}/${req.body.dob_day}`)
        } catch (error) {
          throw new Error('invalid-dob_day')
        }
      }
      if (req.uploads) {
        if (req.uploads.verification_document_front) {
          const frontData = {
            purpose: 'identity_document',
            file: {
              type: 'application/octet-stream',
              name: req.uploads.verification_document_front.name,
              data: req.uploads.verification_document_front.buffer
            }
          }
          while (true) {
            try {
              const front = await stripe.files.create(frontData, req.stripeKey)
              req.body.verification_document_front = front.id
              break
            } catch (error) {
              if (error.raw && error.raw.code === 'lock_timeout') {
                continue
              }
              if (error.raw && error.raw.code === 'rate_limit') {
                continue
              }
              if (error.raw && error.raw.code === 'account_invalid') {
                continue
              }
              if (error.raw && error.raw.code === 'idempotency_key_in_use') {
                continue
              }
              if (error.raw && error.raw.code === 'resource_missing') {
                continue
              }
              if (error.type === 'StripeConnectionError') {
                continue
              }
              if (error.type === 'StripeAPIError') {
                continue
              }
              if (error.message === 'An error occurred with our connection to Stripe.') {
                continue
              }
              if (process.env.DEBUG_ERRORS) { console.log(error) } throw new Error('invalid-verification_document_front')
            }
          }
        }
        if (req.uploads.verification_document_back) {
          const backData = {
            purpose: 'identity_document',
            file: {
              type: 'application/octet-stream',
              name: req.uploads.verification_document_back.name,
              data: req.uploads.verification_document_back.buffer
            }
          }
          while (true) {
            try {
              const back = await stripe.files.create(backData, req.stripeKey)
              req.body.verification_document_back = back.id
              break
            } catch (error) {
              if (error.raw && error.raw.code === 'lock_timeout') {
                continue
              }
              if (error.raw && error.raw.code === 'rate_limit') {
                continue
              }
              if (error.raw && error.raw.code === 'account_invalid') {
                continue
              }
              if (error.raw && error.raw.code === 'idempotency_key_in_use') {
                continue
              }
              if (error.raw && error.raw.code === 'resource_missing') {
                continue
              }
              if (error.type === 'StripeConnectionError') {
                continue
              }
              if (error.type === 'StripeAPIError') {
                continue
              }
              if (error.message === 'An error occurred with our connection to Stripe.') {
                continue
              }
              if (process.env.DEBUG_ERRORS) { console.log(error) } throw new Error('invalid-verification_document_back')
            }
          }
        }
        if (req.uploads.verification_additional_document_front) {
          const frontData = {
            purpose: 'identity_document',
            file: {
              type: 'application/octet-stream',
              name: req.uploads.verification_additional_document_front.name,
              data: req.uploads.verification_additional_document_front.buffer
            }
          }
          while (true) {
            try {
              const front = await stripe.files.create(frontData, req.stripeKey)
              req.body.verification_additional_document_front = front.id
              break
            } catch (error) {
              if (error.raw && error.raw.code === 'lock_timeout') {
                continue
              }
              if (error.raw && error.raw.code === 'rate_limit') {
                continue
              }
              if (error.raw && error.raw.code === 'account_invalid') {
                continue
              }
              if (error.raw && error.raw.code === 'idempotency_key_in_use') {
                continue
              }
              if (error.raw && error.raw.code === 'resource_missing') {
                continue
              }
              if (error.type === 'StripeConnectionError') {
                continue
              }
              if (error.type === 'StripeAPIError') {
                continue
              }
              if (error.message === 'An error occurred with our connection to Stripe.') {
                continue
              }
              if (process.env.DEBUG_ERRORS) { console.log(error) } throw new Error('invalid-verification_document_front')
            }
          }
        }
        if (req.uploads.verification_additional_document_back) {
          const backData = {
            purpose: 'identity_document',
            file: {
              type: 'application/octet-stream',
              name: req.uploads.verification_additional_document_back.name,
              data: req.uploads.verification_additional_document_back.buffer
            }
          }
          while (true) {
            try {
              const back = await stripe.files.create(backData, req.stripeKey)
              req.body.verification_additional_document_back = back.id
              break
            } catch (error) {
              if (error.raw && error.raw.code === 'lock_timeout') {
                continue
              }
              if (error.raw && error.raw.code === 'rate_limit') {
                continue
              }
              if (error.raw && error.raw.code === 'account_invalid') {
                continue
              }
              if (error.raw && error.raw.code === 'idempotency_key_in_use') {
                continue
              }
              if (error.raw && error.raw.code === 'resource_missing') {
                continue
              }
              if (error.type === 'StripeConnectionError') {
                continue
              }
              if (error.type === 'StripeAPIError') {
                continue
              }
              if (error.message === 'An error occurred with our connection to Stripe.') {
                continue
              }
              if (process.env.DEBUG_ERRORS) { console.log(error) } throw new Error('invalid-verification_document_back')
            }
          }
        }
      }
      for (const fullField of stripeAccount.requirements.currently_due) {
        if (!fullField.startsWith(person.id)) {
          continue
        }
        const field = fullField.substring(`${person.id}.`.length)
        const posted = field.split('.').join('_')
        if (!req.body[posted]) {
          if (field === 'address.line2' ||
              field === 'relationship.title' ||
              field === 'relationship.executive' ||
              field === 'relationship.director' ||
              field === 'relationship.owner') {
            continue
          }
          if (field !== 'verification.document' &&
              field !== 'verification.additional_document') {
            throw new Error(`invalid-${posted}`)
          }
        }
        if (field.startsWith('business_profile.')) {
          const property = field.substring('business_profile.'.length)
          directorInfo.business_profile[property] = req.body[posted]
          continue
        }
        if (field.startsWith('address_kanji.')) {
          const property = field.substring('address_kanji.'.length)
          directorInfo.address_kanji = directorInfo.address_kanji || {}
          directorInfo.address_kanji[property] = req.body[posted]
        } else if (field.startsWith('address_kana.')) {
          const property = field.substring('address_kana.'.length)
          directorInfo.address_kana = directorInfo.address_kana || {}
          directorInfo.address_kana[property] = req.body[posted]
        } else if (field.startsWith('address.')) {
          const property = field.substring('address.'.length)
          directorInfo.address[property] = req.body[posted]
        } else if (field.startsWith('verification.document.')) {
          const property = field.substring('verification.document'.length)
          directorInfo.verification = directorInfo.verification || {}
          directorInfo.verification.document = directorInfo.verification.document || {}
          directorInfo.verification.document[property] = req.body[posted]
        } else if (field.startsWith('verification.additional_document.')) {
          const property = field.substring('verification.additional_document'.length)
          directorInfo.verification = directorInfo.verification || {}
          directorInfo.verification.additional_document = directorInfo.verification.additional_document || {}
          directorInfo.verification.additional_document[property] = req.body[posted]
        } else {
          const property = field.substring(''.length)
          directorInfo[property] = req.body[posted]
        }
      }
      for (const fullField of stripeAccount.requirements.eventually_due) {
        if (!fullField.startsWith(person.id)) {
          continue
        }
        const field = fullField.substring(`${person.id}.`.length)
        const posted = field.split('.').join('_')
        if (!req.body[posted]) {
          continue
        }
        if (field.startsWith('business_profile.')) {
          const property = field.substring('business_profile.'.length)
          directorInfo.business_profile[property] = req.body[posted]
          continue
        }
        if (field.startsWith('address_kanji.')) {
          const property = field.substring('address_kanji.'.length)
          directorInfo.address_kanji = directorInfo.address_kanji || {}
          directorInfo.address_kanji[property] = req.body[posted]
        } else if (field.startsWith('address_kana.')) {
          const property = field.substring('address_kana.'.length)
          directorInfo.address_kana = directorInfo.address_kana || {}
          directorInfo.address_kana[property] = req.body[posted]
        } else if (field.startsWith('address.')) {
          const property = field.substring('address.'.length)
          directorInfo.address[property] = req.body[posted]
        } else if (field.startsWith('verification.document.')) {
          const property = field.substring('verification.document'.length)
          directorInfo.verification = directorInfo.verification || {}
          directorInfo.verification.document = directorInfo.verification.document || {}
          directorInfo.verification.document[property] = req.body[posted]
        } else if (field.startsWith('verification.additional_document.')) {
          const property = field.substring('verification.additional_document'.length)
          directorInfo.verification = directorInfo.verification || {}
          directorInfo.verification.additional_document = directorInfo.verification.additional_document || {}
          directorInfo.verification.additional_document[property] = req.body[posted]
        } else {
          const property = field.substring(''.length)
          directorInfo[property] = req.body[posted]
        }
      }
      if (req.body.address_line2) {
        directorInfo.address = directorInfo.address || {}
        directorInfo.address.line2 = req.body.address_line2
      }
    }
    // TODO: these fields are optional but not represented in requirements
    // so when Stripe updates to have something like an 'optionally_due' array
    // the manual checks can be removed
    if (req.body.relationship_title) {
      directorInfo.relationship = directorInfo.relationship || {}
      directorInfo.relationship.title = req.body.relationship_title
    }
    if (req.body.relationship_executive) {
      directorInfo.relationship = directorInfo.relationship || {}
      directorInfo.relationship.executive = true
    }
    if (req.body.relationship_director) {
      directorInfo.relationship = directorInfo.relationship || {}
      directorInfo.relationship.director = true
    }
    if (req.body.relationship_owner) {
      directorInfo.relationship = directorInfo.relationship || {}
      directorInfo.relationship.owner = true
    }
    if (req.body.relationship_percent_ownership) {
      try {
        const percent = parseFloat(req.body.relationship_percent_ownership, 10)
        if ((!percent && percent !== 0) || percent > 100 || percent < 0) {
          throw new Error('invalid-relationship_percent_ownership')
        }
      } catch (s) {
        throw new Error('invalid-relationship_percent_ownership')
      }
      directorInfo.relationship = directorInfo.relationship || {}
      directorInfo.relationship.percent_ownership = req.body.relationship_percent_ownership
    }
    if (req.body.address_line2) {
      directorInfo.address = directorInfo.address || {}
      directorInfo.address.line2 = req.body.address_line2
    }
    if (req.body.address_country) {
      if (!connect.countryNameIndex[req.body.address_country]) {
        throw new Error('invalid-address_country')
      }
      directorInfo.address = directorInfo.address || {}
      directorInfo.address.country = req.body.address_country
    }
    if (req.body.address_state) {
      const states = connect.countryDivisions[req.body.address_country || stripeAccount.country]
      let found
      for (const state of states) {
        found = state.value === req.body.address_state
        if (found) {
          break
        }
      }
      if (!found) {
        throw new Error('invalid-address_state')
      }
      directorInfo.address = directorInfo.address || {}
      directorInfo.address.state = req.body.address_state
    }
    if (req.body.address_postal_code) {
      directorInfo.address = directorInfo.address || {}
      directorInfo.address.postal_code = req.body.address_postal_code
    }
    if (req.body.verification_document_back) {
      directorInfo.verification = directorInfo.verification || {}
      directorInfo.verification.document = directorInfo.verification.document || {}
      directorInfo.verification.document.back = req.body.verification_document_back
    }
    if (req.body.verification_document_front) {
      directorInfo.verification = directorInfo.verification || {}
      directorInfo.verification.document = directorInfo.verification.document || {}
      directorInfo.verification.document.front = req.body.verification_document_front
    }
    if (req.body.verification_additional_document_back) {
      directorInfo.verification = directorInfo.verification || {}
      directorInfo.verification.additional_document = directorInfo.verification.additional_document || {}
      directorInfo.verification.additional_document.back = req.body.verification_additional_document_back
    }
    if (req.body.verification_additional_document_front) {
      directorInfo.verification = directorInfo.verification || {}
      directorInfo.verification.additional_document = directorInfo.verification.additional_document || {}
      directorInfo.verification.additional_document.front = req.body.verification_additional_document_front
    }
    while (true) {
      try {
        const companyDirectorNow = await stripe.accounts.updatePerson(person.account, person.id, directorInfo, req.stripeKey)
        await stripeCache.delete(person.id)
        return companyDirectorNow
      } catch (error) {
        if (error.raw && error.raw.code === 'lock_timeout') {
          continue
        }
        if (error.raw && error.raw.code === 'rate_limit') {
          continue
        }
        if (error.raw && error.raw.code === 'account_invalid') {
          continue
        }
        if (error.raw && error.raw.code === 'idempotency_key_in_use') {
          continue
        }
        if (error.raw && error.raw.code === 'resource_missing') {
          continue
        }
        if (error.type === 'StripeConnectionError') {
          continue
        }
        if (error.type === 'StripeAPIError') {
          continue
        }
        if (error.message === 'An error occurred with our connection to Stripe.') {
          continue
        }
        if (error.message.startsWith('invalid-')) {
          throw error
        }
        if (process.env.DEBUG_ERRORS) { console.log(error) } throw new Error('unknown-error')
      }
    }
  }
}
