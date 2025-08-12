import { db } from '../db';
import { tills, operatorSummaries, products, transactions, tillSummaries, customers } from '../../shared/schema';
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
              // Parse the date from TimeSpan
              const dateStr = record.TimeSpan;
              let parsedDate = new Date().toISOString().split('T')[0]; // Default to today
              
              if (dateStr) {
                try {
                  // Handle format like "Thu 06-Jan-2005"
                  const cleanDate = dateStr.replace(/^[A-Za-z]+ /, ''); // Remove day prefix
                  const date = new Date(cleanDate);
                  if (!isNaN(date.getTime())) {
                    parsedDate = date.toISOString().split('T')[0];
                  }
                } catch (e) {
                  // Use default date if parsing fails
                }
              }
              
              // Parse datetime fields
              let firstTransDate = null;
              let lastTransDate = null;
              
              if (record['DateTime First Trans.']) {
                try {
                  const date = new Date(record['DateTime First Trans.']);
                  if (!isNaN(date.getTime())) firstTransDate = date;
                } catch (e) {}
              }
              
              if (record['DateTime Last Trans.']) {
                try {
                  const date = new Date(record['DateTime Last Trans.']);
                  if (!isNaN(date.getTime())) lastTransDate = date;
                } catch (e) {}
              }
              
              // Insert as till summary data with all fields
              await db.insert(tillSummaries).values({
                date: parsedDate,
                name: record.Name || 'McBrew - QLD',
                transactionCount: parseInt(record['Qty Transactions']) || 0,
                dateTimeFirstTrans: firstTransDate,
                dateTimeLastTrans: lastTransDate,
                grossSales: record['Gross Sales'] || null,
                totalDiscount: record['Total Discount'] || null,
                nettTotal: record.NettTotal || '0.00',
                percentOfNettTotal: record['% of NettTotal'] || null,
                costOfSales: record['Cost of Sales'] || null,
                profitAmount: record.ProfitAmt || null,
                profitPercent: record['Profit%'] || null,
                quantityCancelled: parseInt(record['Qty Cancelled']) || null,
                cancelled: record.Cancelled || null,
                quantityReturns: parseInt(record['Qty Returns']) || null,
                returns: record.Returns || null,
                quantityTraining: parseInt(record['Qty Training']) || null,
                trainingTotal: record['Training Total'] || null,
                quantityNoSales: parseInt(record['Qty NoSales']) || null,
                quantityNoSaleAfterCancel: parseInt(record['Qty NoSale After Cancel']) || null,
                noSaleAfterCancel: record['NoSale AfterCancel'] || null,
                quantityTableRefundAfterPrint: parseInt(record['Qty Table Refund After Print']) || null,
                tableRefundAfterPrint: record['Table Refund After Print'] || null
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
              // Parse the date from TimeSpan for date context
              const dateStr = record.TimeSpan;
              let parsedDate = null;
              if (dateStr) {
                try {
                  // Try to parse different date formats
                  const date = new Date(dateStr.replace(/^[A-Za-z]+ /, '')); // Remove day prefix
                  if (!isNaN(date.getTime())) {
                    parsedDate = date;
                  }
                } catch (e) {
                  // Use null if parsing fails
                }
              }
              
              await db.insert(operatorSummaries).values({
                name: record.Name || record.name,
                employeeId: record.Name || record.name, // Use name as employee ID
                role: 'Staff',
                status: 'active',
                totalSales: record.NettTotal || record.totalSales || '0.00',
                transactionCount: parseInt(record['Qty Transactions']) || 0,
                grossSales: record['Gross Sales'] || null,
                totalDiscount: record['Total Discount'] || null,
                nettTotal: record.NettTotal || null,
                profitAmount: record.ProfitAmt || null,
                profitPercent: record['Profit%'] || null,
                averageSale: record['Average Sale'] || null,
                venue: record.Venue || null,
                lastTransactionDate: parsedDate
              });
              importCount++;
            } catch (error: any) {
              errors.push(`Operator "${record.Name || record.name}": ${error.message}`);
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

        case 'customers':
          for (const record of records) {
            try {
              await db.insert(customers).values({
                name: record.name || record.customerName,
                email: record.email,
                phone: record.phone,
                address: record.address,
                customerType: record.customerType || 'regular',
                totalSpent: record.totalSpent || '0.00',
                visitCount: parseInt(record.visitCount) || 0,
                lastVisit: record.lastVisit ? new Date(record.lastVisit) : null,
                notes: record.notes
              });
              importCount++;
            } catch (error: any) {
              errors.push(`Customer "${record.name}": ${error.message}`);
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