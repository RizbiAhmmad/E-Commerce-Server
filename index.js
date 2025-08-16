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
    const brandsCollection = database.collection("brands");
    const sizesCollection = database.collection("sizes");
    const colorsCollection = database.collection("colors");
    const productsCollection = database.collection("products");
    const reviewsCollection = database.collection("reviews");
    const cartCollection = database.collection("cart");
    const ordersCollection = database.collection("orders");
    const couponsCollection = database.collection("coupons");

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

    // --- Create brand
    app.post("/brands", async (req, res) => {
      const brand = req.body; // { name, logo, status, createdByEmail }
      const exists = await brandsCollection.findOne({ name: brand.name });
      if (exists)
        return res.send({
          acknowledged: true,
          insertedId: null,
          message: "Brand exists",
        });
      const result = await brandsCollection.insertOne(brand);
      res.send(result);
    });

    // --- Get all brands
    app.get("/brands", async (req, res) => {
      const result = await brandsCollection.find().toArray();
      res.send(result);
    });

    // --- Update brand
    app.put("/brands/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body; // { name, logo, status }
      const result = await brandsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { name: data.name, logo: data.logo, status: data.status } }
      );
      res.send(result);
    });

    // --- Delete brand
    app.delete("/brands/:id", async (req, res) => {
      const id = req.params.id;
      const result = await brandsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Add Size
    app.post("/sizes", async (req, res) => {
      const size = req.body;
      const result = await sizesCollection.insertOne(size);
      res.send(result);
    });

    // Get all Sizes
    app.get("/sizes", async (req, res) => {
      const result = await sizesCollection.find().toArray();
      res.send(result);
    });

    // Delete Size
    app.delete("/sizes/:id", async (req, res) => {
      const id = req.params.id;
      const result = await sizesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Update Size
    app.put("/sizes/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: data.name,
          status: data.status,
        },
      };
      const result = await sizesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Add a new color
    app.post("/colors", async (req, res) => {
      const color = req.body; // expects: { name, hex, status }
      const existing = await colorsCollection.findOne({ name: color.name });
      if (existing) {
        return res.send({ message: "Color already exists", insertedId: null });
      }
      const result = await colorsCollection.insertOne(color);
      res.send(result);
    });

    // Get all colors
    app.get("/colors", async (req, res) => {
      const result = await colorsCollection.find().toArray();
      res.send(result);
    });

    // Delete a color by ID
    app.delete("/colors/:id", async (req, res) => {
      const id = req.params.id;
      const result = await colorsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Update a color
    app.put("/colors/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body; // expects: { name, hex, status }
      const result = await colorsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name: data.name,
            hex: data.hex,
            status: data.status,
          },
        }
      );
      res.send(result);
    });

    // Add a new product
    app.post("/products", async (req, res) => {
      try {
        const product = req.body; // includes image URL, user email, etc.
        const result = await productsCollection.insertOne(product);
        res.send(result);
      } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({ message: "Failed to add product" });
      }
    });

    // Get all products
    app.get("/products", async (req, res) => {
      try {
        const result = await productsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send({ message: "Failed to fetch products" });
      }
    });

    // Update a product by ID
    app.put("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedProduct = req.body; // full product object with updated images array etc.

        // Validate id
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid product ID" });
        }

        // Prepare update document
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            name: updatedProduct.name,
            description: updatedProduct.description,
            specification: updatedProduct.specification,
            categoryId: updatedProduct.categoryId,
            subcategoryId: updatedProduct.subcategoryId,
            brandId: updatedProduct.brandId,
            sizes: updatedProduct.sizes,
            colors: updatedProduct.colors,
            purchasePrice: updatedProduct.purchasePrice,
            oldPrice: updatedProduct.oldPrice,
            newPrice: updatedProduct.newPrice,
            stock: updatedProduct.stock,
            status: updatedProduct.status,
            variant: updatedProduct.variant,
            images: updatedProduct.images, // updated array of image URLs
            email: updatedProduct.email,
          },
        };

        const result = await productsCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Product not found" });
        }

        res.send({ acknowledged: true, modifiedCount: result.modifiedCount });
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send({ message: "Failed to update product" });
      }
    });

    app.delete("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await productsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send({ message: "Failed to delete product" });
      }
    });

    // Get single product by ID
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid product ID" });
        }
        const product = await productsCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!product) {
          return res.status(404).send({ message: "Product not found" });
        }
        res.send(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send({ message: "Failed to fetch product" });
      }
    });

    app.post("/reviews", async (req, res) => {
      try {
        const { productId, rating, text, name, email } = req.body;

        if (!productId || !rating || !text) {
          return res.status(400).send({ message: "Missing required fields" });
        }

        const review = {
          productId: new ObjectId(productId),
          rating,
          text,
          name: name || "Anonymous",
          email: email || null,
          createdAt: new Date(),
        };

        const result = await reviewsCollection.insertOne(review);

        if (result.acknowledged) {
          review._id = result.insertedId; // add id to the review object
          res.send({ acknowledged: true, review });
        } else {
          res
            .status(500)
            .send({ acknowledged: false, message: "Failed to add review" });
        }
      } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/reviews", async (req, res) => {
      const { productId } = req.query;
      let query = {};
      if (productId) {
        query.productId = new ObjectId(productId);
      }
      const reviews = await reviewsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(reviews);
    });

    app.delete("/reviews/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await reviewsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).send({ message: "Failed to delete review" });
      }
    });

    app.post("/cart", async (req, res) => {
      try {
        const cartItem = req.body; // name, email, productId, quantity, etc.
        const result = await cartCollection.insertOne(cartItem);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to add to cart" });
      }
    });

    app.get("/cart", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      try {
        const cartItems = await cartCollection.find({ email }).toArray();
        res.send(cartItems);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to get cart items" });
      }
    });

    app.patch("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const { quantity, selected } = req.body; // optionally selected
      const updateDoc = {};
      if (quantity !== undefined) updateDoc.quantity = quantity;
      if (selected !== undefined) updateDoc.selected = selected;

      try {
        const result = await cartCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateDoc }
        );
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update cart item" });
      }
    });

    app.delete("/cart/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await cartCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Cart item not found" });
        }

        res.send({ acknowledged: true, deletedCount: result.deletedCount });
      } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).send({ message: "Failed to delete cart item" });
      }
    });

    app.post("/orders", async (req, res) => {
      try {
        const order = req.body; // full order data
        const result = await ordersCollection.insertOne(order);
        res.send({ acknowledged: true, insertedId: result.insertedId });
      } catch (error) {
        console.error("Failed to place order:", error);
        res.status(500).send({ message: "Failed to place order" });
      }
    });

    // Get orders for a specific user
    app.get("/orders", async (req, res) => {
      try {
        const email = req.query.email;
        let query = {};

        // If email query is provided, filter orders by email
        if (email) {
          query.email = email;
        }

        const orders = await ordersCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.send(orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        res.status(500).send({ message: "Failed to fetch orders" });
      }
    });

    // Delete an order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const result = await ordersCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Update order status
    app.patch("/orders/:id/status", async (req, res) => {
      try {
        const { status } = req.body;
        const id = req.params.id;

        const result = await ordersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: status } }
        );

        if (result.modifiedCount > 0) {
          res.send({ success: true, message: "Status updated" });
        } else {
          res.status(404).send({ success: false, message: "Order not found" });
        }
      } catch (error) {
        console.error("Failed to update status:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

    app.post("/coupons", async (req, res) => {
      try {
        const coupon = req.body;

        // Optional: add a createdAt timestamp
        coupon.createdAt = new Date();

        const result = await couponsCollection.insertOne(coupon);
        res.send({ acknowledged: true, insertedId: result.insertedId });
      } catch (error) {
        console.error("Failed to add coupon:", error);
        res.status(500).send({ message: "Failed to add coupon" });
      }
    });

    // Get all coupons or filter by status
    app.get("/coupons", async (req, res) => {
      try {
        const status = req.query.status; // optional query param
        let query = {};

        if (status) {
          query.status = status;
        }

        const coupons = await couponsCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        res.send(coupons);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
        res.status(500).send({ message: "Failed to fetch coupons" });
      }
    });

    // Update a coupon
    app.put("/coupons/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;

        const result = await couponsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        res.send(result);
      } catch (error) {
        console.error("Failed to update coupon:", error);
        res.status(500).send({ message: "Failed to update coupon" });
      }
    });

    // Delete a coupon by id
    app.delete("/coupons/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await couponsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        console.error("Failed to delete coupon:", error);
        res.status(500).send({ message: "Failed to delete coupon" });
      }
    });

  app.post("/apply-coupon", async (req, res) => {
  try {
    const codeRaw = req.body.code;
    const totalAmount = Number(req.body.totalAmount) || 0;

    if (!codeRaw) {
      return res.status(400).send({ message: "Coupon code is required" });
    }

    // use exactly as stored
    const code = codeRaw.trim();

    const coupon = await couponsCollection.findOne({ code, status: "active" });
    if (!coupon) {
      return res.status(404).send({ message: "Invalid or inactive coupon" });
    }

    const now = new Date();

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).send({ message: "Coupon is not active yet" });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
      return res.status(400).send({ message: "Coupon has expired" });
    }

    const minReq = Number(coupon.minOrderAmount) || 0;
    if (minReq && totalAmount < minReq) {
      return res
        .status(400)
        .send({ message: `Minimum order amount is ${minReq}` });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (totalAmount * Number(coupon.discountValue || 0)) / 100;
    } else if (coupon.discountType === "fixed") {
      discount = Number(coupon.discountValue || 0);
    }

    if (discount < 0) discount = 0;
    if (discount > totalAmount) discount = totalAmount;

    const finalAmount = Math.max(totalAmount - discount, 0);

    return res.send({
      success: true,
      code: coupon.code,
      discount: Math.round(discount),
      finalAmount,
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Failed to apply coupon:", error);
    res.status(500).send({ message: "Failed to apply coupon" });
  }
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
