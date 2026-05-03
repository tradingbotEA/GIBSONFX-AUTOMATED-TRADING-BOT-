# GIBSONFX Bot Engine - User Guide

## Overview

The GIBSONFX Elite PRO bot engine implements **Smart Money Concepts (SMC)** trading strategy using real market data from Binance API. This is a professional-grade trading system that analyzes price action like institutions do.

## Features

### 🎯 Smart Money Concepts (SMC)

1. **Liquidity Detection**
   - Identifies institutional accumulation/distribution zones
   - Detects liquidity sweeps (LS) - where smart money hunts stop losses
   - Maps high and low liquidity areas

2. **Order Block Analysis**
   - Finds institutional order blocks (temporary imbalances)
   - Bullish order blocks (accumulation) and Bearish (distribution)
   - Strength scoring based on candle body size

3. **Market Structure Analysis**
   - Detects higher highs/lows (uptrend) and lower lows/highs (downtrend)
   - Identifies market swing points
   - Confirms trend direction

4. **Trend Confirmation**
   - Uses moving averages (20/50)
   - Validates with market structure
   - Assigns confidence levels

### 📊 Live Trading Signals

- **BUY/SELL signals** with confidence levels (0-100%)
- **Entry, Stop Loss, Take Profit** levels calculated with ATR
- **Risk-Reward ratios** (typically 1:2 or better)
- **Signal reasoning** explaining the analysis

## Getting Started

### 1. Start the Bot

1. Navigate to **Trading Bot** page
2. Select markets (EUR/USD, GBP/USD, XAU/USD, BTC/USD)
3. Adjust settings:
   - Risk Per Trade: 2% (default, 1-10%)
   - Analysis Interval: 5000ms (5 seconds)
4. Click **🚀 Start Real Bot**

### 2. Monitor Signals

- Real-time signals appear on the **Dashboard**
- Each signal shows:
  - Action (BUY/SELL)
  - Entry price
  - Confidence percentage
  - Risk-Reward ratio
  - Analysis reasoning

### 3. View Statistics

Click **📈 View Statistics** to see:
- Total trades & win rate
- Profit/Loss breakdown
- Recent trade history with P&L

## Configuration

### Risk Management

```javascript
riskPerTrade: 0.02    // 2% of account per trade
maxDrawdown: 0.20     // Max 20% drawdown
minWinRate: 0.45      // Minimum acceptable win rate
```

### Market Data

Symbols supported:
- `EURUSDT` - EUR/USD
- `GBPUSDT` - GBP/USD
- `XAUUSD` - Gold
- `BTCUSDT` - Bitcoin

### Analysis Intervals

- **1000ms** - Very frequent (high CPU, more trades)
- **5000ms** - Recommended (balanced)
- **10000ms+** - Conservative (fewer trades, confirmation)

## Understanding Signals

### Signal Confidence Levels

| Confidence | Action |
|-----------|--------|
| 65-75% | Trading (good confluence) |
| 75-85% | Strong (multiple confluences) |
| 85%+ | Very Strong (all indicators agree) |

### Confidence Builder

1. **Liquidity** (+20%) - Found support/resistance
2. **Order Block** (+25%) - Institutional level identified
3. **Trend** (+30%) - Confirmed direction
4. **Market Structure** (+15%) - Swing alignment
5. **Risk-Reward** - Must be > 1.5:1

## Trade Execution

### Entry Rules
- Action triggered when confidence > 65%
- Position sized by risk percentage
- ATR used for stop loss calculation

### Exit Rules
- **Take Profit**: Hit when price reaches calculated target
- **Stop Loss**: Hit when price breaches SL level
- Auto-close after 5+ candles if no hit

### Position Management
- Max 1 trade per symbol simultaneously
- Risk-Reward minimum: 1.5:1
- Max 5 open trades across all symbols

## Performance Tracking

The bot tracks:
- **Total Trades**: Cumulative number
- **Win Rate**: % of profitable trades
- **Total Profit**: Net P&L in account currency
- **Active Trades**: Currently open positions
- **Trade History**: Last 20 closed trades

## Troubleshooting

### No Signals Generated

1. Check internet connection
2. Verify Binance API is accessible
3. Ensure market data is available
4. Check market is not in extreme consolidation

### Bot Stops Running

1. Check browser console for errors
2. Verify Firebase auth is active
3. Restart bot

### Signals Not Executing

1. Verify confidence level > 65%
2. Check position sizing is valid
3. Ensure balance > position size

## Advanced Configuration

### Customize Bot Engine

```javascript
// Create custom instance
const customBot = new GibsonFXBotEngine({
  symbols: ['EURUSDT', 'XAUUSD'],
  riskPerTrade: 0.03,
  analysisInterval: 10000,
  minWinRate: 0.50
});

customBot.start();
```

### Add Custom Analysis

```javascript
// Extend bot class
class CustomBot extends GibsonFXBotEngine {
  generateSignal(analysis) {
    // Your custom logic
    return super.generateSignal(analysis);
  }
}
```

## API Reference

### Methods

#### `start()`
- Begins bot analysis loop
- Fetches market data continuously
- Generates signals

#### `stop()`
- Stops analysis loop
- Closes all open positions (optional)

#### `getStats()`
- Returns performance statistics
- Structure:
  ```javascript
  {
    totalTrades: 25,
    winTrades: 15,
    lossTrades: 10,
    winRate: 0.6,
    totalProfit: 1250.50,
    activeTrades: 2,
    isRunning: true
  }
  ```

#### `getSignals()`
- Returns current signals for all symbols
- Signal object includes confidence, entry, SL, TP

#### `getTradeHistory()`
- Returns array of closed trades
- Each trade includes entry, exit, P&L

## Risk Disclaimer

This is a **demo/educational system**. Always:
- Start with small position sizes
- Test thoroughly before live trading
- Monitor bot regularly
- Have manual override capability
- Understand risks before deploying

## Support

For issues or questions:
- Check browser console for error messages
- Review Binance API status
- Contact support via WhatsApp: +254786810591

---

**GIBSONFX Elite PRO Bot Engine v1.0**
*Real Smart Money Trading System*
