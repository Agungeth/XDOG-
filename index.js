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
*/

app.get("/", (req, res) => {

res.send(`

<html>

<head>

<title>XDOG</title>

<style>

body{
background:url("https://raw.githubusercontent.com/Agungeth/XDOG-/main/logo.png");
background-size:cover;
background-position:center;
background-repeat:no-repeat;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
font-family:Arial;
color:white;
margin:0;
padding:30px;
}
.card{
background:rgba(0,0,0,0.75);
backdrop-filter:blur(10px);
padding:40px;
border-radius:25px;
width:90%;
max-width:1000px;
text-align:center;
box-shadow:0 0 40px #00ff99;
border:1px solid #00ff99;
}

.logo{
width:120px;
border-radius:50%;
margin-bottom:20px;
box-shadow:0 0 20px #00ff99;
}

button{
width:100%;
padding:15px;
border:none;
border-radius:10px;
background:#00ff99;
font-size:20px;
font-weight:bold;
cursor:pointer;
margin-top:20px;
}

h2{
margin-top:40px;
color:#00ff99;
}

p{
color:#9ca3af;
line-height:1.7;
}

hr{
border:1px solid #1f2937;
margin:30px 0;
}

</style>

</head>

<body>

<div class="container">

<div class="card">

<img
class="logo"
src="https://raw.githubusercontent.com/Agungeth/XDOG-/main/logo.png"
>

<h1>XDOG</h1>

<p>
FIRST XRPL MEME INSCRIPTION
</p>

<hr>

<h2>TOKENOMICS</h2>

<p>Total Supply: 21,000,000</p>

<p>Per Mint: 1000 XDOG</p>

<p>Mint Price: 0.5 XRP</p>

<p>Minted: ${minted}</p>

<hr>

<h2>ABOUT</h2>

<p>
XDOG is an XRP Ledger inscription
project powered by XRPL and Xaman.
Built for collectors, degens,
and the XRP community.
</p>

<hr>

<h2>ROADMAP</h2>

<p>✅ Website Launch</p>

<p>✅ XRPL Mint System</p>

<p>✅ Auto Inscription Delivery</p>

<p>🔜 Marketplace</p>

<p>🔜 Community Airdrop</p>

<p>🔜 CEX Listing</p>

<hr>

<h2>FAQ</h2>

<p><b>Q:</b> What is XDOG?</p>

<p><b>A:</b> XDOG is a meme inscription on XRPL.</p>

<p><b>Q:</b> How many per mint?</p>

<p><b>A:</b> 1000 XDOG per mint.</p>

<p><b>Q:</b> Wallet support?</p>

<p><b>A:</b> Xaman Wallet.</p>

<a href="/mint">

<button>

MINT XDOG

</button>

</a>

<br><br>

<p style="font-size:12px;">

Powered by XRPL • XAMAN • RAILWAY

</p>

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
