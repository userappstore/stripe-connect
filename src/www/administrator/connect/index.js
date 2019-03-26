const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const stripeAccounts = await global.api.administrator.connect.StripeAccounts._get(req)
  for (const stripeAccount of stripeAccounts) {
    stripeAccount.createdFormatted = dashboard.Timestamp.date(stripeAccount.metadata.created)
    if (stripeAccount.payouts_enabled) {
      stripeAccount.statusMessage = 'verified'
    } else if (stripeAccount.verification.disabled_reason) {
      stripeAccount.statusMessage = `${stripeAccount.verification.disabled_reason}`
    } else if (stripeAccount.verification.details_code) {
      stripeAccount.statusMessage = `${stripeAccount.verification.details_code}`
    } else if (stripeAccount.metadata.submitted) {
      stripeAccount.statusMessage = 'under-review'
    } else {
      stripeAccount.statusMessage = 'not-submitted'
    }
  }
  req.data = { stripeAccounts }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.stripeAccounts && req.data.stripeAccounts.length) {
    dashboard.HTML.renderTable(doc, req.data.stripeAccounts, 'stripe-account-row', 'stripe-accounts-table')
    for (const stripeAccount of req.data.stripeAccounts) {
      if (stripeAccount.individual) {
        const businessName = doc.getElementById(`business-name-${stripeAccount.id}`)
        businessName.parentNode.removeChild(businessName)
      } else {
        const individualName = doc.getElementById(`individual-name-${stripeAccount.id}`)
        individualName.parentNode.removeChild(individualName)
      }
      if (stripeAccount.statusMessage) {
        dashboard.HTML.renderTemplate(doc, null, stripeAccount.statusMessage, `account-status-${stripeAccount.id}`)
      }
    }
  } else {
    const registrationsContainer = doc.getElementById('registrations-container')
    registrationsContainer.parentNode.removeChild(registrationsContainer)
  }
  return dashboard.Response.end(req, res, doc)
}
