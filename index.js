const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8sb7n8j.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function setupServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const productsCollection = client.db("productsDB").collection("products");
    const categoriesCollection = client
      .db("productsDB")
      .collection("categories");
    const cartProductCollection = client
      .db("productsDB")
      .collection("CartProducts");

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/cart/products", async (req, res) => {
      const cursor = cartProductCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/cart/products/:userEmail", async (req, res) => {
      const userEmail = req.params.userEmail;
      const query = { userEmail: userEmail };
      const result = await cartProductCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/cart/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartProductCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/products/:brandName", async (req, res) => {
      const categoryName = req.params.brandName;
      const query = { brand: categoryName };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    app.get("/cart/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;
      const newProduct = {
        $set: {
          image: updateProduct.image,
          name: updateProduct.name,
          brand: updateProduct.brand,
          type: updateProduct.type,
          price: updateProduct.price,
          rating: updateProduct.rating,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        newProduct,
        options
      );
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });
    
    app.post("/cart/products", async (req, res) => {
      const newProduct = req.body;
      const result = await cartProductCollection.insertOne(newProduct);
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find({}).toArray();
      res.json(categories);
    });

    app.get("/", (req, res) => {
      res.send("Brand Shop server is running");
    });

    app.listen(port, () => {
      console.log(`Brand Shop is running on port: ${port}`);
    });
  } catch (error) {
    console.error("Error setting up the server:", error);
  }
}

setupServer();
