const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://fir-job-task.web.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASSWORD}@cluster0.cy95lx0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db("jobTaskDb").collection("users");
    const taskCollection = client.db("jobTaskDb").collection("tasks");

    // tasks related api
    app.get("/tasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/tasks/:email/to-do", async (req, res) => {
      const email = req.params.email;
      const query = { email: email, status: "to-do" };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/tasks/:email/ongoing", async (req, res) => {
      const email = req.params.email;
      const query = { email: email, status: "ongoing" };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/tasks/:email/completed", async (req, res) => {
      const email = req.params.email;
      const query = { email: email, status: "completed" };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/tasks", async (req, res) => {
      const info = req.body;
      const result = await taskCollection.insertOne(info);
      res.send(result);
    });

    // user related api
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.post("/new-users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existedUser = await userCollection.findOne(query);
      if (existedUser) {
        return res.send({ message: "user already existed", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job task is running");
});

app.listen(port, () => {
  console.log(`job task in running ${port}`);
});
