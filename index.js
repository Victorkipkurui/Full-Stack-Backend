const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(morgan('tiny'));

morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status - :response-time ms - Body: :body'));

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end();
  }
});

app.get('/info', (request, response) => {
  const now = new Date();
  response.send(`phonebook has info for ${persons.length} people <br/> ${now}`)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateUniqueId =()=> {
  return Math.random().toString(36).substr(2, 9);
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  const nameExists = persons.some(person => person.name === body.name);
  const numberExists = persons.some(person => person.number === body.number);

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'value cannot be empty' 
    })
  }

  if (nameExists) {
    return response.status(400).json({ 
      error: 'Name already exists' 
    });
  }

  if (numberExists) {
    return response.status(400).json({ 
      error: 'Number already exists' 
    });
  }
 
  const person = {
    name : body.name,
    number: body.number,
    id: generateUniqueId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})