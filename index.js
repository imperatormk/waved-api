global.__basedir = __dirname
const dotenv = require('dotenv')
dotenv.config()

const fs = require('fs')
const https = require('http')
const app = require('./app')

/* const key = fs.readFileSync('/etc/letsencrypt/live/studiodoblo.de/privkey.pem')
const cert = fs.readFileSync('/etc/letsencrypt/live/studiodoblo.de/cert.pem')
const ca = fs.readFileSync('/etc/letsencrypt/live/studiodoblo.de/chain.pem')

const sslOpts = {
  key,
  cert,
  ca: [ca],
  requestCert: false,
  rejectUnauthorized: false
} */

const port = process.env.PORT || 3000
app.set('port', port)

require(__basedir + '/db')

const server = https.createServer(app)
server.listen(port)
console.log('Started on port ' + port)
