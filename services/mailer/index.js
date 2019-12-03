const mailer = require('./mailgun')
const templates = require('./emailTemplates')

const sendConfirmationEmail = ({ email, username }) => {
  const { name, subject } = templates['post-register']
  const data = {
    to: email,
    subject,
    template: name,
    vars: {
      username: username
    }
  }
  return mailer.sendEmail(data)
}

module.exports = {
  sendConfirmationEmail
}