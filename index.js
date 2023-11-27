const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const port = process.env.PORT || 5000;
//midelware
app.use(express.json());
app.use(cors());

//nodemailer code here
const transporter = nodemailer.createTransport({
  host: "smtp.forwardemail.net",
  port: 5000,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "rakib2020.tkg@gmail.com",
    pass: "REPLACE-WITH-YOUR-GENERATED-PASSWORD",
  },
});

//mongodb code here
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.inzz8jh.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    //all database collections here
    const userCollection = client.db("TKGBDSDB").collection("donar");
    const applicationForBloodCollection = client
      .db("TKGBDSDB")
      .collection("applicationBlood");
      const galleryImageCollection = client.db("TKGBDSDB").collection("galleryImage");

    //all users data inserted form database
    app.put("/donar/:email", async (req, res) => {
      const email = req.params.email;
      const userInfo = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updataDoc = {
        $set: userInfo,
      };
      const result = await userCollection.updateOne(query, updataDoc, options);
      res.send(result);
    });
    //all donar data get form database;
    app.get("/get-all-user", async (req, res) => {
      const allUser = await userCollection.find().toArray();
      const user = allUser.filter(donar => donar.role !== 'admin')
      res.send(user);
    });
    app.get("/get-all-donar", async (req, res) => {
      const allDonar = await userCollection.find().toArray();
      const result = allDonar.filter((donar) => donar.role === "donar");
      res.send(result);
    });
    /**get one user query on email form database */
    app.get("/get-one-user/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    /************ get single donar data from database *******/
    app.get("/get-single-donar-byId/:id", async (req, res) => {
      const donarId = req.params.id;
      const query = { _id: new ObjectId(donarId) };
      const singleDonar = await userCollection.findOne(query);
      res.send(singleDonar);
    });
    /*******get filtred donar data from database *********/
    app.post("/get-filter", async (req, res) => {
      const info = req.body;
      if (info.bloodGroup === "" && info.district === "" && info.area === "") {
        const donars = await userCollection.find().toArray();
        const result = donars.filter((donar) => donar.role === "donar");
        res.send(result);
        return;
      } else if (info.district === "" && info.area === "") {
        const query = { bloodGroup: info.bloodGroup };
        const result = await userCollection.find(query).toArray();
        res.send(result);
        return;
      } else if (info.bloodGroup === "" && info.area === "") {
        const query = { district: info.district };
        const donars = await userCollection.find(query).toArray();
        const result = donars.filter((donar) => donar.role === "donar");
        res.send(result);
        return;
      } else if (info.district === "" && info.district === "") {
        const query = { area: info.area };
        const donars = await userCollection.find(query).toArray();
        const result = donars.filter((donar) => donar.role === "donar");
        res.send(result);
        return;
      } else if (info.bloodGroup === "") {
        const query = { area: info.area, district: info.district };
        const donars = await userCollection.find(query).toArray();
        const result = donars.filter((donar) => donar.role === "donar");
        res.send(result);
        return;
      } else if (info.area === "") {
        const query = { bloodGroup: info.bloodGroup, district: info.district };
        const donars = await userCollection.find(query).toArray();
        const result = donars.filter((donar) => donar.role === "donar");
        res.send(result);
        return;
      } else if (info.district === "") {
      } else {
        const query = {
          bloodGroup: info.bloodGroup,
          district: info.district,
          area: info.area,
        };
        const donars = await userCollection.find(query).toArray();
        const result = donars.filter((donar) => donar.role === "donar");
        res.send(result);
      }
    });
    /** get useAdmin in userCollection from database */
    app.get("/isAdmin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });
    app.get("/isDonar/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { donar: user?.role === "donar" };
      res.send(result);
    });

    /** applicationForBloodCollection Work Here */
    app.post("/post-applicattionForBlood", async (req, res) => {
      const infomrmation = req.body;
      const result = await applicationForBloodCollection.insertOne(
        infomrmation
      );
      res.send(result);
    });
    app.get("/get-all-aplications", async (req, res) => {
      const allAplications = await applicationForBloodCollection
        .find()
        .toArray();
      res.send(allAplications);
    });
    app.get("/application-blood/:email", async (req, res) => {
      const appliedEmail = req.params.email;
      const query = { appliedPersonEmail: appliedEmail };
      const result = await applicationForBloodCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/request-blood/:email", async (req, res) => {
      const donarEmail = req.params.email;
      const query = { donarEmail: donarEmail };
      const result = await applicationForBloodCollection.find(query).toArray();
      res.send(result);
    });
    app.put("/request-blood-update/:id", async (req, res) => {
      const Id = req.params.id;
      const userInfo = req.body;
      const query = { _id: new ObjectId(Id) };
      const options = { upsert: true };
      const updataDoc = {
        $set: userInfo,
      };
      const result = await applicationForBloodCollection.updateOne(
        query,
        updataDoc,
        options
      );
      res.send(result);
    });
    /// gallery images collection
    app.post('/post-gallery-image', async (req, res) => {
      const galleryImage = req.body;
      const result = await galleryImageCollection.insertOne(galleryImage);
      res.send(result);
    })
    app.get('/gallery-image',async (req, res)=>{
      const result = await galleryImageCollection.find().toArray()
      res.send(result);
    })
    //nodemailer code here;
    app.post("/send-email-data", async (req, res) => {
      const {
        রোগীরসমস্যা,
        রক্তেরপরিমাণ,
        রক্তদানেরতারিখ,
        রক্তদানেরসময়,
        রক্তদানেরস্থান,
        যোগাযোগ,
        appliedPersonName,
        donarEmail,
        bloodGroup,
      } = req.body;
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: "rakib2020.tkg@gmail.com",
          pass: "quyl bvkn ffbl jzyo",
        },
      });
      const info = await transporter.sendMail({
        to: donarEmail, // list of receivers
        subject: `${bloodGroup} রক্তের জন্য আবেদন `,
        text: `
        আবেদনকারীর নাম: ${appliedPersonName}
        রোগীর সমস্যা   : ${রোগীরসমস্যা}
        রক্তের পরিমাণ: ${রক্তেরপরিমাণ}
        রক্তদানের তারিখ: ${রক্তদানেরতারিখ}
        রক্তদানের সময়: ${রক্তদানেরসময়}
        রক্তদানের স্থান: ${রক্তদানেরস্থান}
        যোগাযোগ: ${যোগাযোগ}
        `,
      });

      console.log("Message sent: %s", info.messageId);
      res.send(info);
    });

    await client.db("admin").command({ ping: 1 });
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
  res.send(`Welcome to our application`);
});
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
