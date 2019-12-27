const connect = require('../../../../index.js')
const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.stripeid) {
    throw new Error('invalid-stripeid')
  }
  const stripeAccount = await global.api.user.connect.StripeAccount.get(req)
  if (!stripeAccount) {
    throw new Error('invalid-stripeid')
  }
  if (stripeAccount.business_type === 'individual' ||
      stripeAccount.metadata.submitted) {
    throw new Error('invalid-stripe-account')
  }
  const registration = connect.MetaData.parse(stripeAccount.metadata, 'registration') || {}
  req.data = { stripeAccount, registration }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query['return-url']) {
      return dashboard.Response.redirect(req, res, decodeURI(req.query['return-url']))
    } else {
      return dashboard.Response.redirect(req, res, `/account/connect/stripe-account?stripeid=${req.query.stripeid}`)
    }
  } else if (req.error) {
    messageTemplate = req.error
  }
  req.data.stripeAccount.stripePublishableKey = global.stripePublishableKey
  const doc = dashboard.HTML.parse(req.route.html, req.data.stripeAccount, 'stripeAccount')
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
  if (req.data.stripeAccount.requirements.currently_due.indexOf('company.tax_id') === -1) {
    removeElements.push('company_tax_id-container')
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf('company.phone') === -1) {
    removeElements.push('company_phone-container')
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf('business_profile.url') === -1) {
    removeElements.push('business_profile_url-container')
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf('business_profile.mcc') === -1) {
    removeElements.push('business_profile_mcc-container')
  } else {
    const mccList = connect.getMerchantCategoryCodes(req.language)
    dashboard.HTML.renderList(doc, mccList, 'mcc-option', 'business_profile_mcc')
  }
  if (req.data.stripeAccount.country !== 'JP') {
    removeElements.push('JP-company-name-container', 'JP-company-address-container')
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf('company.address.state') > -1) {
    const companyStates = connect.countryDivisions[req.data.stripeAccount.country]
    dashboard.HTML.renderList(doc, companyStates, 'state-option', 'company_address_state')
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf('company.verification.document.front') === -1) {
    removeElements.push('upload-container')
  }
  if (req.method === 'GET') {
    for (const field in req.data.registration) {
      const element = doc.getElementById(field)
      if (!element) {
        continue
      }
      if (element.tag === 'input') {
        element.setAttribute('value', req.data.registration[field] || '')
      } else if (element.tag === 'select') {
        dashboard.HTML.setSelectedOptionByValue(doc, field, req.data.registration[field] || '')
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
        dashboard.HTML.setSelectedOptionByValue(doc, field, req.body[field] || '')
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
  for (const field of req.data.stripeAccount.requirements.currently_due) {
    const posted = field.split('.').join('_')
    if (!req.body[posted]) {
      if (field === 'company.address.line2' ||
        field === 'company.verification.document.front' ||
        field === 'company.verification.document.back' ||
        (field === 'business_profile.url' && req.body.business_profile_product_description) ||
        (field === 'business_profile.product_description' && req.body.business_profile_url)) {
        continue
      }
      if (field === 'business_profile.product_description' && !req.body.business_profile_url) {
        return renderPage(req, res, 'invalid-business_profile_url')
      }
      return renderPage(req, res, `invalid-${posted}`)
    }
  }
  if (req.data.stripeAccount.requirements.currently_due.indexOf('company.verification.document.front') > -1) {
    if (!req.data.registration.company_verification_document_front &&
       (!req.uploads || !req.uploads.company_verification_document_front)) {
      return renderPage(req, res, 'invalid-company_verification_document_front')
    }
    if (!req.data.registration.company_verification_document_back &&
      (!req.uploads || !req.uploads.company_verification_document_back)) {
      return renderPage(req, res, 'invalid-company_verification_document_back')
    }
  }
  try {
    await global.api.user.connect.UpdateCompanyRegistration.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    if (error.message.startsWith('invalid-')) {
      return renderPage(req, res, error.message)
    }
    return renderPage(req, res, error.message)
  }
}
