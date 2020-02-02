const connect = require('../../../../../index.js')
const dashboard = require('@userdashboard/dashboard')
const stripe = require('stripe')()
stripe.setApiVersion(global.stripeAPIVersion)
if (global.maxmimumStripeRetries) {
  stripe.setMaxNetworkRetries(global.maximumStripeRetries)
}
stripe.setTelemetryEnabled(false)

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.stripeid) {
      throw new Error('invalid-stripeid')
    }
    const stripeAccount = await global.api.user.connect.StripeAccount.get(req)
    if (!stripeAccount) {
      throw new Error('invalid-stripeid')
    }
    if (stripeAccount.business_type !== 'company' ||
      stripeAccount.metadata.submitted) {
      throw new Error('invalid-stripe-account')
    }
    req.body = req.body || {}
    if (global.stripeJS === 3 && !req.body.token) {
      throw new Error('invalid-token')
    }
    const ownerInfo = {}
    if (global.stripeJS === 3) {
      ownerInfo.person_token = req.body.token
    } else {
      ownerInfo.metadata = {
        token: false
      }
      ownerInfo.relationship = {
        owner: true
      }
      const requirementsRaw = await dashboard.Storage.read(`stripeid:requirements:owner:${req.query.stripeid}`)
      const requirements = JSON.parse(requirementsRaw)
      for (const field of requirements.currently_due) {
        const posted = field.split('.').join('_')
        if (!req.body[posted]) {
          if (field === 'address.line2' ||
              field === 'relationship.title' ||
              field === 'executive' ||
              field === 'director' ||
              field === 'verification.document' ||
              field === 'verification.additional_document' ||
              field === 'owner') {
            continue
          }
          throw new Error(`invalid-${posted}`)
        }
      }
      let validateDOB
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
      if (req.uploads && req.uploads.verification_document_front) {
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
      } else if (requirements.currently_due.indexOf('verification.document') > -1) {
        throw new Error('invalid-verification_document_front')
      }
      if (req.uploads && req.uploads.verification_document_back) {
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
      } else if (requirements.currently_due.indexOf('verification.document') > -1) {
        throw new Error('invalid-verification_document_back')
      }
      for (const field of requirements.currently_due) {
        const posted = field.split('.').join('_')
        if (!req.body[posted]) {
          throw new Error(`invalid-${posted}`)
        }
        if (field.startsWith('address.')) {
          const property = field.substring('address.'.length)
          ownerInfo.address = ownerInfo.address || {}
          ownerInfo.address[property] = req.body[posted]
          continue
        } else if (field.startsWith('verification.document.')) {
          if (global.stripeJS) {
            continue
          }
          const property = field.substring('verification.document'.length)
          ownerInfo.verification = ownerInfo.verification || {}
          ownerInfo.verification.document = ownerInfo.verification.document || {}
          ownerInfo.verification.document[property] = req.body[posted]
        } else if (field.startsWith('verification.additional_document.')) {
          if (global.stripeJS) {
            continue
          }
          const property = field.substring('verification.additional_document'.length)
          ownerInfo.verification = ownerInfo.verification || {}
          ownerInfo.verification.additional_document = ownerInfo.verification.additional_document || {}
          ownerInfo.verification.additional_document[property] = req.body[posted]
        } else if (field.startsWith('dob.')) {
          const property = field.substring('dob.'.length)
          ownerInfo.dob = ownerInfo.dob || {}
          ownerInfo.dob[property] = req.body[posted]
        } else if (field.startsWith('relationship.')) {
          const property = field.substring('relationship.'.length)
          ownerInfo.relationship = ownerInfo.relationship || {}
          ownerInfo.relationship[property] = req.body[posted]
          continue
        } else {
          const property = field
          if (property === 'executive' || property === 'director') {
            continue
          }
          ownerInfo[property] = req.body[posted]
        }
      }
      for (const field of requirements.eventually_due) {
        if (requirements.currently_due.indexOf(field) > -1) {
          continue
        }
        const posted = field.split('.').join('_')
        if (req.body[posted]) {
          if (field.startsWith('address.')) {
            const property = field.substring('address.'.length)
            ownerInfo.address = ownerInfo.address || {}
            ownerInfo.address[property] = req.body[posted]
            continue
          } else if (field.startsWith('verification.document.')) {
            if (global.stripeJS) {
              continue
            }
            const property = field.substring('verification.document'.length)
            ownerInfo.verification = ownerInfo.verification || {}
            ownerInfo.verification.document = ownerInfo.verification.document || {}
            ownerInfo.verification.document[property] = req.body[posted]
          } else if (field.startsWith('verification.additional_document.')) {
            if (global.stripeJS) {
              continue
            }
            const property = field.substring('verification.additional_document'.length)
            ownerInfo.verification = ownerInfo.verification || {}
            ownerInfo.verification.additional_document = ownerInfo.verification.additional_document || {}
            ownerInfo.verification.additional_document[property] = req.body[posted]
          } else if (field.startsWith('dob.')) {
            const property = field.substring('dob.'.length)
            ownerInfo.dob = ownerInfo.dob || {}
            ownerInfo.dob[property] = req.body[posted]
          } else if (field.startsWith('relationship.')) {
            const property = field.substring('relationship.'.length)
            ownerInfo.relationship = ownerInfo.relationship || {}
            ownerInfo.relationship[property] = req.body[posted]
            continue
          } else {
            const property = field
            if (property === 'executive' || property === 'director') {
              continue
            }
            ownerInfo[property] = req.body[posted]
          }
        }
      }
      // TODO: these fields are optional but not represented in requirements
      // so when Stripe updates to have something like an 'optionally_due' array
      // the manual checks can be removed
      if (req.body.relationship_title) {
        ownerInfo.relationship = ownerInfo.relationship || {}
        ownerInfo.relationship.title = req.body.relationship_title
      }
      if (req.body.relationship_executive) {
        ownerInfo.relationship = ownerInfo.relationship || {}
        ownerInfo.relationship.executive = true
      }
      if (req.body.relationship_director) {
        ownerInfo.relationship = ownerInfo.relationship || {}
        ownerInfo.relationship.director = true
      }
      if (req.body.relationship_owner) {
        ownerInfo.relationship = ownerInfo.relationship || {}
        ownerInfo.relationship.owner = true
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
        ownerInfo.relationship = ownerInfo.relationship || {}
        ownerInfo.relationship.percent_ownership = req.body.relationship_percent_ownership
      }
      if (req.body.address_line2) {
        ownerInfo.address = ownerInfo.address || {}
        ownerInfo.address.line2 = req.body.address_line2
      }
      if (req.body.address_country) {
        if (!connect.countryNameIndex[req.body.address_country]) {
          throw new Error('invalid-address_country')
        }
        ownerInfo.address = ownerInfo.address || {}
        ownerInfo.address.country = req.body.address_country
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
        ownerInfo.address = ownerInfo.address || {}
        ownerInfo.address.state = req.body.address_state
      }
      if (req.body.address_postal_code) {
        ownerInfo.address = ownerInfo.address || {}
        ownerInfo.address.postal_code = req.body.address_postal_code
      }
      if (req.body.verification_document_back) {
        ownerInfo.verification = ownerInfo.verification || {}
        ownerInfo.verification.document = ownerInfo.verification.document || {}
        ownerInfo.verification.document.back = req.body.verification_document_back
      }
      if (req.body.verification_document_front) {
        ownerInfo.verification = ownerInfo.verification || {}
        ownerInfo.verification.document = ownerInfo.verification.document || {}
        ownerInfo.verification.document.front = req.body.verification_document_front
      }
      if (req.body.verification_additional_document_back) {
        ownerInfo.verification = ownerInfo.verification || {}
        ownerInfo.verification.additional_document = ownerInfo.verification.additional_document || {}
        ownerInfo.verification.additional_document.back = req.body.verification_additional_document_back
      }
      if (req.body.verification_additional_document_front) {
        ownerInfo.verification = ownerInfo.verification || {}
        ownerInfo.verification.additional_document = ownerInfo.verification.additional_document || {}
        ownerInfo.verification.additional_document.front = req.body.verification_additional_document_front
      }
    }
    while (true) {
      try {
        console.log('updating owner', ownerInfo, req.body)
        const owner = await stripe.accounts.createPerson(req.query.stripeid, ownerInfo, req.stripeKey)
        await dashboard.Storage.write(`${req.appid}/map/personid/stripeid/${owner.id}`, req.query.stripeid)
        await dashboard.StorageList.add(`${req.appid}/stripeAccount/owners/${req.query.stripeid}`, owner.id)
        return owner
      } catch (error) {
        if (error.raw && error.raw.param === 'person_token') {
          throw new Error('invalid-token')
        }
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
        if (process.env.DEBUG_ERRORS) { console.log(error) } throw new Error('unknown-error')
      }
    }
  }
}
