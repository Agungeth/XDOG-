const express = require("express")
const axios = require("axios")
const xrpl = require("xrpl")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.json())

/*
==================================
XAMAN API
==================================
*/

const API_KEY =
"a2f246fc-0098-454b-a5c7-282df3df9127"

const API_SECRET =
"3a33d17b-0795-411d-aaf9-cee96308dec4"

/*
==================================
PROJECT CONFIG
==================================
*/

const PROJECT_WALLET =
"ra5YfjZMr3WtjGFJrDBQoxAtw3J1dBCMdj"

const PROJECT_SEED =
"sEdTM4enyVEC69C6pGrU9diRyjkoceP"

const TOTAL_SUPPLY = 21000000

const PER_MINT = 1000

const MINT_PRICE = "500000"

let minted = 0

/*
==================================
XRPL CLIENT
==================================
*/

const client = new xrpl.Client(
  "wss://s1.ripple.com"
)

async function connectXRPL(){

  if(!client.isConnected()){

    await client.connect()

    console.log("XRPL CONNECTED")

  }

}

/*
==================================
SEND XRDOG INSCRIPTION
==================================
*/

async function sendXRDOG(
  destinationWallet
){

try {

await connectXRPL()

const wallet =
xrpl.Wallet.fromSeed(
PROJECT_SEED
)

const inscriptionData =
JSON.stringify({

protocol: "xrdog",

op: "mint",

tick: "XDOG",

amount: PER_MINT,

supply: TOTAL_SUPPLY,

minted: minted + PER_MINT

})

const tx = {

TransactionType: "Payment",

Account: wallet.address,

Destination: destinationWallet,

Amount: "1",

Memos: [

{

Memo: {

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

minted += PER_MINT

console.log(
"XRDOG INSCRIPTION SENT"
)

console.log(
"TX HASH:",
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
WEBSITE
==================================
/*

app.get("/", (req, res) => {

const progress =
((minted / TOTAL_SUPPLY) * 100).toFixed(1)

const remaining =
TOTAL_SUPPLY - minted

res.send(`
<html>

<head>

<title>XDOG MINT</title>

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<style>

body{
margin:0;
padding:20px;
background:#050816;
font-family:Arial;
color:white;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
background-image:url('https://raw.githubusercontent.com/Agungeth/XDOG-/main/logo.png');
background-size:cover;
background-position:center;
background-attachment:fixed;
}

.container{
width:100%;
max-width:430px;
background:rgba(5,8,22,0.88);
border:1px solid #1f2937;
padding:25px;
border-radius:20px;
backdrop-filter:blur(10px);
box-shadow:0 0 30px rgba(0,255,153,0.2);
}

.topstats{
display:grid;
grid-template-columns:1fr 1fr;
gap:10px;
margin-bottom:20px;
}

.stat{
background:#0b1020;
border:1px solid #1f2937;
padding:20px;
text-align:center;
}

.number1{
font-size:34px;
color:#ff4d4d;
font-weight:bold;
}

.number2{
font-size:34px;
color:#ffd54f;
font-weight:bold;
}

.label{
margin-top:10px;
font-size:12px;
color:#9ca3af;
letter-spacing:2px;
}

.progress-title{
display:flex;
justify-content:space-between;
margin-top:20px;
margin-bottom:10px;
font-size:13px;
color:#9ca3af;
}

.progress{
width:100%;
height:10px;
background:#111827;
overflow:hidden;
}

.progress-bar{
width:${progress}%;
height:100%;
background:linear-gradient(
90deg,
#ff004c,
#ff9900,
#ffe600
);
}

.card{
margin-top:25px;
background:#0b1020;
border:1px solid #1f2937;
padding:20px;
}

.pricebox{
border:1px solid #665c2c;
padding:20px;
margin-top:15px;
margin-bottom:20px;
text-align:center;
}

.price{
font-size:42px;
color:#ffd54f;
letter-spacing:3px;
}

.mintbox{
display:grid;
grid-template-columns:1fr 1fr 1fr;
margin-top:15px;
margin-bottom:20px;
}

.mbtn{
background:#111827;
padding:18px;
text-align:center;
border:1px solid #1f2937;
font-size:28px;
}

.total{
display:flex;
justify-content:space-between;
margin-top:20px;
margin-bottom:25px;
color:#9ca3af;
}

.connect{
width:100%;
padding:18px;
background:transparent;
border:1px solid #1f2937;
color:white;
font-size:18px;
letter-spacing:3px;
cursor:pointer;
}

.connect:hover{
background:#00ff99;
color:black;
}

.details{
margin-top:30px;
border-top:1px solid #1f2937;
padding-top:25px;
}

.row{
display:flex;
justify-content:space-between;
margin-bottom:18px;
color:#9ca3af;
}

.live{
color:#00ff99;
font-weight:bold;
}

.logo{
width:90px;
height:90px;
border-radius:50%;
display:block;
margin:auto;
margin-bottom:20px;
box-shadow:0 0 25px #00ff99;
}

.title{
text-align:center;
font-size:34px;
font-weight:bold;
}

.subtitle{
text-align:center;
color:#9ca3af;
margin-top:10px;
margin-bottom:25px;
letter-spacing:2px;
font-size:12px;
}

.roadmap{
margin-top:30px;
}

.rtitle{
margin-bottom:20px;
color:#ff4d4d;
letter-spacing:3px;
}

.rbox{
background:#111827;
border:1px solid #1f2937;
padding:15px;
margin-bottom:12px;
}

</style>

</head>

<body>

<div class="container">

<img
class="logo"
src="https://raw.githubusercontent.com/Agungeth/XDOG-/main/logo.png"
>

<div class="title">
XDOG
</div>

<div class="subtitle">
XRPL MEME INSCRIPTION
</div>

<div class="topstats">

<div class="stat">
<div class="number1">
${minted}
</div>
<div class="label">
MINTED
</div>
</div>

<div class="stat">
<div class="number2">
${remaining}
</div>
<div class="label">
REMAINING
</div>
</div>

</div>

<div class="progress-title">
<span>MINT PROGRESS</span>
<span>${progress}%</span>
</div>

<div class="progress">
<div class="progress-bar"></div>
</div>

<div class="card">

<div style="
color:#ff4d4d;
letter-spacing:3px;
margin-bottom:15px;
">
PAID MINT
</div>

<div class="pricebox">

<div style="
color:#9ca3af;
margin-bottom:10px;
">
PRICE PER MINT
</div>

<div class="price">
0.5 XRP
</div>

</div>

<div class="mintbox">

<div class="mbtn">-</div>

<div class="mbtn">1</div>

<div class="mbtn">+</div>

</div>

<div class="total">

<span>TOTAL</span>

<span style="
color:#ffd54f;
font-size:28px;
">
0.5 XRP
</span>

</div>

<a href="/mint">

<button class="connect">
CONNECT XAMAN
</button>

</a>

</div>

<div class="details">

<div class="row">
<span>MINT STATUS</span>
<span class="live">
● LIVE
</span>
</div>

<div class="row">
<span>PRICE</span>
<span>0.5 XRP</span>
</div>

<div class="row">
<span>MAX / TX</span>
<span>1000 XDOG</span>
</div>

<div class="row">
<span>TOTAL SUPPLY</span>
<span>21,000,000</span>
</div>

</div>

<div class="roadmap">

<div class="rtitle">
ROADMAP
</div>

<div class="rbox">
✅ WEBSITE LAUNCH
</div>

<div class="rbox">
✅ XRPL MINT SYSTEM
</div>

<div class="rbox">
✅ AUTO DELIVERY
</div>

<div class="rbox">
🔜 MARKETPLACE
</div>

<div class="rbox">
🔜 AIRDROP
</div>

<div class="rbox">
🔜 CEX LISTING
</div>

</div>

</div>

</body>

</html>

`)

})

/*
==================================
MINT PAYMENT
==================================
*/

app.get("/mint", async (req, res) => {

try {

if(minted >= TOTAL_SUPPLY){

return res.send(
"SUPPLY SOLD OUT"
)

}

const payload =
await axios.post(

"https://xumm.app/api/v1/platform/payload",

{

txjson: {

TransactionType: "Payment",

Destination:
PROJECT_WALLET,

Amount: MINT_PRICE

}

},

{

headers: {

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
WEBHOOK
==================================
*/

app.post("/webhook", async (req, res) => {

try {

const data = req.body

if(

data.payloadResponse &&
data.payloadResponse.resolved &&
data.payloadResponse.signed

){

const userWallet =
data.payloadResponse.account

console.log(
"PAYMENT SUCCESS:",
userWallet
)

await sendXRDOG(
userWallet
)

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

app.listen(PORT, async () => {

await connectXRPL()

console.log(
"XDOG AUTO INSCRIPTION LIVE"
)

})
