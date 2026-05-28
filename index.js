

/*
==================================
XDOG FULL XRPL LAUNCHPAD
==================================
*/
const express = require("express")
const axios = require("axios")
const xrpl = require("xrpl")
const bodyParser = require("body-parser")
const { MongoClient, ObjectId } = require("mongodb")
const session = require("express-session")

const app = express()

app.use(bodyParser.json())

app.use(express.urlencoded({
extended:true
}))

app.use(session({
secret:"xdog-secret",
resave:false,
saveUninitialized:true
}))

/*
==================================
CONFIG
==================================
*/

const API_KEY =
"a2f246fc-0098-454b-a5c7-282df3df9127"


const API_SECRET =
"3a33d17b-0795-411d-aaf9-cee96308dec4"


const PROJECT_WALLET =
"ra5YfjZMr3WtjGFJrDBQoxAtw3J1dBCMdj"


const PROJECT_SEED =
"sEdTM4enyVEC69C6pGrU9diRyjkoceP"


const MONGO_URI =
"mongodb+srv://admin:admin123@cluster0.wm6mfrb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const ADMIN_WALLET =
"ra5YfjZMr3WtjGFJrDBQoxAtw3J1dBCMdj"

/*
==================================
FEES
==================================
*/

const DEPLOY_FEE = 5
const MARKETPLACE_FEE = 5
const MINT_FEE = 1

/*
==================================
XDOG CONFIG
==================================
*/

const TOTAL_SUPPLY = 21000000
const PER_MINT = 1000
const MINT_PRICE = "500000"

let minted = 0

/*
==================================
DATABASE
==================================
*/

const mongo =
new MongoClient(MONGO_URI)

let db

async function connectDB(){

if(!db){

await mongo.connect()

db = mongo.db("xdog")

console.log(
"DATABASE CONNECTED"
)

}

}

/*
==================================
XRPL CLIENT
==================================
*/

const client =
new xrpl.Client(
"wss://s1.ripple.com"
)

async function connectXRPL(){

if(!client.isConnected()){

await client.connect()

console.log(
"XRPL CONNECTED"
)

}

}

/*
==================================
SEND INSCRIPTION
==================================
*/

async function sendInscription(
destinationWallet,
ticker,
mintAmount,
supply
){

try {

await connectXRPL()

const wallet =
xrpl.Wallet.fromSeed(
PROJECT_SEED
)

const inscriptionData =
JSON.stringify({

protocol:"xrdog",

op:"mint",

tick:ticker,

amount:mintAmount,

supply:supply,

minted:minted + mintAmount

})

const tx = {

TransactionType:"Payment",

Account:wallet.address,

Destination:destinationWallet,

Amount:"1",

Memos:[

{

Memo:{

MemoType:
Buffer
.from("xrdog")
.toString("hex"),

MemoFormat:
Buffer
.from("application/json")
.toString("hex"),

MemoData:
wBuffer
.from(inscriptionData)
.toString("hex")

}

}

]

}

const prepared =
await client.autofill(tx)

const signed =
wallet.sign(prepared)

const result =
await client.submitAndWait(
signed.tx_blob
)

minted += mintAmount

console.log(
"INSCRIPTION SENT"
)

console.log(
result.result.hash
)

return true

} catch(err){

console.log(err)

return false

}

}

/*
==================================
HOMEPAGE
==================================
*/

app.get("/", async (req,res)=>{

await connectDB()

const listings =
await db.collection("listings")
.find()
.toArray()

let floor = 0

if(listings.length > 0){

floor = Math.min(
...listings.map(x =>
parseFloat(x.price)
)
)

}

const progress =
((minted / TOTAL_SUPPLY) * 100)
.toFixed(1)

const remaining =
TOTAL_SUPPLY - minted

res.send(`

<html>

<head>

<title>XDOG</title>

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<style>


.navbar{
display:flex;
justify-content:center;
gap:40px;
padding:20px;
margin-bottom:20px;
background:#07111f;
border-bottom:1px solid #00ff99;
}

.navbar a{
color:#00ff99;
text-decoration:none;
font-weight:bold;
font-size:16px;
}


body{
margin:0;
padding:20px;
background:#050816;
font-family:Arial;
color:white;
}


.navbar{
display:flex;
justify-content:center;
gap:20px;
margin-bottom:20px;
flex-wrap:wrap;
}

.navbar a{
color:#00ff99;
text-decoration:none;
font-weight:bold;
padding:10px 15px;
border:1px solid #00ff99;
border-radius:10px;
}

.container{
width:95%;
max-width:1400px;
margin:auto;
background:#0f172a;
padding:20px;
border-radius:20px;
display:flex;
gap:20px;
flex-wrap:wrap;
align-items:flex-start;

}


.logo{
text-align:center;
flex:1;
min-width:300px;
}

.logo img{
width:120px;
border-radius:50%;
}

.card{
background:#111827;
padding:20px;
border-radius:15px;
margin-top:15px;
}

.btn{
display:block;
width:100%;
padding:15px;
margin-top:15px;
background:#00ff99;
color:black;
font-weight:bold;
border:none;
border-radius:12px;
font-size:18px;
}

.stat{
font-size:40px;
font-weight:bold;
color:#00ff99;
text-align:center;
}

</style>

</head>

<body>

<div class="navbar">
<a href="/">HOME</a>
<a href="/public">PUBLIC MINT</a>
<a href="/marketplace">MARKETPLACE</a>
<a href="/launchpad">LAUNCHPAD</a>
</div>

<div class="container">

<div class="logo">

<img
src="https://raw.githubusercontent.com/Agungeth/XDOG-/main/logo.png"
style="
width:120px;
height:120px;
border-radius:50%;
margin-bottom:20px;
"
/>


<h1>XDOG</h1>
<p>FIRST XRPL MEME INSCRIPTION</p>
</div>

<div class="card">

<div class="stat">
${minted}
</div>

<p align="center">
MINTED
</p>

<hr>

<div class="stat">
${remaining}
</div>

<p align="center">
REMAINING
</p>

</div>

<div class="card">

<h2>PRICE PER MINT</h2>

<div class="stat">
0.5 XRP
</div>

<button
class="btn"
onclick="
const wallet = prompt('ENTER XRPL WALLET')
window.location='/mint?wallet=' + wallet
">
MINT XDOG
</button>

</div>

<div class="card">

<h2>DETAILS</h2>

<p>Mint Status : LIVE</p>

<p>Supply : 21,000,000</p>

<p>Per Mint : 1000 XDOG</p>

<p>Wallet : Xaman</p>

</div>

</body>

</html>

`)

})

/*
==================================
MINT XDOG
==================================
*/

app.get("/mint", async (req,res)=>{

try {

const payload =
await axios.post(

"https://xumm.app/api/v1/platform/payload",

{

txjson:{

TransactionType:"Payment",

Destination:
PROJECT_WALLET,

Amount:MINT_PRICE

},

custom_meta:{
identifier:"XDOG"
}

},

{

headers:{

"x-api-key":
API_KEY,

"x-api-secret":
API_SECRET,

"Content-Type":
"application/json"

}

}

)

res.redirect(
payload.data.next.always
)

} catch(err){

console.log(err)

res.send("MINT ERROR")

}

})

/*
====================================
PUBLIC PAGE
====================================
*/

app.get("/public", async (req,res)=>{

res.redirect("/mint")

})

/*
====================================
LAUNCHPAD PAGE
====================================
*/


app.get("/launchpad", async (req,res)=>{

res.send(`

<html>

<head>

<title>XDOG Launchpad</title>

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<style>

body{
background:#050816;
font-family:Arial;
color:white;
padding:20px;
}

.card{
background:#0f172a;
padding:20px;
border-radius:20px;
max-width:500px;
margin:auto;
}

input{
width:100%;
padding:15px;
margin-top:10px;
margin-bottom:15px;
border:none;
border-radius:10px;
background:#111827;
color:white;
}

button{
width:100%;
padding:15px;
background:#00ff99;
border:none;
border-radius:12px;
font-weight:bold;
font-size:18px;
}

h1{
color:#00ff99;
}

</style>

</head>

<body>

<div class="card">

<h1>XDOG LAUNCHPAD</h1>

<p>Create XRPL Meme Token</p>

<input placeholder="Token Name">

<input placeholder="Ticker">

<input placeholder="Supply">

<input placeholder="Mint Price XRP">

<button onclick="window.location='/mint'">

CREATE TOKEN

</button>

</div>

</body>

</html>

`)

})


/*
==================================
MARKETPLACE
==================================
*/

app.get("/marketplace", async (req,res)=>{

res.send(`
<html>

<body style="
background:#020617;
color:white;
font-family:sans-serif;
padding:30px;
">

<h1 style="
font-size:40px;
margin-bottom:30px;
">
XDOG MARKETPLACE
</h1>

<input
placeholder="Seller Wallet"
style="
width:100%;
padding:15px;
margin-bottom:15px;
background:#111827;
border:1px solid #333;
border-radius:12px;
color:white;
font-size:18px;
outline:none;
"
/>

<input
placeholder="Inscription"
style="
width:100%;
padding:15px;
margin-bottom:15px;
background:#111827;
border:1px solid #333;
border-radius:12px;
color:white;
font-size:18px;
outline:none;
"
/>

<input
placeholder="Price XRP"
style="
width:100%;
padding:15px;
margin-bottom:20px;
background:#111827;
border:1px solid #333;
border-radius:12px;
color:white;
font-size:18px;
outline:none;
"
/>

<button style="
width:100%;
padding:15px;
background:#2563eb;
color:white;
border:none;
border-radius:12px;
font-size:18px;
font-weight:bold;
">
CREATE LISTING
</button>

</body>
</html>
`)

})

/*
==================================
CREATE LISTING
==================================
*/

app.post("/list", async (req,res)=>{

await connectDB()

await db.collection("listings")
.insertOne({

...req.body,

status:"active",

created:Date.now()

})

res.redirect("/market")

})

/*
==================================
BUY LISTING
==================================
*/

app.post("/buy/:id", async (req,res)=>{

await connectDB()

const listing =
await db.collection("listings")
.findOne({

_id:new ObjectId(
req.params.id
)

})

if(!listing){

return res.send(
"LISTING NOT FOUND"
)

}

const fee =
(parseFloat(listing.price)
* MARKETPLACE_FEE) / 100

await db.collection("escrow")
.insertOne({

listingId:req.params.id,

buyer:"pending",

seller:listing.seller,

price:listing.price,

fee:fee,

status:"pending_release",

created:Date.now()

})

res.send(
"PAYMENT PENDING ADMIN RELEASE"
)

})

/*
==================================
ADMIN PANEL
==================================
*/

app.get("/admin", async (req,res)=>{

await connectDB()

const orders =
await db.collection("escrow")
.find({
status:"pending_release"
})
.toArray()

const html =
orders.map(x=>`

<div style="
background:#111827;
padding:20px;
border-radius:20px;
margin-bottom:20px;
">

<p>
Seller:
${x.seller}
</p>

<p>
Price:
${x.price} XRP
</p>

<form
action="/release/${x._id}"
method="POST"
>

<button>
RELEASE
</button>

</form>

</div>

`).join("")

res.send(`

<html>

<body style="
background:#020617;
font-family:Arial;
color:white;
padding:20px;
">

<h1>
ADMIN PANEL
</h1>

${html}

</body>

</html>

`)

})

/*
==================================
RELEASE
==================================
*/

app.post("/release/:id", async (req,res)=>{

await connectDB()

await db.collection("escrow")
.updateOne(

{
_id:new ObjectId(
req.params.id
)
},

{
$set:{
status:"released"
}
}

)

res.send(
"ORDER RELEASED"
)

})

/*
==================================
DEPLOY TOKEN
==================================
*/

app.get("/deploy", (req,res)=>{

res.send(`

<html>

<body style="
background:#020617;
font-family:Arial;
color:white;
padding:20px;
">

<h1>
DEPLOY TOKEN
</h1>

<p>
Deploy Fee:
5 XRP
</p>

<form
action="/deploy"
method="POST"
>

<input
name="ticker"
placeholder="Ticker"
required
>

<br><br>

<input
name="supply"
placeholder="Supply"
required
>

<br><br>

<input
name="mint"
placeholder="Mint Amount"
required
>

<br><br>

<button>
DEPLOY
</button>

</form>

</body>

</html>

`)

})

app.post("/deploy", async (req,res)=>{

await connectDB()

await db.collection("deploys")
.insertOne({

ticker:req.body.ticker.toUpperCase(),

supply:req.body.supply,

mint:req.body.mint,

created:Date.now()

})

res.redirect(
`/collection/${req.body.ticker.toUpperCase()}`
)

})

/*
==================================
COLLECTION PAGE
==================================
*/

app.get("/collection/:ticker",
async (req,res)=>{

await connectDB()

const token =
await db.collection("deploys")
.findOne({

ticker:req.params.ticker
.toUpperCase()

})

if(!token){

return res.send(
"TOKEN NOT FOUND"
)

}

res.send(`

<html>

<body style="
background:#020617;
font-family:Arial;
color:white;
padding:20px;
">

<h1>
${token.ticker}
</h1>

<p>
Supply:
${token.supply}
</p>

<p>
Mint Amount:
${token.mint}
</p>

<a href="/mint/${token.ticker}">

<button>
MINT ${token.ticker}
</button>

</a>

</body>

</html>

`)

})

/*
==================================
DYNAMIC MINT
==================================
*/

app.get("/mint/:ticker",
async (req,res)=>{

await connectDB()

const token =
await db.collection("deploys")
.findOne({

ticker:req.params.ticker
.toUpperCase()

})

if(!token){

return res.send(
"TOKEN NOT FOUND"
)

}

try {

const payload =
await axios.post(

"https://xumm.app/api/v1/platform/payload",

{

txjson:{

TransactionType:"Payment",

Destination:
PROJECT_WALLET,

Amount:
xrpl.xrpToDrops(
MINT_FEE.toString()
)

},

custom_meta:{
identifier:token.ticker
}

},

{

headers:{

"x-api-key":
API_KEY,

"x-api-secret":
API_SECRET,

"Content-Type":
"application/json"

}

}

)

res.redirect(
payload.data.next.always
)

} catch(err){

console.log(err)

res.send(
"MINT ERROR"
)

}

})

/*
==================================
WEBHOOK
==================================
*/

app.post("/webhook",
async (req,res)=>{

try {

const data = req.body

if(

data.payloadResponse &&
data.payloadResponse.resolved &&
data.payloadResponse.signed

){

const userWallet =
data.payloadResponse.account

const ticker =
data.custom_meta.identifier

await connectDB()

const token =
await db.collection("deploys")
.findOne({
ticker
})

if(token){

await sendInscription(

userWallet,

token.ticker,

parseInt(token.mint),

parseInt(token.supply)

)

}else{

await sendInscription(

userWallet,

"XDOG",

PER_MINT,

TOTAL_SUPPLY

)

}

}

res.send("ok")

} catch(err){

console.log(err)

res.send("WEBHOOK ERROR")

}

})

/*
==================================
START SERVER
==================================
*/

const PORT = process.env.PORT || 3000

app.get("/mint", async(req,res)=>{

try{

const destination = req.query.wallet

const tx = {
TransactionType:"Payment",
Account:wallet.classicAddress,
Destination:destination,
Amount:xrpl.xrpToDrops("0.5"),
Memos:[
{
Memo:{
MemoType:Buffer.from("XDOG").toString("hex"),
MemoData:Buffer.from("XDOG MINT").toString("hex")
}
}
]
}

const submitted = await client.submitAndWait(
tx,
{wallet}
)

res.send(`
<h1>MINT SUCCESS</h1>
<p>${submitted.result.hash}</p>
`)

}catch(err){

console.log(err)

res.send("MINT FAILED")

}

})

app.listen(PORT,"0.0.0.0",async ()=>{

await connectXRPL()

await connectDB()

console.log(
"XDOG FULL LAUNCHPAD LIVE"
)

})


/* =========================
REALTIME SOCKET SERVER
========================= */

const server = require("http").createServer(app)

const io = require("socket.io")(server,{
cors:{
origin:"*"
}
})

let liveMintCount = 0

io.on("connection",(socket)=>{

console.log("USER CONNECTED")

socket.emit("mintUpdate",{
minted:liveMintCount,
remaining:21000000-liveMintCount
})

})



