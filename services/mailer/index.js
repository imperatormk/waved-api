const mailer = require('./mailgun')
const templates = require('./emailTemplates')

const sendRegisterConfirmationEmail = (email, { username }) => {
  const { name, subject } = templates['post-register']
  const data = {
    to: email,
    subject,
    template: name,
    vars: {
      username
    }
  }
  return mailer.sendEmail(data)
}

const sendOrderConfirmationEmail = (email, { username, song }) => {
  const { name, subject } = templates['post-order']
  const data = {
    to: email,
    subject,
    template: name,
    vars: {
      username,
      song
    }
  }
  return mailer.sendEmail(data)
}

module.exports = {
  sendRegisterConfirmationEmail,
  sendOrderConfirmationEmail
}