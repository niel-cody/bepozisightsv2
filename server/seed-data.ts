import { db } from './db';
import { 
  tills, 
  operators, 
  products, 
  dailySummaries, 
  transactions 
} from '@shared/schema';

export async function seedDatabase() {
  console.log('🌱 Seeding database with POS data...');

  try {
    // Clear existing data
    await db.delete(transactions);
    await db.delete(dailySummaries);
    await db.delete(products);
    await db.delete(operators);
    await db.delete(tills);

    // Seed Tills
    const tillData = [
      {
        name: "Till 1 - Front Counter",
        location: "Front Counter",
        status: "active",
        cashBalance: "1250.75"
      },
      {
        name: "Till 2 - Drive Through", 
        location: "Drive Through",
        status: "active",
        cashBalance: "892.50"
      },
      {
        name: "Till 3 - Back Counter",
        location: "Back Counter", 
        status: "active",
        cashBalance: "456.25"
      },
      {
        name: "Till 4 - Mobile Cart",
        location: "Mobile Unit",
        status: "maintenance",
        cashBalance: "0.00"
      }
    ];

    const insertedTills = await db.insert(tills).values(tillData).returning();
    console.log(`✓ Inserted ${insertedTills.length} tills`);

    // Seed Operators  
    const operatorData = [
      {
        name: "Maria Rodriguez",
        employeeId: "EMP001", 
        role: "Senior Cashier",
        status: "active",
        totalSales: "15420.75",
        transactionCount: 287
      },
      {
        name: "James Wilson",
        employeeId: "EMP002",
        role: "Cashier", 
        status: "active",
        totalSales: "12830.50",
        transactionCount: 245
      },
      {
        name: "Sarah Chen",
        employeeId: "EMP003",
        role: "Cashier",
        status: "active", 
        totalSales: "11650.25",
        transactionCount: 198
      },
      {
        name: "Mike Johnson", 
        employeeId: "EMP004",
        role: "Part-time Cashier",
        status: "active",
        totalSales: "8920.00",
        transactionCount: 156
      },
      {
        name: "Lisa Thompson",
        employeeId: "EMP005", 
        role: "Shift Supervisor",
        status: "active",
        totalSales: "13240.80",
        transactionCount: 203
      }
    ];

    const insertedOperators = await db.insert(operators).values(operatorData).returning();
    console.log(`✓ Inserted ${insertedOperators.length} operators`);

    // Seed Products
    const productData = [
      {
        name: "Americano",
        category: "Coffee",
        price: "3.50",
        stock: 150,
        soldToday: 47,
        revenue: "164.50"
      },
      {
        name: "Latte", 
        category: "Coffee",
        price: "4.25",
        stock: 120,
        soldToday: 52,
        revenue: "221.00"
      },
      {
        name: "Cappuccino",
        category: "Coffee", 
        price: "4.00",
        stock: 110,
        soldToday: 38,
        revenue: "152.00"
      },
      {
        name: "Matcha Latte",
        category: "Specialty",
        price: "5.25", 
        stock: 85,
        soldToday: 29,
        revenue: "152.25"
      },
      {
        name: "Espresso",
        category: "Coffee",
        price: "2.75",
        stock: 200,
        soldToday: 41,
        revenue: "112.75"
      },
      {
        name: "Club Sandwich",
        category: "Food",
        price: "8.50",
        stock: 45,
        soldToday: 18,
        revenue: "153.00"
      },
      {
        name: "Avocado Toast", 
        category: "Food",
        price: "7.25",
        stock: 30,
        soldToday: 14,
        revenue: "101.50"
      },
      {
        name: "Croissant",
        category: "Pastry",
        price: "3.25",
        stock: 60,
        soldToday: 31,
        revenue: "100.75"
      },
      {
        name: "Muffin - Blueberry",
        category: "Pastry", 
        price: "2.95",
        stock: 40,
        soldToday: 22,
        revenue: "64.90"
      },
      {
        name: "Bagel with Cream Cheese",
        category: "Food",
        price: "4.50",
        stock: 35,
        soldToday: 16,
        revenue: "72.00"
      }
    ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`✓ Inserted ${insertedProducts.length} products`);

    // Seed Daily Summaries for the past week
    const today = new Date();
    const summaryData = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic daily sales data
      const baseAmount = 12000 + Math.random() * 8000; // $12k-20k daily
      const transactionCount = Math.floor(180 + Math.random() * 120); // 180-300 transactions
      const avgTransaction = baseAmount / transactionCount;
      
      summaryData.push({
        date: dateStr,
        totalSales: baseAmount.toFixed(2),
        transactionCount,
        averageTransaction: avgTransaction.toFixed(2),
        topProduct: productData[Math.floor(Math.random() * productData.length)].name,
        topOperator: operatorData[Math.floor(Math.random() * operatorData.length)].name
      });
    }

    const insertedSummaries = await db.insert(dailySummaries).values(summaryData).returning();
    console.log(`✓ Inserted ${insertedSummaries.length} daily summaries`);

    // Generate some sample transactions for today
    const transactionData = [];
    const todayStr = today.toISOString().split('T')[0];
    
    for (let i = 0; i < 25; i++) {
      const tillId = insertedTills[Math.floor(Math.random() * insertedTills.length)].id;
      const operatorId = insertedOperators[Math.floor(Math.random() * insertedOperators.length)].id;
      const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      const quantity = Math.floor(1 + Math.random() * 3);
      const amount = (parseFloat(product.price) * quantity).toFixed(2);
      
      // Create timestamp for today with random hour/minute
      const timestamp = new Date(today);
      timestamp.setHours(Math.floor(8 + Math.random() * 12)); // 8 AM to 8 PM
      timestamp.setMinutes(Math.floor(Math.random() * 60));
      
      transactionData.push({
        tillId,
        operatorId,
        amount,
        items: JSON.stringify([{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity
        }]),
        timestamp,
        paymentMethod: Math.random() > 0.3 ? "card" : "cash"
      });
    }

    const insertedTransactions = await db.insert(transactions).values(transactionData).returning();
    console.log(`✓ Inserted ${insertedTransactions.length} transactions`);

    console.log('🎉 Database seeding completed successfully!');
    
    return {
      tills: insertedTills.length,
      operators: insertedOperators.length, 
      products: insertedProducts.length,
      summaries: insertedSummaries.length,
      transactions: insertedTransactions.length
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}