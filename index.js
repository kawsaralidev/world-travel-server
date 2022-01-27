const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fzu0z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("world-travel");
        const blogsCollection = database.collection("addBlog");
        const usersCollection = database.collection("users");

        //new blogs post
        app.post("/addBlog", async (req, res) => {
            const blogs = req.body;
            const result = await blogsCollection.insertOne(blogs);
            console.log(result);
            res.json(result);
        });
        // get all blogs
        app.get("/addBlog", async (req, res) => {
            const cursor = blogsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);

            let blog;
            const count = await cursor.count();
            if (page) {
                blog = await cursor
                    .skip(page * size)
                    .limit(size)
                    .toArray();
            } else {
                blog = await cursor.toArray();
            }

            res.json({
                count,
                blog,
            });
        });

        //Find API - blog
        app.get("/addBlog/:blogId", async (req, res) => {
            const blogId = req.params.blogId;
            const query = { _id: ObjectId(blogId) };
            const result = await blogsCollection.findOne(query);
            res.json(result);
        });

        // users collection post
        app.post("/users", async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.json(result);
        });
        // update user
        app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // add admin role
        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            console.log("put", user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(result);
            res.json(result);
        });
        // find admin
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
    } finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello world travel!");
});

app.listen(port, () => {
    console.log(` listening ${port}`);
});
