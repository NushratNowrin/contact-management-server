const express = require('express')
const cors = require('cors')
require("dotenv").config();
const excel = require('exceljs');
const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r1co4vf.mongodb.net/?retryWrites=true&w=majority`;

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
    const database = client.db("contactsDB");
    const ContactsCollection = database.collection("contacts");

    // get the contacts data from DB
    app.get('/api/contacts',async(req, res) => {
        const query = {};
        const cursor = ContactsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    // get the descending ordered contacts data from DB
    app.get('/api/contacts/descending',async(req, res) => {
        const query = {};
        const cursor = ContactsCollection.find(query).sort({userName: -1});
        const result = await cursor.toArray();
        res.send(result);
    })

    // get the ascending ordered contacts data from DB
    app.get('/api/contacts/ascending',async(req, res) => {
        const query = {};
        const cursor = ContactsCollection.find(query).sort({userName: 1});
        const result = await cursor.toArray();
        res.send(result);
    })

    // Post to the contacts
    app.post('/api/contacts', async(req, res) => {
        const contact= req.body;
        console.log(contact);
        const result = await ContactsCollection.insertOne(contact);
        res.send(result);
    })

    // Delete one contact
    app.delete('/api/contacts/:id', async(req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = {_id: new ObjectId(id)}
        const result = await ContactsCollection.deleteOne(query);
        res.send(result);
    })

    // Update contact
    app.put('/api/contacts/:id', async(req, res) =>{
        const id = req.params.id;
        const contact = req.body;
        console.log(id, contact);
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true}
        const updatedUser = {
            $set: {
                userName: contact.userName ,
                number: contact.number,
                email: contact.email
            }
        }
        const result = await ContactsCollection.updateOne(filter, updatedUser, options);
        res.send(result)
    })

    // get single contact by id
    app.get('/api/contacts/:id', async(req, res) =>{
        const id = req.params.id;
        console.log(id);
        const query = {_id: new ObjectId(id)}
        const contact = await ContactsCollection.findOne(query);
        res.send(contact);
    })

    // Download Excel file
    // app.get('/api/contacts/download', async (req, res) => {
    //     const userEmail = req.query.email;

    //     // const user = await usersCollection.findOne({ email: userEmail });
    //     const contacts = await ContactsCollection
    //         .find({
    //             email: userEmail,
    //         })
    //         .toArray();

    //     const workbook = new excel.Workbook();
    //     const worksheet = workbook.addWorksheet('Contacts Data');

    //     worksheet.columns = [
    //         { header: 'Name', key: 'name', width: 25 },
    //         { header: 'Phone', key: 'number', width: 25 },
    //         { header: 'Email', key: 'email', width: 40 },
    //     ];

    //     contacts.forEach((contact) => {
    //         worksheet.addRow({
    //             name: contact.userName,
    //             number: contact.number,
    //             email: contact.email,
    //         });
    //     });

    //     res.setHeader(
    //         'Content-Type',
    //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    //     );
    //     res.setHeader(
    //         'Content-Disposition',
    //         'attachment; filename=' + 'contacts_data.xlsx'
    //     );

    //     return workbook.xlsx.write(res).then(() => {
    //         res.status(200).end();
    //     });
    // });


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Contact Management server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
