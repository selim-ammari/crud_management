/**
 * Sales Prediction Algorithm
 * 
 * This script predicts future sales amounts for each product based on historical data.
 * It uses a simple moving average approach with trend analysis.
 * 
 * Usage: node sql/sales_prediction.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Allow database path to be specified via environment variable or use default
const DB_PATH = process.env.ECOMMERCE_DB_PATH || path.join(__dirname, 'ecommerce.db');

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
  console.error(`Error: Database file not found at ${DB_PATH}`);
  console.error('Please run the structure.sql file first to create the database.');
  console.error('Example: sqlite3 ecommerce.db < structure.sql');
  process.exit(1);
}

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

/**
 * Calculate moving average for a product's sales
 */
function calculateMovingAverage(productId, days = 30) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        DATE(oi.created_at) as sale_date,
        SUM(oi.quantity * oi.unit_price) as daily_sales
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ?
        AND o.status = 'completed'
        AND o.created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(oi.created_at)
      ORDER BY sale_date DESC
    `;

    db.all(query, [productId, days], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        resolve({ average: 0, trend: 0, dataPoints: 0 });
        return;
      }

      // Calculate average daily sales
      const totalSales = rows.reduce((sum, row) => sum + row.daily_sales, 0);
      const average = totalSales / rows.length;

      // Calculate trend (simple linear regression slope)
      let trend = 0;
      if (rows.length > 1) {
        const n = rows.length;
        const xValues = Array.from({ length: n }, (_, i) => i);
        const yValues = rows.map(row => row.daily_sales).reverse();
        
        const xMean = xValues.reduce((a, b) => a + b, 0) / n;
        const yMean = yValues.reduce((a, b) => a + b, 0) / n;
        
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < n; i++) {
          numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
          denominator += Math.pow(xValues[i] - xMean, 2);
        }
        
        trend = denominator !== 0 ? numerator / denominator : 0;
      }

      // Get all sales values for variance calculation
      const allSales = rows.map(row => row.daily_sales);
      
      resolve({
        average,
        trend,
        dataPoints: rows.length,
        recentSales: allSales.slice(0, 7), // Last 7 days
        allSales: allSales // All sales for variance calculation
      });
    });
  });
}

/**
 * Predict sales for a product over a specified number of days
 */
async function predictSales(productId, predictionDays = 7) {
  const stats = await calculateMovingAverage(productId, 30);
  
  // If no historical data, return zero predictions
  if (stats.dataPoints === 0) {
    const zeroPredictions = Array.from({ length: predictionDays }, (_, i) => ({
      day: i + 1,
      predictedSales: 0
    }));
    return {
      productId,
      averageDailySales: 0,
      trend: 0,
      dataPoints: 0,
      predictions: zeroPredictions,
      totalPredictedSales: 0
    };
  }
  
  // Calculate variance for more realistic predictions
  const salesData = stats.allSales || stats.recentSales || [];
  const variance = salesData.length > 1
    ? salesData.reduce((sum, val) => sum + Math.pow(val - stats.average, 2), 0) / salesData.length
    : Math.pow(stats.average * 0.15, 2); // Default to 15% variance if not enough data
  
  const stdDev = Math.sqrt(variance);
  
  const predictions = [];
  for (let day = 1; day <= predictionDays; day++) {
    // Base prediction on moving average with trend adjustment
    const basePrediction = stats.average;
    const trendAdjustment = stats.trend * day;
    
    // Add some randomness based on historical variance (but keep it deterministic for same input)
    // Use a simple pseudo-random based on day and productId to make it consistent but varied
    const seed = (productId * 1000 + day) % 100;
    const randomFactor = (seed / 100 - 0.5) * 2; // -1 to 1
    const varianceAdjustment = randomFactor * stdDev * 0.5; // Scale down the variance
    
    // Apply day-of-week effect (simulate lower sales on weekends)
    const dayOfWeek = (day - 1) % 7;
    const weekendFactor = (dayOfWeek === 5 || dayOfWeek === 6) ? 0.8 : 1.0; // 20% reduction on weekends
    
    const predictedSales = Math.max(0, (basePrediction + trendAdjustment + varianceAdjustment) * weekendFactor);
    
    predictions.push({
      day,
      predictedSales: Math.round(predictedSales * 100) / 100
    });
  }

  return {
    productId,
    averageDailySales: Math.round(stats.average * 100) / 100,
    trend: Math.round(stats.trend * 100) / 100,
    dataPoints: stats.dataPoints,
    predictions,
    totalPredictedSales: Math.round(
      predictions.reduce((sum, p) => sum + p.predictedSales, 0) * 100
    ) / 100
  };
}

/**
 * Get all products
 */
function getAllProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name, sku FROM products ORDER BY id', [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

/**
 * Main function to generate predictions for all products
 */
async function generatePredictions(predictionDays = 7) {
  try {
    console.log('='.repeat(60));
    console.log('SALES PREDICTION REPORT');
    console.log('='.repeat(60));
    console.log(`Prediction Period: Next ${predictionDays} days\n`);

    const products = await getAllProducts();
    
    if (products.length === 0) {
      console.log('No products found in database.');
      return;
    }

    const allPredictions = [];

    for (const product of products) {
      const prediction = await predictSales(product.id, predictionDays);
      allPredictions.push({
        ...prediction,
        productName: product.name,
        sku: product.sku
      });
    }

    // Display predictions
    for (const pred of allPredictions) {
      console.log(`\nProduct: ${pred.productName} (${pred.sku})`);
      console.log(`- Average Daily Sales (last 30 days): $${pred.averageDailySales}`);
      console.log(`- Trend: ${pred.trend >= 0 ? '+' : ''}${pred.trend.toFixed(2)} per day`);
      console.log(`- Data Points Used: ${pred.dataPoints}`);
      console.log(`- Predicted Sales for Next ${predictionDays} Days:`);
      
      pred.predictions.forEach(p => {
        console.log(`  Day ${p.day}: $${p.predictedSales}`);
      });
      
      console.log(`- Total Predicted Sales: $${pred.totalPredictedSales}`);
      console.log('-'.repeat(60));
    }

    // Summary
    console.log('\nSUMMARY');
    console.log('='.repeat(60));
    const grandTotal = allPredictions.reduce((sum, p) => sum + p.totalPredictedSales, 0);
    console.log(`Total Predicted Sales (All Products): $${Math.round(grandTotal * 100) / 100}`);
    console.log(`Average Daily Sales (All Products): $${Math.round(grandTotal / predictionDays * 100) / 100}`);

  } catch (error) {
    console.error('Error generating predictions:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
    });
  }
}

// Run predictions if script is executed directly
if (require.main === module) {
  const predictionDays = process.argv[2] ? parseInt(process.argv[2]) : 7;
  generatePredictions(predictionDays);
}

module.exports = { predictSales, calculateMovingAverage, generatePredictions };

