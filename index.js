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
*/

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
background-image:url("https://raw.githubusercontent.com/Agungeth/XDOG-/main/logo.png");
background-size:cover;
background-position:center;
background-attachment:fixed;
}

.overlay{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.75);
backdrop-filter:blur(6px);
z-index:0;
}

.container{
position:relative;
z-index:1;
max-width:420px;
margin:auto;
border:1px solid #1f2937;
background:#0b1020ee;
padding:25px;
border-radius:20px;
box-shadow:0 0 20px #000;
}

.logo{
width:90px;
height:90px;
border-radius:50%;
display:block;
margin:auto;
box-shadow:0 0 20px #00ff99;
}

.title{
text-align:center;
font-size:38px;
font-weight:bold;
margin-top:15px;
}

.subtitle{
text-align:center;
color:#9ca3af;
font-size:12px;
margin-bottom:30px;
}

.grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:12px;
margin-bottom:20px;
}

.box{
border:1px solid #1f2937;
padding:15px;
border-radius:12px;
text-align:center;
background:#0f172a;
}

.big{
font-size:30px;
font-weight:bold;
color:#00ff99;
}

.label{
font-size:11px;
color:#9ca3af;
margin-top:5px;
}

.progress{
width:100%;
height:10px;
background:#111827;
border-radius:20px;
overflow:hidden;
margin-top:10px;
margin-bottom:25px;
}

.bar{
height:100%;
width:${progress}%;
background:linear-gradient(
90deg,
#ff0033,
#00ff99
);
}

.mintbox{
border:1px solid #1f2937;
padding:20px;
border-radius:15px;
background:#0f172a;
margin-bottom:20px;
}

.price{
font-size:35px;
text-align:center;
color:#ffd166;
margin:20px 0;
}

button{
width:100%;
padding:18px;
border:none;
border-radius:12px;
background:#00ff99;
color:black;
font-size:20px;
font-weight:bold;
cursor:pointer;
}

.section{
margin-top:25px;
}

.section h2{
font-size:15px;
color:#ff3355;
margin-bottom:10px;
}

.rbox{
border-bottom:1px solid #1f2937;
padding:12px 0;
color:#d1d5db;
}

.live{
background:#052e16;
color:#22c55e;
padding:5px 12px;
border-radius:10px;
font-size:12px;
display:inline-block;
}

</style>

</head>

<body>

<div class="overlay"></div>

<div class="container">

<img
class="logo"
src="https://raw.githubusercontent.com/Agungeth/XDOG-/main/logo.png"
>

<div class="title">
XDOG
</div>

<div class="subtitle">
FIRST XRPL MEME INSCRIPTION
</div>

<div class="grid">

<div class="box">
<div class="big">
${minted}
</div>
<div class="label">
MINTED
</div>
</div>

<div class="box">
<div class="big">
${remaining}
</div>
<div class="label">
REMAINING
</div>
</div>

</div>

<div class="label">
MINT PROGRESS ${progress}%
</div>

<div class="progress">
<div class="bar"></div>
</div>

<div class="mintbox">

<div class="label">
PRICE PER MINT
</div>

<div class="price">
0.5 XRP
</div>

<a href="/mint">

<button>
MINT XDOG
</button>

</a>

</div>

<div class="section">

<h2>DETAILS</h2>

<div class="rbox">
Mint Status
<span class="live">
LIVE
</span>
</div>

<div class="rbox">
Supply: 21,000,000
</div>

<div class="rbox">
Per Mint: 1000 XDOG
</div>

<div class="rbox">
Wallet: Xaman
</div>

</div>

<div class="section">

<h2>ROADMAP</h2>

<div class="rbox">
✅ Website Launch
</div>

<div class="rbox">
✅ XRPL Mint System
</div>

<div class="rbox">
✅ Auto Inscription
</div>

<div class="rbox">
🔜 Marketplace
</div>

<div class="rbox">
🔜 Community Airdrop
</div>

<div class="rbox">
🔜 CEX Listing
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
