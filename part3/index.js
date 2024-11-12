const express = require("express");
const app = express();
const port = 3001;
const morgan = require("morgan");

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

morgan.token('post-data', (req) => {
    if (req.method === 'POST') {
      return JSON.stringify(req.body);
    }
    return '';
  });
  

// Middleware
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'));






// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find(person => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.get("/info", (req, res) => {
  const date = new Date();
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`
  );
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter(person => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  console.log(body);

  if (!body.name || !body.number) {
    return res.status(400).json({error: "name or number missing"});
  }

  if (persons.find(person => person.name === body.name)) {
    return res.status(400).json({error: "name must be unique"});
  }

  if (persons.find(person => person.number === body.number)) {
    return res.status(400).json({error: "number must be unique"});
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  res.json(person);
});



const generateId = () => {
  const random = Math.floor(Math.random() * 1000);
  return String(random);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: "unknown endpoint"});
};



app.use(unknownEndpoint);


// Server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
