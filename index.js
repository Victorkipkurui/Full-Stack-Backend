const config = require('./utils/config')
const logger = require('./utils/logger')
const express = require('express')
const morgan = require('morgan')
const { Person } = require('./models/contacts')

const app = express()

// Middleware for error handling
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

// Middleware setup
app.use(express.json())

// Custom morgan token to log request body
morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status - :response-time ms - Body: :body'))

// Get all persons
app.get('/api/persons', async (req, res, next) => {
  try {
    const persons = await Person.find({})
    res.status(200).json(persons)
  } catch (error) {
    next(error)
  }
})

// Get a person by ID
app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)
    if (person) {
      res.json(person)
    } else {
      res.status(404).json({ error: 'Person not found' })
    }
  } catch (error) {
    next(error)
  }
})

// Update a person's details
app.put('/api/persons/:id', async (req, res, next) => {
  const { name, number } = req.body
  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    )
    res.json(updatedPerson)
  } catch (error) {
    next(error)
  }
})

// Add a new person
app.post('/api/persons', async (req, res, next) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'Name or number is missing' })
  }

  try {
    const nameExists = await Person.findOne({ name })
    const numberExists = await Person.findOne({ number })

    if (nameExists) {
      return res.status(400).json({ error: 'Name already exists' })
    }

    if (numberExists) {
      return res.status(400).json({ error: 'Number already exists' })
    }

    const person = new Person({ name, number })
    const savedPerson = await person.save()

    res.json(savedPerson)
  } catch (error) {
    next(error)  // Pass the error to the error handler middleware
  }
})

// Delete a person
app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/info', async (req, res, next) => {
  try {
    const count = await Person.countDocuments()
    const now = new Date()
    res.send(`Phonebook has info for ${count} people <br/> ${now}`)
  } catch (error) {
    next(error)
  }
})

app.use(errorHandler)

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
