const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;
if (!url) {
  console.error('MONGODB_URI environment variable is not defined!');
  process.exit(1);
}
console.log('connecting to ', url)

mongoose.connect(url)
.then(result => {
  console.log('connected to MongoDB')
})
.catch(error => {
  console.log('error connecting to MongoDB:', error.message)
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

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

module.exports = {
  addPerson,
  listPersons,
  Person,
}