// Function to format a number as a currency string with a comma separator
function formatCurrency(number, decimalPlaces = 2) {
    if (isNaN(number)) return 'N/A';
    return number.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
    });
}

function calculateProfit() {
    // --- 1. Get Input Values ---
    const capital_inr = parseFloat(document.getElementById('capital_inr').value);
    const inr_to_usd_rate = parseFloat(document.getElementById('inr_to_usd').value);
    const btc_spot_price_usd = parseFloat(document.getElementById('btc_spot_price').value);
    const buy_premium_usd = parseFloat(document.getElementById('buy_price').value);
    const sell_premium_usd = parseFloat(document.getElementById('sell_price').value);

    // Basic Input Validation
    if (isNaN(capital_inr) || isNaN(inr_to_usd_rate) || isNaN(btc_spot_price_usd) || isNaN(buy_premium_usd) || isNaN(sell_premium_usd)) {
        document.getElementById('result_output').innerHTML = '<p class="error">**Error:** Please enter valid numerical values for all fields.</p>';
        return;
    }

    // --- 2. Constants & Initial Conversions ---
    const GST_RATE = 0.18;
    const LOT_SIZE_BTC = 0.001;
    // Fee Rates (0.015% of Notional, 5% of Premium)
    const NOTIONAL_FEE_RATE = 0.015 / 100.0; // 0.00015
    const PREMIUM_CAP_RATE = 5.0 / 100.0;     // 0.05

    const capital_usd = capital_inr / inr_to_usd_rate;
    const notional_value_per_contract = btc_spot_price_usd * LOT_SIZE_BTC;

    // --- 3. BUY LEG COST CALCULATION ---
    
    // Fee = MIN( (0.015% * Notional Value), (5% * Premium) )
    const buy_fee_notional = notional_value_per_contract * NOTIONAL_FEE_RATE;
    const buy_fee_premium_cap = buy_premium_usd * PREMIUM_CAP_RATE;
    const buy_fee_before_gst = Math.min(buy_fee_notional, buy_fee_premium_cap);
    
    // Add 18% GST
    const buy_fee_with_gst = buy_fee_before_gst * (1 + GST_RATE);
    const cost_per_contract = buy_premium_usd + buy_fee_with_gst;
    
    // --- 4. Maximum Quantity ---
    // Max quantity is based on the total capital and the total cost (premium + fee)
    const max_quantity = Math.floor(capital_usd / cost_per_contract);

    if (max_quantity === 0) {
        document.getElementById('result_output').innerHTML = '<p class="error">**Error:** Capital is too low to purchase even one contract.</p>';
        return;
    }

    // --- 5. SELL LEG FEE CALCULATION ---
    const sell_fee_notional = notional_value_per_contract * NOTIONAL_FEE_RATE;
    const sell_fee_premium_cap = sell_premium_usd * PREMIUM_CAP_RATE;
    const sell_fee_before_gst = Math.min(sell_fee_notional, sell_fee_premium_cap);
    const sell_fee_with_gst = sell_fee_before_gst * (1 + GST_RATE);
    
    // --- 6. Calculate Total Profit and Fees ---
    const total_buy_fees_usd = max_quantity * buy_fee_with_gst;
    const total_sell_fees_usd = max_quantity * sell_fee_with_gst;
    const total_fees_usd = total_buy_fees_usd + total_sell_fees_usd;

    const gross_profit_usd = max_quantity * (sell_premium_usd - buy_premium_usd);
    const net_profit_usd = gross_profit_usd - total_fees_usd;
    const net_profit_inr = net_profit_usd * inr_to_usd_rate;

    // --- 7. Display Results ---
    const outputHtml = `
        <div class="result-box max-qty">
            <h3>📦 Maximum Quantity</h3>
            <p><strong>${formatCurrency(max_quantity, 0)}</strong> contracts</p>
        </div>
        <div class="result-box net-profit">
            <h3>💸 Net Profit (INR)</h3>
            <p><strong>₹${formatCurrency(net_profit_inr)}</strong></p>
        </div>
        <div class="result-box secondary">
            <p>Net Profit (USD): $${formatCurrency(net_profit_usd)}</p>
            <p>Gross Profit (USD): $${formatCurrency(gross_profit_usd)}</p>
            <p>Total Trading Fees (USD): $${formatCurrency(total_fees_usd)}</p>
            <hr>
            <p>Cost per contract (Buy): $${formatCurrency(cost_per_contract, 5)}</p>
            <p>Buy Fee (incl. GST): $${formatCurrency(buy_fee_with_gst, 5)}</p>
            <p>Sell Fee (incl. GST): $${formatCurrency(sell_fee_with_gst, 5)}</p>
        </div>
    `;

    document.getElementById('result_output').innerHTML = outputHtml;
}
