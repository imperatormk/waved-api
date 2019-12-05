const mailgun = require('mailgun-js')

const {
  DOMAIN, 
  MAILGUN_API_KEY,
  MAILGUN_REGION,
  MAILGUN_NAME,
  MAILGUN_SENDER
} = process.env

const euHost = 'api.eu.mailgun.net'
const config = {
  apiKey: MAILGUN_API_KEY,
  domain: DOMAIN
}
if (MAILGUN_REGION === 'EU') config.host = euHost
const mg = mailgun(config)

const sendEmail = ({ to, subject, template, vars }) => {
  const data = {
    from: `${MAILGUN_NAME} <${MAILGUN_SENDER}>`,
    to,
    subject,
    template,
    'h:X-Mailgun-Variables': JSON.stringify(vars)
  }

  return new Promise((resolve, reject) => {
    mg.messages().send(data, (error, body) => {
      if (error) return reject(error)
      return resolve(body)
    })
  })
}

module.exports = {
  sendEmail
}