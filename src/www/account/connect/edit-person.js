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
  const person = await global.api.user.connect.Person.get(req)
  if (!person) {
    throw new Error('invalid-personid')
  }
  if (!person.requirements.currently_due.length &&
      !person.requirements.eventually_due.length) {
    throw new Error('invalid-person')
  }
  person.stripePublishableKey = global.stripePublishableKey
  req.query.stripeid = person.account
  const stripeAccount = await global.api.user.connect.StripeAccount.get(req)
  if (!stripeAccount) {
    throw new Error('invalid-stripeid')
  }
  if (stripeAccount.business_type === 'individual') {
    throw new Error('invalid-stripe-account')
  }
  req.data = { stripeAccount, person }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, req.data.person, 'person')
  const removeElements = []
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
    if (messageTemplate === 'success' || req.error) {
      removeElements.push('form-container')
      for (const id of removeElements) {
        const element = doc.getElementById(id)
        element.parentNode.removeChild(element)
      }
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (req.data.stripeAccount.country !== 'JP') {
    removeElements.push(
      'gender-container',
      'kanji-personal-address-container',
      'kana-personal-address-container',
      'kana-personal-information-container',
      'kanji-personal-information-container')
  } else {
    removeElements.push('personal-address-container')
  }
  let requiresAddress = false
  for (const requirement of req.data.stripeAccount.requirements.currently_due) {
    requiresAddress = requirement.startsWith(`${req.data.person.id}.address.`)
    if (requiresAddress) {
      break
    }
  }
  if (!requiresAddress && removeElements.indexOf('personal-address-container') === -1) {
    removeElements.push('personal-address-container')
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf(`${req.data.person.id}.address.state`) > -1) {
    const personalStates = connect.countryDivisions[req.data.stripeAccount.country]
    dashboard.HTML.renderList(doc, personalStates, 'state-option', 'address_state')
  } else if (removeElements.indexOf('personal-address-container') === -1) {
    removeElements.push('state-container', 'state-container-bridge')
    if (req.data.stripeAccount.requirements.currently_due.indexOf(`${req.data.person.id}.address.line1`) === -1) {
      removeElements.push('line1-container', 'line2-container')
    }
    if (req.data.stripeAccount.requirements.currently_due.indexOf(`${req.data.person.id}.address.city`) === -1) {
      removeElements.push('city-container')
    }
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf(`${req.data.person.id}.id_number`) === -1) {
    removeElements.push('id_number-container')
  }
  if (req.method === 'GET') {
    for (const fullField of req.data.stripeAccount.requirements.currently_due) {
      if (!fullField.startsWith(req.data.person.id)) {
        continue
      }
      const field = fullField.substring(`${req.data.person.id}.`.length)
      const posted = field.split('.').join('_')
      const element = doc.getElementById(posted)
      if (!element) {
        continue
      }
    }
  } else if (req.body) {
    for (const field in req.body) {
      const element = doc.getElementById(field)
      if (!element) {
        continue
      }
      if (element.tag === 'input') {
        element.setAttribute('value', req.body[field] || '')
      } else if (element.tag === 'select') {
        dashboard.HTML.setSelectedOptionByValue(doc, element, req.body[field] || '')
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
  if (req.query && req.query.message === 'success') {
    return renderPage(req, res)
  }
  for (const fullField of req.data.stripeAccount.requirements.currently_due) {
    if (!fullField.startsWith(req.data.person.id)) {
      continue
    }
    const field = fullField.substring(`${req.data.person.id}.`.length)
    const posted = field.split('.').join('_')
    if (!req.body[posted]) {
      if (field === 'address.line2' ||
          field === 'relationship.title' ||
          field === 'relationship.executive' ||
          field === 'relationship.director' ||
          field === 'relationship.owner' ||
          field === 'verification.document' ||
          field === 'verification.additional_document') {
        continue
      }
      return renderPage(req, res, `invalid-${posted}`)
    }
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf(`${req.data.person.id}.verification.document`) > -1) {
    if (!req.uploads || (
      !req.uploads.verification_document_front &&
        !req.body.verification_document_front)) {
      return renderPage(req, res, 'invalid-verification_document_front')
    }
    if (!req.uploads || (
      !req.uploads.verification_document_back &&
      !req.body.verification_document_back)) {
      return renderPage(req, res, 'invalid-verification_document_back')
    }
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf(`${req.data.person.id}.verification.additional.document`) > -1) {
    if (!req.uploads || (
      !req.uploads.verification_additional_document_front &&
      !req.body.verification_additional_document_front)) {
      return renderPage(req, res, 'invalid-verification_additional_document_front')
    }
    if (!req.uploads || (
      !req.uploads.verification_additional_document_back &&
      !req.body.verification_additional_document_back)) {
      return renderPage(req, res, 'invalid-verification_additional_document_back')
    }
  }
  try {
    await global.api.user.connect.UpdatePerson.patch(req)
  } catch (error) {
    if (error.message.startsWith('invalid-')) {
      return renderPage(req, res, error.message)
    }
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `person?personid=${req.query.personid}`
    })
    return res.end()
  }
}