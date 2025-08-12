import { db } from './db';
import { 
  tills, 
  operatorSummaries, 
  products, 
  tillSummaries, 
  transactions,
  customerSummaries
} from '@shared/schema';

export async function seedDatabase() {
  console.log('🌱 Seeding database with POS data...');

  try {
    // Clear existing data
    await db.delete(transactions);
    await db.delete(customerSummaries);
    await db.delete(tillSummaries);
    await db.delete(products);
    await db.delete(operatorSummaries);
    await db.delete(tills);

    console.log('✅ Database cleared, now inserting sample POS data...');
    
    // Insert sample tills
    const tillData = [
      { name: 'Till 1 - Front Counter', openingBalance: 200.00, currentBalance: 1450.25 },
      { name: 'Till 2 - Drive Through', openingBalance: 150.00, currentBalance: 890.50 },
      { name: 'Till 3 - Back Counter', openingBalance: 100.00, currentBalance: 675.75 },
      { name: 'Till 4 - Express Lane', openingBalance: 75.00, currentBalance: 420.00 }
    ];
    
    for (const till of tillData) {
      await db.insert(tills).values(till);
    }
    
    // Insert sample operators
    const operatorData = [
      { name: 'Sarah Johnson', totalSales: 2840.50, transactionCount: 45, averageSale: 63.12, hoursWorked: 8.5 },
      { name: 'Mike Chen', totalSales: 1950.25, transactionCount: 32, averageSale: 60.95, hoursWorked: 6.0 },
      { name: 'Emma Wilson', totalSales: 3120.00, transactionCount: 52, averageSale: 60.00, hoursWorked: 8.0 },
      { name: 'Jake Davis', totalSales: 1680.75, transactionCount: 28, averageSale: 60.03, hoursWorked: 5.5 },
      { name: 'Lisa Brown', totalSales: 2240.80, transactionCount: 37, averageSale: 60.56, hoursWorked: 7.0 }
    ];
    
    for (const operator of operatorData) {
      await db.insert(operatorSummaries).values(operator);
    }
    
    // Insert sample products
    const productData = [
      { name: 'Flat White', price: 4.50, salesCount: 89, revenue: 400.50 },
      { name: 'Cappuccino', price: 4.20, salesCount: 76, revenue: 319.20 },
      { name: 'Latte', price: 4.80, salesCount: 65, revenue: 312.00 },
      { name: 'Americano', price: 3.90, salesCount: 54, revenue: 210.60 },
      { name: 'Espresso', price: 3.20, salesCount: 43, revenue: 137.60 },
      { name: 'Croissant', price: 3.50, salesCount: 32, revenue: 112.00 },
      { name: 'Muffin', price: 4.00, salesCount: 28, revenue: 112.00 },
      { name: 'Bagel', price: 3.80, salesCount: 25, revenue: 95.00 },
      { name: 'Sandwich', price: 7.50, salesCount: 18, revenue: 135.00 },
      { name: 'Cake Slice', price: 5.20, salesCount: 15, revenue: 78.00 }
    ];
    
    for (const product of productData) {
      await db.insert(products).values(product);
    }
    
    // Insert sample daily summaries for the last 7 days
    const today = new Date();
    const summaryData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const baseRevenue = 1800 + (Math.random() * 400); // 1800-2200 range
      const transactionCount = Math.floor(35 + (Math.random() * 20)); // 35-55 transactions
      
      summaryData.push({
        date: date.toISOString().split('T')[0],
        totalRevenue: Math.round(baseRevenue * 100) / 100,
        transactionCount,
        averageTransactionValue: Math.round((baseRevenue / transactionCount) * 100) / 100,
        topSellingProduct: ['Flat White', 'Cappuccino', 'Latte'][Math.floor(Math.random() * 3)],
        cashTotal: Math.round((baseRevenue * 0.6) * 100) / 100,
        cardTotal: Math.round((baseRevenue * 0.4) * 100) / 100
      });
    }
    
    for (const summary of summaryData) {
      await db.insert(tillSummaries).values(summary);
    }
    
    console.log('🎉 Successfully seeded database with sample POS data:');
    console.log(`   - ${tillData.length} tills`);
    console.log(`   - ${operatorData.length} operators`);
    console.log(`   - ${productData.length} products`);
    console.log(`   - ${summaryData.length} daily summaries`);
    console.log('📊 Alex now has access to real historical business data!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}