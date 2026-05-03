/**
 * GIBSONFX Elite PRO Bot Engine v1.0
 * Smart Money Concepts Trading System
 * Real-time market analysis with Binance API integration
 */

class GibsonFXBotEngine {
  constructor(config = {}) {
    // Configuration
    this.symbols = config.symbols || ['EURUSDT', 'GBPUSDT', 'XAUUSD', 'BTCUSDT'];
    this.analysisInterval = config.analysisInterval || 5000;
    this.riskPerTrade = config.riskPerTrade || 0.02;
    this.maxDrawdown = config.maxDrawdown || 0.20;
    this.minWinRate = config.minWinRate || 0.45;
    this.minConfidence = config.minConfidence || 0.65;

    // State
    this.isRunning = false;
    this.analysisLoop = null;
    this.marketData = {};
    this.signals = {};
    this.trades = [];
    this.stats = {
      totalTrades: 0,
      winTrades: 0,
      lossTrades: 0,
      totalProfit: 0,
      activeTrades: 0
    };
    this.openPositions = {};

    // Callbacks
    this.onSignal = config.onSignal || (() => {});
    this.onStats = config.onStats || (() => {});
  }

  /**
   * Start bot analysis
   */
  async start() {
    if (this.isRunning) {
      console.warn('Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 GIBSONFX Bot Started - Analyzing markets...');

    this.analysisLoop = setInterval(async () => {
      await this.analyzeAllMarkets();
    }, this.analysisInterval);

    // Initial analysis
    await this.analyzeAllMarkets();
  }

  /**
   * Stop bot analysis
   */
  stop() {
    if (this.analysisLoop) {
      clearInterval(this.analysisLoop);
    }
    this.isRunning = false;
    console.log('🛑 Bot Stopped');
  }

  /**
   * Analyze all markets
   */
  async analyzeAllMarkets() {
    for (const symbol of this.symbols) {
      try {
        const analysis = await this.analyzeMarket(symbol);
        const signal = this.generateSignal(analysis);

        if (signal && !this.openPositions[symbol]) {
          this.signals[symbol] = signal;
          this.onSignal(signal);
          this.executeSignal(signal, symbol);
        }
      } catch (error) {
        console.error(`Error analyzing ${symbol}:`, error.message);
      }
    }
  }

  /**
   * Analyze single market using SMC
   */
  async analyzeMarket(symbol) {
    try {
      // Fetch market data
      const candles = await this.fetchMarketData(symbol, 100);
      if (!candles || candles.length < 50) {
        return null;
      }

      // Extract OHLCV
      const prices = candles.map(c => ({
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        volume: parseFloat(c[5])
      }));

      // SMC Analysis
      const liquidity = this.detectLiquidity(prices);
      const orderBlocks = this.detectOrderBlocks(prices);
      const structure = this.analyzeMarketStructure(prices);
      const trend = this.confirmTrend(prices);
      const atr = this.calculateATR(prices, 14);

      return {
        symbol,
        price: prices[prices.length - 1].close,
        liquidity,
        orderBlocks,
        structure,
        trend,
        atr,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Market analysis failed for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Detect liquidity zones
   */
  detectLiquidity(prices) {
    const recent = prices.slice(-20);
    const highs = recent.map(p => p.high);
    const lows = recent.map(p => p.low);

    const resistance = Math.max(...highs);
    const support = Math.min(...lows);

    return {
      resistance,
      support,
      midpoint: (resistance + support) / 2,
      range: resistance - support
    };
  }

  /**
   * Detect institutional order blocks
   */
  detectOrderBlocks(prices) {
    const blocks = [];
    const recent = prices.slice(-50);

    for (let i = 2; i < recent.length - 1; i++) {
      const prev = recent[i - 2];
      const curr = recent[i - 1];
      const next = recent[i];

      // Bullish order block: Strong rally, then pullback
      if (
        curr.close > curr.open &&
        (curr.close - curr.open) > (prev.close - prev.open) * 1.5 &&
        next.close < curr.close
      ) {
        const strength = ((curr.close - curr.open) / curr.open) * 100;
        blocks.push({
          type: 'bullish',
          level: curr.low,
          strength: Math.min(100, strength * 10),
          index: i
        });
      }

      // Bearish order block: Strong decline, then bounce
      if (
        curr.close < curr.open &&
        (curr.open - curr.close) > (prev.open - prev.close) * 1.5 &&
        next.close > curr.close
      ) {
        const strength = ((curr.open - curr.close) / curr.open) * 100;
        blocks.push({
          type: 'bearish',
          level: curr.high,
          strength: Math.min(100, strength * 10),
          index: i
        });
      }
    }

    return blocks.filter(b => b.strength > 30).slice(-3);
  }

  /**
   * Analyze market structure (HH/HL, LH/LL)
   */
  analyzeMarketStructure(prices) {
    const recent = prices.slice(-30);
    const swingHighs = [];
    const swingLows = [];

    for (let i = 2; i < recent.length - 2; i++) {
      if (
        recent[i].high > recent[i - 1].high &&
        recent[i].high > recent[i - 2].high &&
        recent[i].high > recent[i + 1].high &&
        recent[i].high > recent[i + 2].high
      ) {
        swingHighs.push({ price: recent[i].high, index: i });
      }

      if (
        recent[i].low < recent[i - 1].low &&
        recent[i].low < recent[i - 2].low &&
        recent[i].low < recent[i + 1].low &&
        recent[i].low < recent[i + 2].low
      ) {
        swingLows.push({ price: recent[i].low, index: i });
      }
    }

    let structure = 'neutral';
    if (swingHighs.length >= 2) {
      const isUptrend =
        swingHighs[swingHighs.length - 1].price >
        swingHighs[swingHighs.length - 2].price;
      structure = isUptrend ? 'uptrend' : 'downtrend';
    }

    return {
      structure,
      swingHighs: swingHighs.slice(-2),
      swingLows: swingLows.slice(-2)
    };
  }

  /**
   * Confirm trend with moving averages
   */
  confirmTrend(prices) {
    const ma20 = this.calculateMA(prices, 20);
    const ma50 = this.calculateMA(prices, 50);
    const currentPrice = prices[prices.length - 1].close;

    let trend = 'neutral';
    let strength = 0;

    if (currentPrice > ma20 && ma20 > ma50) {
      trend = 'bullish';
      strength = Math.min(100, ((currentPrice - ma50) / ma50) * 1000);
    } else if (currentPrice < ma20 && ma20 < ma50) {
      trend = 'bearish';
      strength = Math.min(100, ((ma50 - currentPrice) / ma50) * 1000);
    }

    return { trend, strength, ma20, ma50, price: currentPrice };
  }

  /**
   * Generate trading signal
   */
  generateSignal(analysis) {
    if (!analysis) return null;

    let confidence = 0;
    let action = null;
    let reasoning = [];

    // Check liquidity
    if (
      analysis.price <= analysis.liquidity.resistance &&
      analysis.price >= analysis.liquidity.support
    ) {
      confidence += 20;
      reasoning.push('Price near liquidity zone');
    }

    // Check order blocks
    if (analysis.orderBlocks.length > 0) {
      const block = analysis.orderBlocks[0];
      confidence += 25;
      reasoning.push(`${block.type} order block at ${block.level.toFixed(4)}`);

      if (block.type === 'bullish') {
        action = 'BUY';
      } else {
        action = 'SELL';
      }
    }

    // Check market structure
    if (analysis.structure.structure !== 'neutral') {
      confidence += 15;
      reasoning.push(`Market in ${analysis.structure.structure}`);

      if (analysis.structure.structure === 'uptrend' && !action) {
        action = 'BUY';
      } else if (analysis.structure.structure === 'downtrend' && !action) {
        action = 'SELL';
      }
    }

    // Check trend confirmation
    if (analysis.trend.trend !== 'neutral') {
      confidence += 30;
      reasoning.push(`${analysis.trend.trend} trend (strength: ${analysis.trend.strength.toFixed(1)}%)`);

      if (analysis.trend.trend === 'bullish' && !action) {
        action = 'BUY';
      } else if (analysis.trend.trend === 'bearish' && !action) {
        action = 'SELL';
      }
    }

    // Generate signal if confidence meets threshold
    if (confidence >= this.minConfidence * 100 && action) {
      const entry = analysis.price;
      const stopLoss =
        action === 'BUY'
          ? entry - analysis.atr * 1.5
          : entry + analysis.atr * 1.5;
      const takeProfit =
        action === 'BUY'
          ? entry + analysis.atr * 3
          : entry - analysis.atr * 3;

      const riskReward =
        Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);

      if (riskReward >= 1.5) {
        return {
          symbol: analysis.symbol,
          action,
          confidence: Math.min(100, confidence),
          entry,
          stopLoss,
          takeProfit,
          riskReward,
          reasoning: reasoning.join(' | '),
          timestamp: new Date()
        };
      }
    }

    return null;
  }

  /**
   * Execute trading signal
   */
  executeSignal(signal, symbol) {
    const positionSize = (balance * this.riskPerTrade) / Math.abs(signal.entry - signal.stopLoss);

    this.openPositions[symbol] = {
      signal,
      positionSize,
      entryTime: new Date(),
      status: 'open'
    };

    this.stats.activeTrades = Object.keys(this.openPositions).length;
    this.onStats(this.getStats());

    console.log(
      `📊 ${signal.action} ${symbol} @ ${signal.entry.toFixed(4)} | Risk: ${(
        positionSize * Math.abs(signal.entry - signal.stopLoss)
      ).toFixed(2)} | RR: ${signal.riskReward.toFixed(2)}`
    );
  }

  /**
   * Fetch market data from Binance
   */
  async fetchMarketData(symbol, limit = 100) {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=${limit}`
      );
      if (!response.ok) throw new Error('Binance API error');
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${symbol} data:`, error);
      return null;
    }
  }

  /**
   * Calculate Moving Average
   */
  calculateMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1].close;
    const sum = prices
      .slice(-period)
      .reduce((acc, p) => acc + p.close, 0);
    return sum / period;
  }

  /**
   * Calculate Average True Range
   */
  calculateATR(prices, period) {
    let tr = 0;
    for (let i = 1; i < Math.min(prices.length, period + 1); i++) {
      const high = prices[i].high;
      const low = prices[i].low;
      const prevClose = prices[i - 1].close;

      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      tr += Math.max(tr1, tr2, tr3);
    }
    return tr / period;
  }

  /**
   * Get bot statistics
   */
  getStats() {
    return {
      totalTrades: this.stats.totalTrades,
      winTrades: this.stats.winTrades,
      lossTrades: this.stats.lossTrades,
      winRate: this.stats.totalTrades > 0 ? (this.stats.winTrades / this.stats.totalTrades).toFixed(2) : 0,
      totalProfit: this.stats.totalProfit.toFixed(2),
      activeTrades: this.stats.activeTrades,
      isRunning: this.isRunning
    };
  }

  /**
   * Get current signals
   */
  getSignals() {
    return this.signals;
  }

  /**
   * Get trade history
   */
  getTradeHistory() {
    return this.trades;
  }

  /**
   * Close position
   */
  closePosition(symbol, exitPrice) {
    const position = this.openPositions[symbol];
    if (!position) return;

    const pnl =
      position.signal.action === 'BUY'
        ? (exitPrice - position.signal.entry) * position.positionSize
        : (position.signal.entry - exitPrice) * position.positionSize;

    this.stats.totalTrades++;
    if (pnl > 0) {
      this.stats.winTrades++;
    } else {
      this.stats.lossTrades++;
    }
    this.stats.totalProfit += pnl;

    this.trades.push({
      symbol,
      action: position.signal.action,
      entry: position.signal.entry,
      exit: exitPrice,
      positionSize: position.positionSize,
      pnl,
      duration: new Date() - position.entryTime
    });

    delete this.openPositions[symbol];
    this.stats.activeTrades = Object.keys(this.openPositions).length;
    this.onStats(this.getStats());
  }
}

// Initialize global instance
let botEngine = new GibsonFXBotEngine();
