const express = require('express')
const compression = require('compression')
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport')

require('./passport')
const routes = require('./routes')

const app = express()

app.use(cors())
app.use(compression())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(passport.initialize())

app.use('/', routes)

module.exports = app