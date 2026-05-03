/**
 * UI Integration for GIBSONFX Bot Engine
 * Handles real-time signal display and statistics
 */

// Bot configuration
const botConfig = {
  symbols: ['EURUSDT', 'GBPUSDT', 'XAUUSD', 'BTCUSDT'],
  analysisInterval: 5000,
  riskPerTrade: 0.02,
  minConfidence: 0.65,
  onSignal: handleNewSignal,
  onStats: updateBotStats
};

// Initialize bot engine
let botEngine = new GibsonFXBotEngine(botConfig);
let isRealBotRunning = false;

/**
 * Start real trading bot
 */
function startRealBot() {
  if (isRealBotRunning) {
    alert('Bot is already running!');
    return;
  }

  isRealBotRunning = true;
  botEngine.start();
  document.getElementById('botStatus').innerText = 'Running 🟢';
  document.getElementById('botStatus').style.color = '#00FF00';
  
  // Update button appearance
  const startBtn = document.querySelector('button[onclick="startRealBot()"]');
  if (startBtn) startBtn.disabled = true;
}

/**
 * Stop real trading bot
 */
function stopRealBot() {
  if (!isRealBotRunning) {
    alert('Bot is not running!');
    return;
  }

  isRealBotRunning = false;
  botEngine.stop();
  document.getElementById('botStatus').innerText = 'Stopped 🔴';
  document.getElementById('botStatus').style.color = '#FF0000';
  
  // Update button appearance
  const startBtn = document.querySelector('button[onclick="startRealBot()"]');
  if (startBtn) startBtn.disabled = false;
}

/**
 * Handle new signal from bot
 */
function handleNewSignal(signal) {
  if (!signal) return;

  console.log('📊 New Signal:', signal);

  // Update signal display for specific market
  const signalElement = document.getElementById(`signal${signal.symbol}`);
  if (signalElement) {
    signalElement.innerHTML = `
      <div style="background: ${signal.action === 'BUY' ? '#00FF00' : '#FF0000'}; color: black; padding: 10px; border-radius: 5px; margin: 10px 0;">
        <strong>${signal.action}</strong><br>
        Confidence: ${signal.confidence.toFixed(1)}%<br>
        Entry: ${signal.entry.toFixed(4)}<br>
        SL: ${signal.stopLoss.toFixed(4)} | TP: ${signal.takeProfit.toFixed(4)}<br>
        Risk-Reward: ${signal.riskReward.toFixed(2)}:1<br>
        <small>${signal.reasoning}</small>
      </div>
    `;
  }

  // Update live signal display
  const liveSignalElement = document.getElementById('liveSignal');
  if (liveSignalElement) {
    liveSignalElement.innerText = `${signal.action} ${signal.symbol}`;
    liveSignalElement.style.color = signal.action === 'BUY' ? '#00FF00' : '#FF0000';
  }

  // Add to trade journal
  addToTradeJournal(signal);
}

/**
 * Update bot statistics display
 */
function updateBotStats(stats) {
  document.getElementById('totalTrades').innerText = stats.totalTrades;
  document.getElementById('winRate').innerText = (stats.winRate * 100).toFixed(1) + '%';
  document.getElementById('totalProfit').innerText = '$' + stats.totalProfit;
  document.getElementById('activeTrades').innerText = stats.activeTrades;
}

/**
 * Add signal to trade journal
 */
function addToTradeJournal(signal) {
  const journal = document.getElementById('tradeJournal');
  if (!journal) return;

  const entry = document.createElement('div');
  entry.style.cssText = 'background: #1a2238; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid ' + (signal.action === 'BUY' ? '#00FF00' : '#FF0000') + ';';
  entry.innerHTML = `
    <p style="margin: 0; font-size: 12px;">
      <strong>${signal.action}</strong> ${signal.symbol} @ ${signal.entry.toFixed(4)}
      | Confidence: ${signal.confidence.toFixed(1)}% | RR: ${signal.riskReward.toFixed(2)}:1
    </p>
  `;

  journal.insertBefore(entry, journal.firstChild);

  // Keep only last 20
  while (journal.children.length > 20) {
    journal.removeChild(journal.lastChild);
  }
}

/**
 * Configure bot settings
 */
function configureBotSettings() {
  const riskInput = prompt('Risk per trade (0.01-0.10):', botEngine.riskPerTrade);
  if (riskInput) {
    const risk = parseFloat(riskInput);
    if (risk >= 0.01 && risk <= 0.10) {
      botEngine.riskPerTrade = risk;
      alert('Risk per trade updated to ' + (risk * 100).toFixed(1) + '%');
    } else {
      alert('Invalid risk value');
    }
  }
}

/**
 * View bot statistics
 */
function viewBotStatistics() {
  const stats = botEngine.getStats();
  const statsText = `
📊 GIBSONFX Bot Statistics

Total Trades: ${stats.totalTrades}
Win Trades: ${stats.winTrades}
Lose Trades: ${stats.lossTrades}
Win Rate: ${(stats.winRate * 100).toFixed(1)}%
Total Profit: $${stats.totalProfit}
Active Trades: ${stats.activeTrades}
Status: ${stats.isRunning ? '🟢 Running' : '🔴 Stopped'}
  `;

  alert(statsText);
}

/**
 * Export trade history
 */
function exportTradeHistory() {
  const trades = botEngine.getTradeHistory();
  const csv = 'Symbol,Action,Entry,Exit,Position Size,P&L,Duration\n' +
    trades.map(t => `${t.symbol},${t.action},${t.entry.toFixed(4)},${t.exit.toFixed(4)},${t.positionSize.toFixed(2)},${t.pnl.toFixed(2)},${t.duration}ms`).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GIBSONFX_trades_' + new Date().getTime() + '.csv';
  a.click();
}

/**
 * Initialize real bot UI
 */
function initializeRealBotUI() {
  console.log('✅ Real Bot UI Initialized');

  // Replace old bot functions
  window.startBot = startRealBot;
  window.stopBot = stopRealBot;

  // Add new bot control buttons
  const botPage = document.getElementById('bot');
  if (botPage) {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'background: #121a2b; padding: 20px; border-radius: 10px; margin-top: 20px;';
    controlsDiv.innerHTML = `
      <h3>🚀 Real Bot Controls</h3>
      <button class="btn" onclick="startRealBot()" style="background: #00FF00; color: black; margin-right: 10px;">Start Real Bot</button>
      <button class="btn" onclick="stopRealBot()" style="background: #FF0000; color: white; margin-right: 10px;">Stop Real Bot</button>
      <button class="btn" onclick="configureBotSettings()" style="margin-right: 10px;">⚙️ Settings</button>
      <button class="btn" onclick="viewBotStatistics()" style="margin-right: 10px;">📈 View Statistics</button>
      <button class="btn" onclick="exportTradeHistory()">📥 Export Trades</button>
      
      <h4 style="margin-top: 20px; color: #00eaff;">Real-Time Statistics</h4>
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div>
          <p>Total Trades: <strong id="totalTrades">0</strong></p>
        </div>
        <div>
          <p>Win Rate: <strong id="winRate">0%</strong></p>
        </div>
        <div>
          <p>Total Profit: <strong id="totalProfit">$0</strong></p>
        </div>
        <div>
          <p>Active Trades: <strong id="activeTrades">0</strong></p>
        </div>
      </div>
    `;
    botPage.appendChild(controlsDiv);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRealBotUI);
} else {
  initializeRealBotUI();
}
