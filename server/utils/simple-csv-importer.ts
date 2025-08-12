import { db } from '../db';
import { tills, operators, products, transactions } from '../../shared/schema';
import { parse } from 'csv-parse/sync';

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
}

export class SimpleCSVImporter {
  static async importCSV(csvData: string, tableName: string): Promise<ImportResult> {
    try {
      const records = parse(csvData, { 
        columns: true, 
        skip_empty_lines: true,
        trim: true 
      }) as any[];

      const errors: string[] = [];
      let importCount = 0;

      switch (tableName) {
        case 'tills':
          for (const record of records) {
            try {
              await db.insert(tills).values({
                name: record.name,
                location: record.location || null,
                status: record.status || 'active',
                cashBalance: record.cashBalance || '0.00',
                lastTransaction: record.lastTransaction ? new Date(record.lastTransaction) : null
              });
              importCount++;
            } catch (error: any) {
              errors.push(`Till "${record.name}": ${error.message}`);
            }
          }
          break;

        case 'operators':
          for (const record of records) {
            try {
              await db.insert(operators).values({
                name: record.name,
                employeeId: record.employeeId || null,
                role: record.role || 'Cashier',
                status: record.status || 'active',
                totalSales: record.totalSales || '0.00',
                transactionCount: parseInt(record.transactionCount) || 0
              });
              importCount++;
            } catch (error: any) {
              errors.push(`Operator "${record.name}": ${error.message}`);
            }
          }
          break;

        case 'products':
          for (const record of records) {
            try {
              await db.insert(products).values({
                name: record.name,
                category: record.category,
                price: record.price,
                stock: parseInt(record.stock) || 0,
                soldToday: parseInt(record.soldToday) || 0,
                revenue: record.revenue || '0.00'
              });
              importCount++;
            } catch (error: any) {
              errors.push(`Product "${record.name}": ${error.message}`);
            }
          }
          break;

        default:
          return {
            success: false,
            message: 'Unsupported table type',
            imported: 0,
            errors: ['Only tills, operators, and products are supported']
          };
      }

      return {
        success: true,
        message: `Successfully imported ${importCount} ${tableName}`,
        imported: importCount,
        errors
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Failed to import ${tableName}: ${error.message}`,
        imported: 0,
        errors: [error.message]
      };
    }
  }
}