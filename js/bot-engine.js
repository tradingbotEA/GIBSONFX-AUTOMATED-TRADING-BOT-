class GibsonFXBotEngine {
  constructor(config){
    this.symbols = config.symbols || ['EURUSDT'];
    this.risk = config.riskPerTrade || 0.02;
    this.interval = config.analysisInterval || 5000;

    this.running = false;
    this.timer = null;
    this.currentSignal = null;
    this.tradeHistory = [];
  }

  start(){
    this.running = true;
    this.loop();
  }

  stop(){
    this.running = false;
    clearTimeout(this.timer);
  }

  loop(){
    if(!this.running) return;

    this.symbols.forEach(symbol => {

      const HTF = this.generateCandles(symbol, 80); // higher timeframe
      const LTF = this.generateCandles(symbol, 40); // lower timeframe

      const htfTrend = this.getHTFTrend(HTF);
      const ltfSignal = this.getLTFEntry(LTF, htfTrend);

      if(ltfSignal){
        this.currentSignal = ltfSignal;

        if(ltfSignal.confidence > 75){
          this.executeTrade(ltfSignal);
        }
      }

    });

    this.timer = setTimeout(()=>this.loop(), this.interval);
  }

  // 🔥 GENERATE MARKET DATA (SIMULATION)
  generateCandles(symbol, count){
    let candles = [];
    let price = this.getBasePrice(symbol);

    for(let i=0;i<count;i++){
      let open = price;
      let close = open + (Math.random() - 0.5) * 2;
      let high = Math.max(open, close) + Math.random();
      let low = Math.min(open, close) - Math.random();

      candles.push({open, high, low, close});
      price = close;
    }

    return candles;
  }

  getBasePrice(symbol){
    if(symbol.includes("BTC")) return 60000;
    if(symbol.includes("XAU")) return 2300;
    return 1.1;
  }

  // 🧠 HTF TREND (STRUCTURE)
  getHTFTrend(candles){
    const last = candles.slice(-20);

    const highs = last.map(c=>c.high);
    const lows = last.map(c=>c.low);

    const up = highs[highs.length-1] > highs[highs.length-5];
    const down = lows[lows.length-1] < lows[lows.length-5];

    if(up) return "BUY";
    if(down) return "SELL";
    return null;
  }

  // ⚡ LTF ENTRY (FVG + BOS + Liquidity)
  getLTFEntry(candles, trend){
    if(!trend) return null;

    const bos = this.detectBOS(candles);
    const fvg = this.detectFVG(candles);
    const liquidity = this.detectLiquidity(candles);

    if(!bos || !fvg) return null;

    let confidence = 50;

    if(bos) confidence += 15;
    if(fvg.valid) confidence += 20;
    if(liquidity) confidence += 15;

    // Align with HTF
    if(bos.direction === trend){
      confidence += 15;
    } else {
      return null;
    }

    const entry = fvg.mid;
    const range = fvg.size;

    const sl = trend === "BUY" ? entry - range : entry + range;
    const tp = trend === "BUY" ? entry + (range*2) : entry - (range*2);

    return {
      symbol: this.symbols[0],
      type: trend,
      confidence: Math.min(confidence,95),
      entry: entry.toFixed(2),
      sl: sl.toFixed(2),
      tp: tp.toFixed(2),
      time: new Date().toLocaleTimeString()
    };
  }

  // 📈 BOS
  detectBOS(candles){
    const last = candles.slice(-10);

    const prevHigh = last[last.length-2].high;
    const prevLow = last[last.length-2].low;

    const current = last[last.length-1];

    if(current.high > prevHigh){
      return {direction:"BUY"};
    }

    if(current.low < prevLow){
      return {direction:"SELL"};
    }

    return null;
  }

  // 💧 LIQUIDITY
  detectLiquidity(candles){
    const last = candles.slice(-5);

    const highs = last.map(c=>c.high);
    const lows = last.map(c=>c.low);

    return (
      last[last.length-1].high > Math.max(...highs.slice(0,-1)) ||
      last[last.length-1].low < Math.min(...lows.slice(0,-1))
    );
  }

  // 🟡 FAIR VALUE GAP (FVG)
  detectFVG(candles){
    for(let i=candles.length-3;i>=0;i--){
      const c1 = candles[i];
      const c2 = candles[i+1];
      const c3 = candles[i+2];

      // bullish FVG
      if(c1.high < c3.low){
        return {
          valid:true,
          mid:(c1.high + c3.low)/2,
          size:(c3.low - c1.high)
        };
      }

      // bearish FVG
      if(c1.low > c3.high){
        return {
          valid:true,
          mid:(c1.low + c3.high)/2,
          size:(c1.low - c3.high)
        };
      }
    }

    return {valid:false};
  }

  // 💰 TRADE EXECUTION (SIMULATED)
  executeTrade(signal){
    const win = Math.random() > 0.35;

    const profit = win
      ? (Math.random()*4).toFixed(2)
      : (-Math.random()*2).toFixed(2);

    const trade = {
      time: signal.time,
      market: signal.symbol,
      type: signal.type,
      profit: profit,
      closed: true
    };

    this.tradeHistory.push(trade);

    if(typeof tradeJournal !== "undefined") tradeJournal.push(trade);
    if(typeof balance !== "undefined") balance += parseFloat(profit);
    if(typeof updateUI === "function") updateUI();
    if(typeof saveUser === "function") saveUser();
  }

  getSignal(){
    return this.currentSignal;
  }
  }
