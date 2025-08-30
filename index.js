const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const SSLCommerzPayment = require("sslcommerz-lts");

const store_id = process.env.SSL_ID;
const store_passwd = process.env.SSL_PASS;
const is_live = false; // Sandbox mode

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
    const posCartCollection = database.collection("pos_cart");
    const posOrdersCollection = database.collection("pos_orders");
    const expenseCategoriesCollection = database.collection("expense_categories");
    const expensesCollection = database.collection("expenses");

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

    // Get a single category by ID
    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const category = await categoriesCollection.findOne(query);
      res.send(category);
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

    // Create brand
    app.post("/brands", async (req, res) => {
      const brand = req.body;
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
      const data = req.body;
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
      const color = req.body;
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
      const data = req.body;
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
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        res.send(result);
      } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({ message: "Failed to add product" });
      }
    });

    // Get all products or filter by categoryId
    app.get("/products", async (req, res) => {
      try {
        const { categoryId, subcategoryId, search } = req.query;

        let query = {};

        if (categoryId) {
          query.categoryId = categoryId;
        }
        if (subcategoryId) {
          query.subcategoryId = subcategoryId;
        }
        if (search) {
          query.name = { $regex: search, $options: "i" };
        }

        const result = await productsCollection.find(query).toArray();
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
        const updatedProduct = req.body;

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
            purchasePrice: Number(updatedProduct.purchasePrice),
            oldPrice: Number(updatedProduct.oldPrice),
            newPrice: Number(updatedProduct.newPrice),
            stock: Number(updatedProduct.stock),
            status: updatedProduct.status,
            variant: updatedProduct.variant,
            images: updatedProduct.images,
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
        const order = req.body;
        order.createdAt = new Date();
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

    // Update order status & adjust stock
    app.patch("/orders/:id/status", async (req, res) => {
      try {
        const { status } = req.body;
        const id = req.params.id;

        // Find order by id
        const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
        if (!order) {
          return res
            .status(404)
            .send({ success: false, message: "Order not found" });
        }

        // Update order status
        const result = await ordersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: status } }
        );

        // If status is delivered, reduce stock
        if (status === "delivered" && order.cartItems) {
          for (const item of order.cartItems) {
            await productsCollection.updateOne(
              { _id: new ObjectId(item.productId) },
              { $inc: { stock: -Number(item.quantity) } }
            );
          }
        }

        res.send({
          success: true,
          message: "Status updated & stock adjusted if delivered",
        });
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

        const coupon = await couponsCollection.findOne({
          code,
          status: "active",
        });
        if (!coupon) {
          return res
            .status(404)
            .send({ message: "Invalid or inactive coupon" });
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

    app.post("/sslcommerz/init", async (req, res) => {
      try {
        const {
          orderId,
          totalAmount,
          fullName,
          email,
          phone,
          address,
          cartItems,
        } = req.body;

        const data = {
          total_amount: totalAmount,
          currency: "BDT",
          tran_id: `tran_${Date.now()}`, // must be unique
          success_url: "http://localhost:5000/sslcommerz/success",
          fail_url: "http://localhost:5000/sslcommerz/fail",
          cancel_url: "http://localhost:5000/sslcommerz/cancel",
          ipn_url: "http://localhost:5000/sslcommerz/ipn",
          shipping_method: "Courier",
          product_name: "Order Payment",
          product_category: "Ecommerce",
          product_profile: "general",
          order_id: orderId,

          // Customer info
          cus_name: fullName,
          cus_email: email,
          cus_add1: address,
          cus_add2: address,
          cus_city: "Dhaka",
          cus_state: "Dhaka",
          cus_postcode: "1000",
          cus_country: "Bangladesh",
          cus_phone: phone,
          cus_fax: phone,

          // Shipping info (must include!)
          ship_name: fullName,
          ship_add1: address,
          ship_add2: address,
          ship_city: "Dhaka",
          ship_state: "Dhaka",
          ship_postcode: 1000,
          ship_country: "Bangladesh",
          cartItems: JSON.stringify(cartItems),
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const apiResponse = await sslcz.init(data);

        if (apiResponse?.GatewayPageURL) {
          res.json({ GatewayPageURL: apiResponse.GatewayPageURL });
        } else {
          res
            .status(400)
            .json({ message: "Failed to get GatewayPageURL", apiResponse });
        }
      } catch (err) {
        console.error("SSLCommerz Init Error:", err);
        res
          .status(500)
          .json({ message: "SSLCommerz init failed", error: err.message });
      }
    });

    // Success/Fail/Cancel routes
    app.all("/sslcommerz/success", async (req, res) => {
      try {
        // SSLCommerz might send data in req.body or req.query
        const paymentData = req.body || req.query || {};

        console.log("Payment Success:", paymentData);

        // Safely destructure
        const {
          tran_id,
          status,
          firstname,
          email,
          phone,
          cus_add1,
          cartItems,
          amount,
        } = paymentData;

        if (!tran_id) {
          return res
            .status(400)
            .send("Transaction ID missing from payment data");
        }

        // Prepare order data
        const orderData = {
          fullName: firstname || "Customer",
          email: email || "no-email@example.com",
          phone: phone || "N/A",
          address: cus_add1 || "N/A",
          payment: "online",
          tran_id,
          status:
            status === "VALID" || status === "VALIDATED" ? "paid" : "failed",
          cartItems: cartItems ? JSON.parse(cartItems) : [],
          subtotal: amount || 0,
          shippingCost: 0, // optional
          discount: 0, // optional
          total: amount || 0,
          createdAt: new Date(),
        };

        // Save to DB
        await ordersCollection.insertOne(orderData);

        // Redirect to frontend success page
        res.redirect(
          `http://localhost:5173/payment-success?tran_id=${tran_id}`
        );
      } catch (err) {
        console.error("Payment Success Error:", err);
        res.status(500).send("Failed to process payment");
      }
    });

    app.post("/sslcommerz/fail", (req, res) => {
      console.log("Payment Failed:", req.body);
      res.redirect("http://localhost:5173/payment-fail");
    });

    app.post("/sslcommerz/cancel", (req, res) => {
      console.log("Payment Cancelled:", req.body);
      res.redirect("http://localhost:5173/payment-cancel");
    });

    // Add item to POS cart
    app.post("/pos/cart", async (req, res) => {
      try {
        const cartItem = req.body; // productId, quantity, price, etc.
        const result = await posCartCollection.insertOne(cartItem);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to add to POS cart" });
      }
    });

    // Get all POS cart items
    app.get("/pos/cart", async (req, res) => {
      try {
        const cartItems = await posCartCollection.find().toArray();
        res.send(cartItems);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch POS cart" });
      }
    });

    // Update quantity
    app.patch("/pos/cart/:id", async (req, res) => {
      const { quantity } = req.body;
      try {
        const result = await posCartCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { quantity } }
        );
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update POS cart item" });
      }
    });

    // Delete item from POS cart
    app.delete("/pos/cart/:id", async (req, res) => {
      try {
        const result = await posCartCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to delete POS cart item" });
      }
    });

    // Place POS order
    app.post("/pos/orders", async (req, res) => {
      try {
        const order = req.body;
        order.orderType = "pos";
        order.status = "paid";
        order.createdAt = new Date();

        // 1. Save order
        const result = await posOrdersCollection.insertOne(order);

        // 2. Update stock for each product
        for (const item of order.cartItems) {
          await productsCollection.updateOne(
            { _id: new ObjectId(item.productId) },
            { $inc: { stock: -Number(item.quantity) } }
          );
        }

        // 3. Clear POS cart
        await posCartCollection.deleteMany({});

        res.send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to save POS order" });
      }
    });

    // Get all POS orders
    app.get("/pos/orders", async (req, res) => {
      try {
        const orders = await posOrdersCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(orders);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch POS orders" });
      }
    });

    app.delete("/pos/orders/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await posOrdersCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).send({ message: "Failed to delete order" });
      }
    });

    app.get("/sales-report", async (req, res) => {
      try {
        const deliveredOrders = await ordersCollection
          .find({ status: "delivered" })
          .toArray();

        const posOrders = await posOrdersCollection.find().toArray();

        const allOrders = [...deliveredOrders, ...posOrders];

        // filter by date
        const filterByDate = (orders, period) => {
          const now = new Date();
          return orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            if (period === "today") {
              return orderDate.toDateString() === now.toDateString();
            } else if (period === "week") {
              const weekAgo = new Date();
              weekAgo.setDate(now.getDate() - 7);
              return orderDate >= weekAgo;
            } else if (period === "month") {
              return (
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
              );
            }
            return true;
          });
        };

        // Total calculations
        const calcTotal = (orders) =>
          orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

        res.send({
          allTime: calcTotal(allOrders),
          thisMonth: calcTotal(filterByDate(allOrders, "month")),
          thisWeek: calcTotal(filterByDate(allOrders, "week")),
          today: calcTotal(filterByDate(allOrders, "today")),
          allOrders,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to generate sales report" });
      }
    });

    // Add Expense Category
    app.post("/expense-categories", async (req, res) => {
      const expenseCategory = req.body;
      const result = await expenseCategoriesCollection.insertOne(
        expenseCategory
      );
      res.send(result);
    });

    // Get Expense Categories
    app.get("/expense-categories", async (req, res) => {
      const result = await expenseCategoriesCollection.find().toArray();
      res.send(result);
    });

    // Delete Expense Category
    app.delete("/expense-categories/:id", async (req, res) => {
      const id = req.params.id;
      const result = await expenseCategoriesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Update Expense Category
    app.put("/expense-categories/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      try {
        const result = await expenseCategoriesCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              name: updatedData.name,
              status: updatedData.status,
            },
          }
        );

        if (result.modifiedCount > 0) {
          res.send({
            success: true,
            message: "Expense category updated successfully",
          });
        } else {
          res.send({
            success: false,
            message: "No changes made or category not found",
          });
        }
      } catch (error) {
        console.error("Error updating expense category:", error);
        res.status(500).send({
          success: false,
          message: "Failed to update expense category",
        });
      }
    });

    // Add Expense
app.post("/expenses", async (req, res) => {
  const expense = req.body;
  try {
    const result = await expensesCollection.insertOne(expense);
    res.send(result);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).send({ message: "Failed to add expense" });
  }
});

// Get All Expenses
app.get("/expenses", async (req, res) => {
  try {
    const result = await expensesCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).send({ message: "Failed to fetch expenses" });
  }
});

// Update Expense
app.put("/expenses/:id", async (req, res) => {
  const id = req.params.id;
  const updatedExpense = req.body;
  try {
    const result = await expensesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedExpense }
    );
    res.send(result);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).send({ message: "Failed to update expense" });
  }
});

// Delete Expense
app.delete("/expenses/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await expensesCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).send({ message: "Failed to delete expense" });
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
