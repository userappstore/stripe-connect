const connect = require('../../../../index.js')
const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.personid) {
    throw new Error('invalid-personid')
  }
  const owner = await global.api.user.connect.BeneficialOwner.get(req)
  owner.stripePublishableKey = global.stripePublishableKey
  req.query.stripeid = owner.stripeid
  const stripeAccount = await global.api.user.connect.StripeAccount.get(req)
  if (stripeAccount.metadata.submitted) {
    throw new Error('invalid-stripe-account')
  }
  req.data = { stripeAccount, owner }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query['return-url']) {
      return dashboard.Response.redirect(req, res, decodeURI(req.query['return-url']))
    }
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
  }
  const removeElements = []
  const doc = dashboard.HTML.parse(req.route.html, req.data.owner, 'owner')
  if (global.stripeJS !== 3) {
    removeElements.push('stripe-v3', 'client-v3', 'connect-v3', 'handler-v3')
  } else {
    res.setHeader('content-security-policy',
      'default-src * \'unsafe-inline\'; ' +
    `style-src https://uploads.stripe.com/ https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/v3/ https://js.stripe.com/v2/ ${global.dashboardServer}/public/ 'unsafe-inline'; ` +
    `script-src * https://uploads.stripe.com/ https://q.stripe.com/ https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/v3/ https://js.stripe.com/v2/ ${global.dashboardServer}/public/ 'unsafe-eval' 'unsafe-inline'; ` +
    'frame-src * https://uploads.stripe.com/ https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/ \'unsafe-inline\'; ' +
    'connect-src https://uploads.stripe.com/ https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/ \'unsafe-inline\'; ')
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      removeElements.push('form-container')
      for (const id of removeElements) {
        const element = doc.getElementById(id)
        element.parentNode.removeChild(element)
      }
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (req.data.owner.requirements.currently_due.indexOf('relationship.owner.id_number') === -1) {
    removeElements.push('relationship_owner_id_number-container')
  }
  if (req.data.owner.requirements.currently_due.indexOf('relationship.owner.email') === -1) {
    removeElements.push('relationship_owner_email-container')
  }
  if (req.method === 'GET') {
    const selectedCountry = req.data.owner.relationship_owner_address_country
    const states = connect.countryDivisions[selectedCountry]
    dashboard.HTML.renderList(doc, states, 'state-option', 'relationship_owner_address_state')
    dashboard.HTML.renderList(doc, connect.countryList, 'country-option', 'relationship_owner_address_country')
    dashboard.HTML.setSelectedOptionByValue(doc, 'relationship_owner_address_country', selectedCountry)
    for (const field of req.data.owner.requirements.currently_due) {
      const posted = field.split('.').join('_')
      if (!req.data.owner[posted]) {
        if (field === 'relationship.owner.verification.front' ||
            field === 'relationship.owner.verification.back') {
          continue
        }
        const element = doc.getElementById(posted)
        if (element.attr.tag === 'input') {
          if (element.attr.tag === 'checkbox') {
            element.attr.checked = req.data.owner[posted]
            continue
          }
          element.setAttribute('value', req.data.owner[posted])
        } else if (element.attr.tag === 'select') {
          dashboard.HTML.setSelectedOptionByValue(doc, element.attr.id, req.data.owner[posted])
        }
      }
    }
  } else if (req.body) {
    const selectedCountry = req.body.relationship_owner_address_country || req.data.owner.relationship_owner_address_country
    const states = connect.countryDivisions[selectedCountry]
    dashboard.HTML.renderList(doc, states, 'state-option', 'relationship_owner_address_state')
    dashboard.HTML.renderList(doc, connect.countryList, 'country-option', 'relationship_owner_address_country')
    dashboard.HTML.setSelectedOptionByValue(doc, 'relationship_owner_address_country', selectedCountry)
    for (const field of req.data.owner.requirements.currently_due) {
      const posted = field.split('.').join('_')
      if (!req.body[posted]) {
        continue
      }
      const el = doc.getElementById(posted)
      if (!el) {
        continue
      }
      switch (el.tag) {
        case 'select':
          dashboard.HTML.setSelectedOptionByValue(doc, el.attr.id, req.body[posted])
          continue
        case 'input':
          if (el.attr.type === 'radio') {
            el.attr.checked = 'checked'
          } else {
            el.attr.value = req.body[posted]
          }
          continue
      }
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body || req.body.refresh === 'true') {
    return renderPage(req, res)
  }
  if (global.stripeJS === 3 && !req.body.token) {
    return renderPage(req, res, 'invalid-token')
  }
  for (const field of req.data.owner.requirements.currently_due) {
    const posted = field.split('.').join('_')
    if (!field) {
      if (field === 'relationship.owner.verification.front' ||
          field === 'relationship.owner.verification.back') {
        continue
      }
      return renderPage(req, res, `invalid-${posted}`)
    }
  }
  if (!req.body.relationship_owner_address_country || !connect.countryNameIndex[req.body.relationship_owner_address_country]) {
    delete (req.body.relationship_owner_address_country)
    return renderPage(req, res, 'invalid-relationship_owner_address_country')
  }
  if (!req.body.relationship_owner_address_state) {
    return renderPage(req, res, 'invalid-relationship_owner_address_state')
  }
  const states = connect.countryDivisions[req.body.relationship_owner_address_country]
  let found
  for (const state of states) {
    found = state.value === req.body.relationship_owner_address_state
    if (found) {
      break
    }
  }
  if (!found) {
    return renderPage(req, res, 'invalid-relationship_owner_address_state')
  }
  try {
    await global.api.user.connect.UpdateBeneficialOwner.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
