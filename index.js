global.__basedir = __dirname
const dotenv = require('dotenv')
dotenv.config()

const http = require('http')
const app = require('./app')

const port = process.env.PORT || 3000
app.set('port', port)

require(__basedir + '/db')

const server = http.createServer(app)
server.listen(port)
console.log('Started on port ' + port)