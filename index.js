require('dotenv').config()
const {listPersons, Person} = require('./models/contacts')
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
app.get('/', (req, res) => {
  res.send('Welcome to Phonebook!');
});

app.get('/api/persons', (req, res) => {
  try {
    const persons = listPersons();
    res.status(200).json(persons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
});

app.get('/info', (request, response) => {
  const now = new Date();
  response.send(`phonebook has info for ${persons.length} people <br/> ${now}`)
})

app.delete('/api/persons/:id', async (request, response) => {
  const id = request.params.id;
  try {
    const deletedPerson = await Person.findByIdAndDelete(id);

    if (!deletedPerson) {
      return response.status(404).json({ error: 'Person not found' });
    }
    response.status(204).end();
  } catch (error) {
    console.error('Error deleting person:', error.message);
    response.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/api/persons', async (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'value cannot be empty' });
  }
  try {
    const nameExists = await Person.findOne({ name: body.name });
    const numberExists = await Person.findOne({ number: body.number });

    if (nameExists) {
      return response.status(400).json({ error: 'Name already exists' });
    }

    if (numberExists) {
      return response.status(400).json({ error: 'Number already exists' });
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    });

    const savedPerson = await person.save();

    response.json(savedPerson);
  } catch (error) {
    console.error('Error saving person:', error.message);
    response.status(500).json({ error: 'Something went wrong' });
  }
});


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})