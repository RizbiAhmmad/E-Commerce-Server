const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwqfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection

    const database = client.db("E-Commerce");
    const usersCollection = database.collection("users");
    const categoriesCollection = database.collection("categories");
    const subcategoriesCollection = database.collection("subcategories");

    // POST endpoint to save user data (with role)
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      // console.log(req.headers);
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get role by email
    app.get("/users/role", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ role: null, message: "User not found" });
      }
      res.send({ role: user.role });
    });

    // PATCH endpoint to make a user an admin by ID
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // DELETE endpoint to remove a user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Add a new category
    app.post("/categories", async (req, res) => {
      const category = req.body;
      const result = await categoriesCollection.insertOne(category);
      res.send(result);
    });

    // Get all categories
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });

    // Delete a category by ID
    app.delete("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoriesCollection.deleteOne(query);
      res.send(result);
    });

    // Update a category by ID
    app.put("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCategory = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: updatedCategory.name,
          image: updatedCategory.image,
          status: updatedCategory.status,
        },
      };
      const result = await categoriesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

   // Add Subcategory
    app.post("/subcategories", async (req, res) => {
      const subcategory = req.body;
      const result = await subcategoriesCollection.insertOne(subcategory);
      res.send(result);
    });

    // Get Subcategories (optionally filtered by category)
    app.get("/subcategories", async (req, res) => {
      const { categoryId } = req.query;
      const query = categoryId ? { categoryId } : {};
      const result = await subcategoriesCollection.find(query).toArray();
      res.send(result);
    });

    // Delete Subcategory
    app.delete("/subcategories/:id", async (req, res) => {
      const id = req.params.id;
      const result = await subcategoriesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Update Subcategory
    app.put("/subcategories/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: data.name,
          status: data.status,
          categoryId: data.categoryId,
        },
      };
      const result = await subcategoriesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to you in E-Commerce Website API");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
