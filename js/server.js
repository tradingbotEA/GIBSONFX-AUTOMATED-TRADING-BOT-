// server.js
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 NEVER expose these in frontend
const API_KEY = 'YOUR_BINANCE_API_KEY';
const API_SECRET = 'YOUR_BINANCE_SECRET_KEY';

// SIGNED REQUEST
function sign(query){
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(query)
    .digest('hex');
}

// 📊 Get price
app.get('/price/:symbol', async (req,res)=>{
  try{
    const symbol = req.params.symbol;
    const r = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    res.json(r.data);
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

// 🚀 PLACE TRADE
app.post('/trade', async (req,res)=>{
  try{
    const { symbol, side, quantity } = req.body;

    const timestamp = Date.now();

    const query = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;

    const signature = sign(query);

    const url = `https://api.binance.com/api/v3/order?${query}&signature=${signature}`;

    const response = await axios.post(url, {}, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    res.json(response.data);

  }catch(err){
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 📊 BALANCE
app.get('/balance', async (req,res)=>{
  try{
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;
    const signature = sign(query);

    const url = `https://api.binance.com/api/v3/account?${query}&signature=${signature}`;

    const response = await axios.get(url, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    res.json(response.data);

  }catch(err){
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(3000, ()=>console.log("🚀 Server running on port 3000"));
