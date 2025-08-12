import { db } from '../db';
import { tills, operators, products, transactions, dailySummaries } from '../../shared/schema';
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
              // This data appears to be daily summaries, not individual tills
              // Parse the date from TimeSpan or DateTime Last Trans.
              const dateStr = record['DateTime Last Trans.'] || record.TimeSpan;
              let parsedDate = new Date().toISOString().split('T')[0]; // Default to today
              
              if (dateStr && dateStr.includes('-')) {
                try {
                  const date = new Date(dateStr);
                  if (!isNaN(date.getTime())) {
                    parsedDate = date.toISOString().split('T')[0];
                  }
                } catch (e) {
                  // Use default date if parsing fails
                }
              }
              
              const netTotal = record.NettTotal || record.netTotal || '0.00';
              const transactionCount = parseInt(record['Qty Transactions']) || 0;
              const tillName = record.Name || 'McBrew - QLD';
              
              // Insert as daily summary data
              await db.insert(dailySummaries).values({
                date: parsedDate,
                totalSales: netTotal,
                transactionCount: transactionCount,
                averageTransaction: transactionCount > 0 ? (parseFloat(netTotal) / transactionCount).toFixed(2) : '0.00',
                topProduct: null,
                topOperator: tillName
              });
              importCount++;
            } catch (error: any) {
              errors.push(`Record "${record.Name || 'Unknown'}": ${error.message}`);
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

        case 'accounts':
          for (const record of records) {
            try {
              await db.insert(dailySummaries).values({
                date: new Date().toISOString().split('T')[0], // Use today's date for accounts
                totalSales: record.balance || '0.00',
                transactionCount: parseInt(record.transactions) || 0,
                averageTransaction: record.averageTransaction || '0.00',
                topProduct: record.topAccount || null,
                topOperator: record.accountName || null
              });
              importCount++;
            } catch (error: any) {
              errors.push(`Account "${record.accountName}": ${error.message}`);
            }
          }
          break;

        default:
          return {
            success: false,
            message: 'Unsupported table type',
            imported: 0,
            errors: ['Only tills, operators, products, and accounts are supported']
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