const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mgtwv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', (req, res) => {
    res.send('This is Server for Endgame.')
})

async function run(){
    try{
        await client.connect();
        console.log('database connected');
        const database = client.db("endgame");
        const servicesCollection = database.collection("services");
        const orderCollection = database.collection("Orders");
        const userCollection = database.collection("users");
        const reviewCollection = database.collection("review");

        //Load API 
        app.get('/services', async (req, res) => {
            const result = await servicesCollection.find({}).toArray();
            res.send(result);
        })
        //Load Single API 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })
        //Load Single bookappoinment API 
        app.get('/bookappoinment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })
        // delete form cars
        app.delete('/deleteservices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await servicesCollection.deleteOne(query);
            res.send(result);
        })
        //add product API 
        app.post('/addservices', async (req, res) => {
            const orders = req.body;
            const result = await servicesCollection.insertOne(orders);
            res.send(result);
        })
       
    //    --------------- cpied from --------------
        // Add Orders API
        app.post('/order', async (req, res) => {
            const orders = req.body;
            const result = await orderCollection.insertOne(orders);
            res.send(result);
        })
        
        // get my orders
        app.get('/myorder/:email', async (req, res) => {
            const email = req.params.email;
            const result = await orderCollection.find({ email : email }).toArray();
            res.send(result);
        })
        // delete order
        app.delete('/deleteOrde/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })
        // get all orders
        app.get('/allorder', async (req, res) => {
            const result = await orderCollection.find().toArray();
            res.send(result);
        })
        // delete form all order
        app.delete('/deleteaddOrdre/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        // Update form all order
        app.put('/updateOrdre/:id', async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const query = { _id :ObjectId(id)}
            const result = await orderCollection.updateOne(query, {
                $set: {
                    status: updateInfo.ship
                }
            });
            res.send(result);
        })
        
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.send({admin: isAdmin});
        })


        // add user name and email
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.send(result);
        })
        
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' }};
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        // Review api
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        })
        // Add Review
        app.post('/addreview', async (req, res) => {
            const orders = req.body;
            const result = await reviewCollection.insertOne(orders);
            res.send(result);
        })
        
    //    --------------- cpied from --------------

        
    }
    finally{
        // await client.close();
    }

}run().catch(console.dir);


app.listen(port, () => {
    console.log('Running the Server on Port', port);
})