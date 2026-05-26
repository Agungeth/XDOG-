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
const MINT_PRICE = "500000" // 0.5 XRP

let minted = 0

/*
==================================
XRPL CLIENT
==================================
*/


const client =
new xrpl.Client(
"wss://xrplcluster.com/"

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

const inscriptionData = JSON.stringify({

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
"TX:",
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

app.get("/", (req, res) => {

res.send(`

<html>

<head>

<title>XDOG</title>

<style>

body{
background:#020617;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
font-family:Arial;
color:white;
margin:0;
}

.card{
background:#111827;
padding:40px;
border-radius:20px;
width:340px;
text-align:center;
box-shadow:0 0 20px #000;
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
}

p{
color:#9ca3af;
}

</style>

</head>

<body>

<div class="card">

<h1>XDOG</h1>

<p>XRP Ledger Inscription</p>

<p>Total Supply: 21,000,000</p>

<p>Per Mint: 1000 XDOG</p>

<p>Mint Price: 0.5 XRP</p>

<p>Minted: ${minted}</p>

<a href="/mint">
<button>MINT XDOG</button>
</a>

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
WEBHOOK AUTO DELIVERY
==================================
*/

app.post("/webhook", async (req, res) => {

try {

const data = req.body

if(
data.payloadResponse &&
data.payloadResponse.resolved
){

const userWallet =
data.response.account

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

app.listen(3000, async () => {

await connectXRPL()

console.log(
"XDOG AUTO INSCRIPTION LIVE"
)

})
