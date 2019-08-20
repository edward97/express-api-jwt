const express = require('express')
const logger = require('morgan')
const movies = require('./routes/movies')
const users = require('./routes/users')
const bodyParser = require('body-parser')
const mongoose = require('./config/database')
var jwt = require('jsonwebtoken')
const app = express()

app.set('secretKey', 'nodeRestApi')

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.json({
        "tutorial": "Build Rest API with Node.JS"
    })
})

// pubic route
app.use('/users', users)
// private route
app.use('/movies', validateUser, movies)
app.get('/favicon.ico', function (req, res) {
    res.sendStatus(204)
})

function validateUser(req, res, next) {
    jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function (err, decoded) {
        if (err) {
            res.json({
                status: "error",
                message: err.message,
                data: null
            })
        } else {
            // add userId to request
            req.body.userId = decoded.id
            next()
        }
    })
}

// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use(function (req, res, next) {
	var err = new Error()
    err.status = 404
    next(err)
})
// handle error
app.use(function (err, req, res, next) {
    // console.log(err)
    if (err.status === 404)
        res.status(404).json({
            status: err.status,
            message: "Not Found"
        })
    else
        res.status(500).json({
            status: 500,
            message: "Something looks wrong :("
        })
})

app.listen(3000, () => {
    console.log('Node server listening on port 3000')
})