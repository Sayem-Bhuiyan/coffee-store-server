const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rwumv8m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db('coffeeDB').collection('coffee');
    const userCollection = client.db('coffeeDB').collection('user')

    app.get('/coffee', async(req, res) => {
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    });

    app.get('/coffee/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await coffeeCollection.findOne(query);
      res.send(result)
    })

    app.post('/coffee', async(req, res) => {
        const coffee = req.body;
        console.log(coffee);

        const result = await coffeeCollection.insertOne(coffee);
        res.send(result)
    })

    app.put('/coffee/:id', async(req, res) => {
      const id = req.params.id;
      const coffee = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updatedCoffee = {
        $set: {
          coffeeName : coffee.name,
          quantity: coffee.quantity,
          supplierName: coffee.supplier,
          taste: coffee.taste,
          categoryNamr: coffee.category,
          details: coffee.details,
          photo: coffee.photo
        }
      }
      const result = await coffeeCollection.updateOne(filter, updatedCoffee, options);
      res.send(result);
    })

    app.delete('/coffee/:id', async(req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await coffeeCollection.deleteOne(query);
      res.send(result)
    })

    // User related apis
    app.get('/user', async(req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/user', async(req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    app.patch('/user', async(req, res) => {
      const user = req.body;
      const filter = {email: user.email};
      const updatedUser = {
        $set: {
          lastSignIn: user.lastSignIn,
        }
      }
      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result)
    })

    

    app.delete('/user/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// middleware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send("Coffee making server is runnig")
})

app.listen(port, () => {
    console.log(`The running port is : ${port}!!`);
})