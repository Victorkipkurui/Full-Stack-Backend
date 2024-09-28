require('dotenv').config()
const { Person } = require('./models/contacts')
const express = require('express')
const morgan = require('morgan')
const app = express()
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(express.json())
app.use(morgan('tiny'))

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status - :response-time ms - Body: :body'))

app.get('/', (req, res) => {
  res.send('Welcome to Phonebook!')
})

app.get('/api/persons', async (req, res, next) => {
  try {
    const persons = await Person.find({})
    res.status(200).json(persons)
  } catch (error) { next(error)}
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  Person.findByIdAndUpdate(req.params.id,{ name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).json({ error: 'page does not exist' })
      }
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.countDocuments()
    .then(count => {
      const now = new Date()
      res.send(`Phonebook has info for ${count} people <br/> ${now}`)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', async (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', async (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'value cannot be empty' })
  }
  try {
    const nameExists = await Person.findOne({ name: body.name })
    const numberExists = await Person.findOne({ number: body.number })

    if (nameExists) {
      return res.status(400).json({ error: 'Name already exists' })
    }

    if (numberExists) {
      return res.status(400).json({ error: 'Number already exists' })
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    })

    const savedPerson = await person.save()

    res.json(savedPerson)
  } catch (error) {
    console.error('Error saving person:', error.message)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})