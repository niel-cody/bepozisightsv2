import { db } from './db';
import { 
  tills, 
  operatorSummaries, 
  products, 
  tillSummaries, 
  transactions 
} from '@shared/schema';

export async function seedDatabase() {
  console.log('🌱 Seeding database with POS data...');

  try {
    // Clear existing data
    await db.delete(transactions);
    await db.delete(tillSummaries);
    await db.delete(products);
    await db.delete(operatorSummaries);
    await db.delete(tills);

    console.log('✅ Database cleared and ready for fresh import');
    console.log('📊 Use the import page to upload your CSV files');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}