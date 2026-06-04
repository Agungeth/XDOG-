




/*
==================================
XDOG FULL XRPL LAUNCHPAD
==================================
*/

const express = require("express")
const API_KEY =
"a2f246fc-0098-454b-a5c7-282df3df9127"
const API_SECRET =
"3a33d17b-0795-411d-aaf9-cee96308dec4"

const PROJECT_WALLET =
"rPsHdHqirg5UHfukqUtsTgFsPJqrn2GUjc"

const PROJECT_SEED =
"sEdTM4enyVEC69C6pGrU9diRyjkoceP"
const MONGO_URI =
"mongodb+srv://admin:admin123@cluster0.wm6mfrb.mongodb.net/xdog?retryWrites=true&w=majority"
const ADMIN_WALLET =
"ra5YfjZMr3WtjGFJrDBQoxAtw3J1dBCMdj"

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
FEES
==================================
*/

const DEPLOY_FEE = 5
const MARKETPLACE_FEE = 5
const MINT_FEE = 0.1

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

  tick:"XDOG",

  name:"XDOG",

  description:"Launchpad Inscription Token XRPL",

  creator: wallet.address,

  supply:21000000,

  amount:1000,

  mintPrice:0.5,

  mintLimit:"unlimited"

})

console.log("DESTINATION =", destinationWallet)
console.log("PROJECT =", wallet.address)

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
Buffer
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

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
margin:0;
padding:20px;
background:#050816;
font-family:Arial,sans-serif;
color:white;
}

.container{
max-width:1000px;
margin:auto;
background:#0f172a;
padding:25px;
border-radius:20px;
}

.nav{
display:flex;
justify-content:center;
gap:10px;
flex-wrap:wrap;
margin-bottom:25px;
}

.nav a{
text-decoration:none;
}

.nav button{
width:auto;
padding:10px 15px;
margin:0;
}

button{
padding:18px;
border:none;
border-radius:12px;
background:#00ff99;
font-size:16px;
font-weight:bold;
cursor:pointer;
}

.main{
display:flex;
justify-content:space-between;
align-items:center;
flex-wrap:wrap;
gap:20px;
}

.logo{
text-align:center;
}

.logo img{
width:100px;
height:100px;
object-fit:contain;
}

.stats{
text-align:center;
}

.price{
text-align:center;
}

.box{
background:#111827;
padding:15px;
border-radius:12px;
margin-top:15px;
}

@media(max-width:768px){

.main{
flex-direction:column;
text-align:center;
}

}

</style>

</head>

<body>

<div class="container">

<div class="nav">

<a href="/">
<button>HOME</button>
</a>

<a href="/publicmint">
<button>LAUNCHPAD</button>
</a>

<a href="/market">
<button>MARKETPLACE</button>
</a>

<a href="/mint">
<button>MINT XDOG</button>
</a>

</div>

<div class="main">

<div class="logo">

<img src="/logo.png">

<h1>XDOG</h1>

<p>FIRST XRPL MEME INSCRIPTION</p>

</div>

<div class="stats">

<h1>${minted}</h1>
<p>MINTED</p>

<hr>

<h2>${remaining}</h2>
<p>REMAINING</p>

</div>

<div class="price">

<h2>MINT PRICE</h2>

<h1 style="color:#00ff99;">
0.5 XRP
</h1>

<a href="/mint">
<button>MINT XDOG</button>
</a>

</div>

</div>

<div class="box">
Mint Status : LIVE
</div>

<div class="box">
Supply : 21,000,000
</div>

<div class="box">
Progress : ${progress}%
</div>

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
==================================
MARKETPLACE
==================================
*/

app.get("/market", async (req,res)=>{

await connectDB()

const listings =
await db.collection("listings")
.find()
.toArray()

const html =
listings.map(x=>`

<div style="
background:#111827;
padding:20px;
border-radius:20px;
margin-bottom:20px;
">

<h2>
${x.inscription}
</h2>

<p>
${x.price} XRP
</p>

<p>
Amount: ${x.amount}
</p>

<form
action="/buy/${x._id}"
method="POST"
>
<input
name="buyAmount"
placeholder="Amount to buy"
required
>

<br><br>

<button>
BUY NOW
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
XDOG MARKETPLACE
</h1>

<form
action="/list"
method="POST"
>

<input
name="seller"
placeholder="Seller Wallet"
required
>

<br><br>

<input
name="inscription"

placeholder="Inscription"
required
>

<br><br>

<input
name="amount"
placeholder="Amount"
/>

<br><br>

<input
name="price"
placeholder="Price XRP"
/>

<br><br>

<button>
CREATE LISTING
</button>

</form>

<br><hr><br>

${html}

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

const deploy = await db.collection("deploys").findOne({
  ticker:req.body.ticker
})

if(!deploy){
  return res.send("TOKEN NOT FOUND")
}

await db.collection("listings")
.insertOne({

...req.body,

seller:deploy.owner,

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

const buyAmount =
parseInt(req.body.buyAmount)

console.log("BUY AMOUNT =", buyAmount)
console.log("BODY =", req.body)

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

if(buyAmount > parseInt(listing.amount)){

return res.send(
"AMOUNT EXCEEDS AVAILABLE TOKENS"
)

}

const totalXrp =
buyAmount * parseFloat(listing.price)

const fee =
(parseFloat(listing.price)
* MARKETPLACE_FEE) / 100

const orderId = "ORD-" + Date.now()

await db.collection("escrow")
.insertOne({

orderId:orderId,

buyer:"pending",

seller:listing.seller,

price:listing.price,

amount:buyAmount,

fee:fee,

status:"waiting_payment",

created:Date.now()
})

await db.collection("listings")
.updateOne(
{
  _id:new ObjectId(req.params.id)
},
{
  $set:{
    amount:
      parseInt(listing.amount) - buyAmount
  }
}
)

res.send(`
<h1>ORDER CREATED</h1>

<p>Order ID: ${orderId}</p>

<p>Token: ${listing.inscription}</p>

<p>Amount: ${buyAmount}</p>

<p>Total XRP: ${totalXrp}</p>

<p>
Send XRP to:
rPsHdHqirg5UHfukqUtsTgFsPJqrn2GUjc
</p>

<p>
Status:
WAITING PAYMENT
</p>
`)

})

/*
==================================
ADMIN PANEL
==================================
*/

app.get("/order/:orderId", async (req,res)=>{

await connectDB()

const order =
await db.collection("escrow")
.findOne({
orderId:req.params.orderId
})

if(!order){
return res.send("ORDER NOT FOUND")
}

res.send(`
<h1>ORDER STATUS</h1>

<p>Order ID: ${order.orderId}</p>

<p>Status: ${order.status}</p>

<p>Seller: ${order.seller}</p>

<p>Amount: ${order.amount}</p>

<p>Price: ${order.price}</p>

`)
})

app.get("/debug-escrow", async (req,res)=>{

await connectDB()

const data =
await db.collection("escrow")
.find()
.toArray()

res.send(
"<pre>" +
JSON.stringify(data,null,2) +
"</pre>"
)

})

app.get("/debug-listings", async(req,res)=>{

  await connectDB()

  const data =
  await db.collection("listings")
  .find()
  .toArray()

  res.send(
    "<pre>" +
    JSON.stringify(data,null,2) +
    "</pre>"
  )

})

app.get("/clear-escrow", async(req,res)=>{

await connectDB()

await db.collection("escrow").deleteMany({})

res.send("ESCROW CLEARED")

})

app.get("/orders", async(req,res)=>{

  await connectDB()

  const orders =
  await db.collection("escrow")
  .find()
  .sort({created:-1})
  .toArray()

  res.send(
    "<pre>" +
    JSON.stringify(orders,null,2) +
    "</pre>"
  )

})

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

const payload = await axios.post(

"https://xumm.app/api/v1/platform/payload",

{

txjson:{

TransactionType:"Payment",

Destination:PROJECT_WALLET,

Amount:String(5 * 1000000)

},

custom_meta:{

identifier:"DEPLOY",

blob:req.body

}

},

{

headers:{

"X-API-Key": "a2f246fc-0098-454b-a5c7-282df3df9127",
"X-API-Secret": "3a33d17b-0795-411d-aaf9-cee96308dec4"

}

}

)

res.redirect(payload.data.next.always)

})

app.get("/publicmint", async (req,res)=>{

await connectDB()

const tokens =
await db.collection("deploys")
.find({})
.toArray()
console.log("TOKENS =", tokens)
const html =
tokens.map(token => `
<div style="
background:#0a1430;
padding:20px;
margin:10px;
border-radius:10px;
">
<h2>${token.ticker}</h2>

<p>
Mint Amount:
${token.mint}
</p>

<a href="/collection/${token.ticker}">
<button>
OPEN COLLECTION
</button>
</a>

</div>
`).join("")

res.send(`
<html>
<body style="
background:#020617;
color:white;
font-family:Arial;
padding:20px;
">

<h1>PUBLIC MINT</h1>

${html}

</body>
</html>
`)
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
console.log("USER WALLET =", userWallet)

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

const PORT =
process.env.PORT || 3000

app.listen(PORT,
async ()=>{

await connectXRPL()


await connectDB()

console.log(
"XDOG FULL LAUNCHPAD LIVE"
)

})

app.get("/clear", async(req,res)=>{

await connectDB()

await db.collection("listings").deleteMany({})

res.send("LISTINGS CLEARED")

})
