const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT
const Contact = require('./models/contacts')

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)

morgan.token('post-data', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})


// Middleware
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/info', (req, res) => {
  const date = new Date()
  res.send(
    `<p>Phonebook has info for ${Contact.length} people</p><p>${date}</p>`
  )
})

app.get('/api/persons', (req, res) => {
  Contact.find({}).then(contacts => {
    res.json(contacts)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Contact.findById(id).then(contact => {
    contact ? res.json(contact) : res.status(404).json({ error: 'Contact not found' })
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Contact.findByIdAndDelete(id).then(result => {
    result ? res.status(204).end() : res.status(404).json({ error: 'Contact not found' })
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const { name, number } = req.body

  Contact.findByIdAndUpdate(id, { name, number }, { new: true, runValidators: true, context: 'query' }).then(updatedContact => {
    updatedContact ? res.json(updatedContact) : res.status(404).json({ error: 'Contact not found' })
  }).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const contact = new Contact({
    name: body.name,
    number: body.number,
  })

  contact.save().then(savedContact => {
    res.json(savedContact)
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error) return response.status(400).send({ error: error.message })

  // if (error.name === 'CastError') {
  //   return response.status(400).send({ error: 'malformatted id' })
  // } else if (error.name === 'ValidationError') {
  //   return response.status(400).json({ error: error.message })
  // }

  next(error)
}

// Error handling Middleware
app.use(unknownEndpoint)
app.use(errorHandler)

// Server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
