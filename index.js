const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5vqlaat.mongodb.net/?retryWrites=true&w=majority`;

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
    const productCollection = client.db("emaJohnDB").collection("products");
    app.get("/products", async (req, res) => {
      const page= parseInt(req.query.page) || 0;
      const limit= parseInt(req.query.limit) || 10;
      const skip = page * limit;

      res.send(await productCollection.find().skip(skip).limit(limit).toArray());
    });
    app.get("/totalProducts", async (req, res) => {
      res.send({
        totalProducts: await productCollection.estimatedDocumentCount(),
      });
    });
    app.post("/productsByIds", async(req, res) => {
      res.send( await productCollection.find({ _id: {$in: req.body.map(id => new ObjectId(id))}}).toArray());
    })
    // Send a ping to confirm a successful connection

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ema-john-server is running!");
});

app.listen(port, () => {
  console.log(`ema-john-server is running on port ${port}`);
});
