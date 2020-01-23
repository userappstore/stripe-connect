const stripe = require('stripe')()
stripe.setApiVersion(global.stripeAPIVersion)
if (global.maxmimumStripeRetries) {
  stripe.setMaxNetworkRetries(global.maximumStripeRetries)
}
stripe.setTelemetryEnabled(false)
const stripeCache = require('../../../../stripe-cache.js')

module.exports = async (stripeEvent, req) => {
  const person = stripeEvent.data.object
  let exists
  while (true) {
    if (global.testEnded) {
      return
    }
    if (person.metadata.template) {
      // delete 'template' persons that are created to view the requirements
      while (true) {
        try {
          await stripe.accounts.deletePerson(person.account, person.id, req.stripeKey)
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
          if (process.env.DEBUG_ERRORS) { console.log(error) } throw new Error('unknown-error')
        }
      }
      // delete 'template' account created to ascertain person requirements
      const persons = await stripe.accounts.listPersons(person.account, req.stripeKey)
      if (persons.data && !persons.data.length) {
        await stripe.accounts.del(person.account)
      }
      return
    }
    try {
      exists = await stripe.accounts.retrievePerson(person.account, person.id, req.stripeKey)
      if (exists) {
        await stripeCache.update(exists)
      }
      return
    } catch (error) {
      if (error.raw && error.raw.code === 'lock_timeout') {
        continue
      }
      if (error.raw && error.raw.code === 'rate_limit') {
        continue
      }
      if (error.raw && error.raw.code === 'idempotency_key_in_use') {
        continue
      }
      if (error.type === 'StripeConnectionError') {
        continue
      }
      return
    }
  }
}
