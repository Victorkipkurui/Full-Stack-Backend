const mongoose = require('mongoose');

const password = encodeURIComponent(process.argv[2]);
const command = process.argv[3];
const name = process.argv[4];
const number = process.argv[5];


const url = `mongodb+srv://ruckuz:${password}@cluster0.eckz5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0;`

mongoose.set('strictQuery', false);

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const addPerson = async (name, number) => {
  try {
    const person = new Person({ name, number });
    const savedPerson = await person.save();
    console.log(`Added new person: ${savedPerson.name}, ${savedPerson.number}`);
  } catch (error) {
    console.error('Error adding person:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

const listPersons = async () => {
  try {
    const results = await Person.find({});
    console.log('Phonebook:');
    results.forEach((person) => console.log(`${person.name} ${person.number}`));
  } catch (error) {
    console.error('Error fetching entries:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

if (command === 'add') {
  if (!name || !number) {
    console.log('value cannot be empty');
    process.exit(1);
  }
  addPerson(name, number);
} else if (command === 'list') {
  listPersons();
}