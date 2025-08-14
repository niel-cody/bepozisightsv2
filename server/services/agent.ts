import OpenAI from "openai";
import { storage } from "../storage";

// Initialize OpenAI client directly with function calling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Tool definitions for function calling
const tools = [
  {
    type: "function" as const,
    function: {
      name: "getRevenueComparison",
      description: "Get revenue data to compare time periods (this month vs last month, etc.)",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            description: "Time period for comparison: 'month', 'week', 'day'",
            enum: ["month", "week", "day"]
          }
        },
        required: ["period"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getBusinessSummary",
      description: "Get overall business summary and key metrics",
      parameters: {
        type: "object",
        properties: {
          includeToday: {
            type: "boolean",
            description: "Whether to include today's data",
            default: true
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getTopPerformingStaff",
      description: "Get information about top performing operators/staff members",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            description: "Time period to analyze: 'week', 'month'",
            enum: ["week", "month"]
          },
          limit: {
            type: "number",
            description: "Number of top performers to return",
            default: 5
          }
        },
        required: ["period"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getStaffDetails",
      description: "Get detailed information about a specific staff member including refunds, sales metrics, etc.",
      parameters: {
        type: "object",
        properties: {
          staffName: {
            type: "string",
            description: "Name or partial name of the staff member to look up"
          }
        },
        required: ["staffName"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getTopSellingProducts",
      description: "Get the top selling products by quantity sold or revenue",
      parameters: {
        type: "object",
        properties: {
          metric: {
            type: "string",
            description: "Sort by 'quantity' or 'revenue'",
            enum: ["quantity", "revenue"],
            default: "quantity"
          },
          limit: {
            type: "number",
            description: "Number of top products to return",
            default: 10
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getProductSalesBreakdown",
      description: "Get detailed product sales breakdown with categories, sizes, and revenue",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Filter by product category (Coffee, Hotdog, Pastry, etc.)",
            default: null
          },
          venue: {
            type: "string", 
            description: "Filter by venue name",
            default: null
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generateChart",
      description: "Generate a chart visualization for business data. Can create area, bar, line, or pie charts",
      parameters: {
        type: "object",
        properties: {
          chartType: {
            type: "string",
            description: "Type of chart to generate: 'area', 'bar', 'line', 'pie'",
            enum: ["area", "bar", "line", "pie"],
            default: "area"
          },
          dataType: {
            type: "string", 
            description: "What data to visualize: 'products', 'revenue', 'staff', 'categories', 'venues'",
            enum: ["products", "revenue", "staff", "categories", "venues"]
          },
          metric: {
            type: "string",
            description: "Which metric to show: 'quantity', 'revenue', 'transactions', 'performance'",
            enum: ["quantity", "revenue", "transactions", "performance"],
            default: "revenue"
          },
          period: {
            type: "string",
            description: "Time period for the data: 'day', 'week', 'month', 'all'",
            enum: ["day", "week", "month", "all"],
            default: "all"
          },
          limit: {
            type: "number",
            description: "Number of items to include in chart",
            default: 10
          }
        },
        required: ["dataType"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getVenueSales",
      description: "Get sales performance data for venues/locations including daily summaries, gross sales, transaction counts, and venue comparisons",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            description: "Time period to analyze: 'week', 'month', 'all'",
            enum: ["week", "month", "all"],
            default: "week"
          },
          compareVenues: {
            type: "boolean",
            description: "Whether to compare performance across different venues",
            default: true
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getTopSpendingCustomers",
      description: "Get customers who spent the most money in a given time period",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            description: "Time period to analyze: 'week', 'month', '30days', 'quarter', 'year'",
            enum: ["week", "month", "30days", "quarter", "year"]
          },
          limit: {
            type: "number",
            description: "Number of top customers to return",
            default: 10
          }
        },
        required: ["period"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getCustomerDetails",
      description: "Get detailed information about a specific customer including transaction history and spending patterns",
      parameters: {
        type: "object",
        properties: {
          customerName: {
            type: "string",
            description: "Name or partial name of the customer to look up"
          }
        },
        required: ["customerName"]
      }
    }
  }
];

// Function implementations
const functions = {

  getRevenueComparison: async (args: { period: string }) => {
    try {
      const summaries = await storage.getDailySummaries();
      const now = new Date();
      
      let currentPeriodStart: Date;
      let previousPeriodStart: Date;
      let previousPeriodEnd: Date;
      
      if (args.period === "month") {
        // Current month
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // Previous month
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (args.period === "week") {
        // Current week (last 7 days)
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        // Previous week
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        // Yesterday vs day before
        currentPeriodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        previousPeriodEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      // Filter summaries for current period
      const currentPeriodSummaries = summaries.filter(s => {
        const date = new Date(s.date);
        return date >= currentPeriodStart;
      });
      
      // Filter summaries for previous period
      const previousPeriodSummaries = summaries.filter(s => {
        const date = new Date(s.date);
        return date >= previousPeriodStart && date <= previousPeriodEnd;
      });
      
      // Calculate totals using the correct field name
      const currentRevenue = currentPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0);
      const previousRevenue = previousPeriodSummaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0);
      const currentTransactions = currentPeriodSummaries.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
      const previousTransactions = previousPeriodSummaries.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
      
      const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const transactionChange = previousTransactions > 0 ? ((currentTransactions - previousTransactions) / previousTransactions) * 100 : 0;
      
      return {
        currentPeriod: {
          revenue: currentRevenue,
          transactions: currentTransactions,
          days: currentPeriodSummaries.length,
          avgDaily: currentPeriodSummaries.length > 0 ? currentRevenue / currentPeriodSummaries.length : 0
        },
        previousPeriod: {
          revenue: previousRevenue,
          transactions: previousTransactions,
          days: previousPeriodSummaries.length,
          avgDaily: previousPeriodSummaries.length > 0 ? previousRevenue / previousPeriodSummaries.length : 0
        },
        changes: {
          revenueChange: revenueChange,
          transactionChange: transactionChange,
          revenueDirection: revenueChange > 0 ? "increased" : revenueChange < 0 ? "decreased" : "stayed the same"
        }
      };
    } catch (error) {
      console.error("Error getting revenue comparison:", error);
      return { error: "Could not retrieve revenue comparison data" };
    }
  },

  getTopPerformingStaff: async (args: { period: string; limit?: number }) => {
    try {
      const operators = await storage.getOperators();
      const limit = args.limit || 5;
      
      // Sort operators by total sales and return top performers
      const topOperators = operators
        .sort((a, b) => parseFloat(b.totalSales || "0") - parseFloat(a.totalSales || "0"))
        .slice(0, limit)
        .map(op => ({
          name: op.name,
          totalSales: parseFloat(op.totalSales || "0"),
          transactionCount: op.transactionCount || 0,
          avgTransaction: op.transactionCount && op.transactionCount > 0 ? parseFloat(op.totalSales || "0") / op.transactionCount : 0,
          // Include additional details for context
          role: op.role,
          status: op.status
        }));
      
      return { topPerformers: topOperators, period: args.period };
    } catch (error) {
      console.error("Error getting top performing staff:", error);
      return { error: "Could not retrieve staff performance data" };
    }
  },

  getStaffDetails: async (args: { staffName: string }) => {
    try {
      const operators = await storage.getOperators();
      
      // Find staff member by name (case insensitive)
      const staffMember = operators.find(op => 
        op.name.toLowerCase().includes(args.staffName.toLowerCase())
      );
      
      if (!staffMember) {
        return { error: `Could not find staff member with name containing "${args.staffName}"` };
      }
      
      return {
        name: staffMember.name,
        role: staffMember.role,
        status: staffMember.status,
        totalSales: parseFloat(staffMember.totalSales || "0"),
        transactionCount: staffMember.transactionCount || 0,
        avgTransaction: staffMember.transactionCount && staffMember.transactionCount > 0 ? 
          parseFloat(staffMember.totalSales || "0") / staffMember.transactionCount : 0,
        grossSales: parseFloat(staffMember.grossSales || "0"),
        totalDiscount: parseFloat(staffMember.totalDiscount || "0"),
        lastTransactionDate: staffMember.lastTransactionDate
      };
    } catch (error) {
      console.error("Error getting staff details:", error);
      return { error: "Could not retrieve staff details" };
    }
  },

  getProductSales: async (args: { type: string; limit?: number }) => {
    try {
      const products = await storage.getProducts();
      
      if (args.type === "top-selling") {
        const limit = args.limit || 10;
        const topProducts = products
          .sort((a, b) => parseFloat(b.revenue || "0") - parseFloat(a.revenue || "0"))
          .slice(0, limit)
          .map(p => ({
            name: p.name,
            revenue: parseFloat(p.revenue || "0"),
            quantitySold: p.soldToday || 0,
            avgPrice: (p.soldToday && p.soldToday > 0) ? parseFloat(p.revenue || "0") / p.soldToday : parseFloat(p.price || "0")
          }));
        
        return { topProducts, period: "all-time" };
      } else {
        return { 
          totalProducts: products.length,
          totalRevenue: products.reduce((sum, p) => sum + parseFloat(p.revenue || "0"), 0),
          totalQuantity: products.reduce((sum, p) => sum + (p.soldToday || 0), 0)
        };
      }
    } catch (error) {
      console.error("Error getting product sales:", error);
      return { error: "Could not retrieve product sales data" };
    }
  },

  getVenueSales: async (args: { period?: string; compareVenues?: boolean }) => {
    try {
      const summaries = await storage.getDailySummaries();
      const period = args.period || "week";
      const compareVenues = args.compareVenues !== false;
      
      // Filter by time period if needed
      let filteredSummaries = summaries;
      if (period === "week") {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filteredSummaries = summaries.filter(s => new Date(s.date) >= weekAgo);
      } else if (period === "month") {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filteredSummaries = summaries.filter(s => new Date(s.date) >= monthAgo);
      }
      
      if (compareVenues) {
        // Group by venue and calculate totals
        const venueStats = filteredSummaries.reduce((acc, summary) => {
          const venue = summary.venue || 'Unknown Venue';
          if (!acc[venue]) {
            acc[venue] = {
              venue: venue,
              totalSales: 0,
              totalTransactions: 0,
              days: 0,
              grossSales: 0
            };
          }
          
          acc[venue].totalSales += parseFloat(summary.nettTotal || "0");
          acc[venue].grossSales += parseFloat(summary.grossSales || "0");
          acc[venue].totalTransactions += summary.transactionCount || 0;
          acc[venue].days += 1;
          
          return acc;
        }, {} as Record<string, any>);
        
        // Convert to array and calculate averages
        const venueComparison = Object.values(venueStats).map((venue: any) => ({
          venue: venue.venue,
          totalSales: venue.totalSales,
          grossSales: venue.grossSales,
          totalTransactions: venue.totalTransactions,
          days: venue.days,
          avgDailySales: venue.days > 0 ? venue.totalSales / venue.days : 0,
          avgTransactionValue: venue.totalTransactions > 0 ? venue.totalSales / venue.totalTransactions : 0
        })).sort((a, b) => b.totalSales - a.totalSales);
        
        return {
          period: period,
          venueComparison,
          totalVenues: venueComparison.length,
          summary: {
            totalSales: venueComparison.reduce((sum, v) => sum + v.totalSales, 0),
            totalTransactions: venueComparison.reduce((sum, v) => sum + v.totalTransactions, 0),
            totalDays: filteredSummaries.length
          }
        };
      } else {
        // Just return aggregated data
        const totalSales = filteredSummaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0);
        const totalTransactions = filteredSummaries.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
        
        return {
          period: period,
          totalSales,
          totalTransactions,
          days: filteredSummaries.length,
          avgDailySales: filteredSummaries.length > 0 ? totalSales / filteredSummaries.length : 0,
          avgTransactionValue: totalTransactions > 0 ? totalSales / totalTransactions : 0
        };
      }
    } catch (error) {
      console.error("Error getting venue sales:", error);
      return { error: "Could not retrieve venue sales data" };
    }
  },

  getBusinessSummary: async (args: { includeToday?: boolean }) => {
    try {
      const [tills, operators, products, todaySummary, summaries] = await Promise.all([
        storage.getTills(),
        storage.getOperators(),
        storage.getProducts(),
        args.includeToday ? storage.getDailySummary(new Date().toISOString().split('T')[0]) : null,
        storage.getDailySummaries()
      ]);
      
      return {
        today: todaySummary ? {
          revenue: parseFloat(todaySummary.nettTotal || "0"),
          transactions: todaySummary.transactionCount || 0,
          avgTransaction: todaySummary.transactionCount > 0 ? parseFloat(todaySummary.nettTotal || "0") / todaySummary.transactionCount : 0
        } : null,
        totals: {
          tills: tills.length,
          operators: operators.length,
          products: products.length,
          historicalDays: summaries.length,
          totalHistoricalRevenue: summaries.reduce((sum, s) => sum + parseFloat(s.nettTotal || "0"), 0),
          dateRange: summaries.length > 0 ? {
            earliest: summaries[0]?.date,
            latest: summaries[summaries.length - 1]?.date
          } : null
        }
      };
    } catch (error) {
      console.error("Error getting business summary:", error);
      return { error: "Could not retrieve business summary data" };
    }
  },

  getTopSpendingCustomers: async (args: { period: string; limit?: number }) => {
    try {
      const customers = await storage.getCustomerSummaries();
      const now = new Date();
      
      let periodStart: Date;
      
      switch (args.period) {
        case "week":
          periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "30days":
          periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "quarter":
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          periodStart = new Date(now.getFullYear(), quarterStart, 1);
          break;
        case "year":
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Filter customers by period and calculate spending
      const filteredCustomers = customers
        .filter(c => new Date(c.date) >= periodStart)
        .reduce((acc: any[], customer) => {
          const existing = acc.find(c => c.account_id === customer.account_id);
          if (existing) {
            existing.totalSpending += parseFloat(customer.nett_turnover || "0");
            existing.totalVisits += customer.visits || 0;
            existing.totalPayments += parseFloat(customer.payments || "0");
            existing.totalCharges += parseFloat(customer.charges || "0");
          } else {
            acc.push({
              account_id: customer.account_id,
              account_name: customer.account_name,
              totalSpending: parseFloat(customer.nett_turnover || "0"),
              totalVisits: customer.visits || 0,
              totalPayments: parseFloat(customer.payments || "0"),
              totalCharges: parseFloat(customer.charges || "0"),
              avgSpendingPerVisit: customer.visits > 0 ? parseFloat(customer.nett_turnover || "0") / customer.visits : 0
            });
          }
          return acc;
        }, [])
        .sort((a, b) => b.totalSpending - a.totalSpending)
        .slice(0, args.limit || 10);

      return {
        period: args.period,
        topCustomers: filteredCustomers,
        totalCustomers: filteredCustomers.length,
        periodStart: periodStart.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error("Error getting top spending customers:", error);
      return { error: "Could not retrieve customer spending data" };
    }
  },

  getTopSellingProducts: async (args: { metric?: string; limit?: number }) => {
    try {
      const productSales = await storage.getProductSales();
      
      if (!productSales.length) {
        return { error: "No product sales data available. Upload CSV data to see top selling products." };
      }
      
      // Group by product name and size, then aggregate
      const productStats = productSales.reduce((acc, sale) => {
        const key = `${sale.productName} - ${sale.size}`;
        if (!acc[key]) {
          acc[key] = {
            productName: sale.productName,
            size: sale.size,
            category: sale.category,
            reportingGroup: sale.reportingGroup,
            totalQuantity: 0,
            totalRevenue: 0,
            discountQty: 0,
            discountAmount: 0,
            refundQty: 0,
            refundAmount: 0,
            venue: sale.venue
          };
        }
        
        acc[key].totalQuantity += sale.qtySold || 0;
        acc[key].totalRevenue += parseFloat(sale.nettSales || "0");
        acc[key].discountQty += sale.discountQty || 0;
        acc[key].discountAmount += parseFloat(sale.discountAmount || "0");
        acc[key].refundQty += sale.refundQty || 0;
        acc[key].refundAmount += parseFloat(sale.refundAmount || "0");
        
        return acc;
      }, {} as Record<string, any>);
      
      // Convert to array and sort
      const products = Object.values(productStats);
      const sortField = args.metric === 'revenue' ? 'totalRevenue' : 'totalQuantity';
      const sortedProducts = products
        .sort((a: any, b: any) => b[sortField] - a[sortField])
        .slice(0, args.limit || 10);
      
      return {
        metric: args.metric || 'quantity',
        products: sortedProducts,
        totalProductsAnalyzed: products.length,
        summary: {
          totalQuantity: products.reduce((sum: number, p: any) => sum + p.totalQuantity, 0),
          totalRevenue: products.reduce((sum: number, p: any) => sum + p.totalRevenue, 0),
          topProduct: sortedProducts[0] ? `${sortedProducts[0].productName} - ${sortedProducts[0].size}` : null
        }
      };
    } catch (error) {
      console.error("Error getting top selling products:", error);
      return { error: "Could not retrieve product sales data" };
    }
  },

  getProductSalesBreakdown: async (args: { category?: string; venue?: string }) => {
    try {
      const productSales = await storage.getProductSales();
      
      if (!productSales.length) {
        return { error: "No product sales data available. Upload CSV data to see product breakdown." };
      }
      
      // Filter by category and venue if specified
      let filteredSales = productSales;
      if (args.category) {
        filteredSales = filteredSales.filter(sale => 
          sale.category.toLowerCase().includes(args.category!.toLowerCase())
        );
      }
      if (args.venue) {
        filteredSales = filteredSales.filter(sale => 
          sale.venue.toLowerCase().includes(args.venue!.toLowerCase())
        );
      }
      
      // Group by category
      const categoryBreakdown = filteredSales.reduce((acc, sale) => {
        const category = sale.category;
        if (!acc[category]) {
          acc[category] = {
            category,
            totalQuantity: 0,
            totalRevenue: 0,
            uniqueProducts: new Set(),
            products: []
          };
        }
        
        acc[category].totalQuantity += sale.qtySold || 0;
        acc[category].totalRevenue += parseFloat(sale.nettSales || "0");
        acc[category].uniqueProducts.add(`${sale.productName} - ${sale.size}`);
        
        return acc;
      }, {} as Record<string, any>);
      
      // Convert sets to counts and prepare response
      const breakdown = Object.values(categoryBreakdown).map((cat: any) => ({
        category: cat.category,
        totalQuantity: cat.totalQuantity,
        totalRevenue: cat.totalRevenue,
        uniqueProducts: cat.uniqueProducts.size,
        avgRevenuePerItem: cat.totalQuantity > 0 ? cat.totalRevenue / cat.totalQuantity : 0
      })).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
      
      return {
        filters: { category: args.category, venue: args.venue },
        breakdown,
        summary: {
          totalCategories: breakdown.length,
          totalQuantity: breakdown.reduce((sum: number, cat: any) => sum + cat.totalQuantity, 0),
          totalRevenue: breakdown.reduce((sum: number, cat: any) => sum + cat.totalRevenue, 0),
          topCategory: breakdown[0]?.category || null
        }
      };
    } catch (error) {
      console.error("Error getting product sales breakdown:", error);
      return { error: "Could not retrieve product breakdown data" };
    }
  },

  generateChart: async (args: { 
    chartType?: string; 
    dataType: string; 
    metric?: string; 
    period?: string; 
    limit?: number 
  }) => {
    try {
      const chartType = args.chartType || 'area';
      const metric = args.metric || 'revenue';
      const limit = args.limit || 10;
      
      let chartData: any[] = [];
      let title = '';
      let description = '';
      
      switch (args.dataType) {
        case 'products':
          const productSales = await storage.getProductSales();
          if (!productSales.length) {
            return { error: "No product sales data available for chart generation" };
          }
          
          // Aggregate products by name
          const productStats = productSales.reduce((acc, sale) => {
            const key = sale.productName;
            if (!acc[key]) {
              acc[key] = {
                name: sale.productName,
                quantity: 0,
                revenue: 0,
                category: sale.category
              };
            }
            acc[key].quantity += sale.qtySold || 0;
            acc[key].revenue += parseFloat(sale.nettSales || "0");
            return acc;
          }, {} as Record<string, any>);
          
          chartData = Object.values(productStats)
            .sort((a: any, b: any) => b[metric] - a[metric])
            .slice(0, limit)
            .map((product: any) => ({
              name: product.name,
              value: metric === 'quantity' ? product.quantity : Math.round(product.revenue),
              category: product.category
            }));
          
          title = `Top ${limit} Products by ${metric === 'quantity' ? 'Quantity Sold' : 'Revenue'}`;
          description = `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart showing product performance`;
          break;

        case 'categories':
          const categorySales = await storage.getProductSales();
          if (!categorySales.length) {
            return { error: "No product sales data available for chart generation" };
          }
          
          // Aggregate by category
          const categoryStats = categorySales.reduce((acc, sale) => {
            const category = sale.category;
            if (!acc[category]) {
              acc[category] = { name: category, quantity: 0, revenue: 0 };
            }
            acc[category].quantity += sale.qtySold || 0;
            acc[category].revenue += parseFloat(sale.nettSales || "0");
            return acc;
          }, {} as Record<string, any>);
          
          chartData = Object.values(categoryStats)
            .sort((a: any, b: any) => b[metric] - a[metric])
            .map((cat: any) => ({
              name: cat.name,
              value: metric === 'quantity' ? cat.quantity : Math.round(cat.revenue)
            }));
            
          title = `Sales by Category (${metric === 'quantity' ? 'Quantity' : 'Revenue'})`;
          description = `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart showing category performance`;
          break;

        case 'revenue':
          const summaries = await storage.getDailySummaries();
          if (!summaries.length) {
            return { error: "No revenue data available for chart generation" };
          }
          
          // Sort by date and take recent data
          const recentSummaries = summaries
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-limit);
            
          chartData = recentSummaries.map(summary => ({
            name: summary.date,
            value: Math.round(parseFloat(summary.nettTotal || "0")),
            transactions: summary.transactionCount || 0
          }));
          
          title = `Daily Revenue Trend (Last ${limit} Days)`;
          description = `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart showing revenue over time`;
          break;

        case 'staff':
          const operators = await storage.getOperators();
          if (!operators.length) {
            return { error: "No staff data available for chart generation" };
          }
          
          chartData = operators
            .filter(op => parseFloat(op.totalSales || "0") > 0)
            .sort((a, b) => parseFloat(b.totalSales || "0") - parseFloat(a.totalSales || "0"))
            .slice(0, limit)
            .map(operator => ({
              name: operator.name,
              value: Math.round(parseFloat(operator.totalSales || "0")),
              transactions: operator.transactionCount || 0
            }));
            
          title = `Top ${limit} Staff by Sales Performance`;
          description = `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart showing staff performance`;
          break;

        default:
          return { error: `Unknown data type: ${args.dataType}` };
      }
      
      if (!chartData.length) {
        return { error: `No data available for ${args.dataType} chart` };
      }
      
      return {
        chartType,
        dataType: args.dataType,
        metric,
        title,
        description,
        data: chartData,
        totalDataPoints: chartData.length,
        config: {
          xAxisKey: 'name',
          yAxisKey: 'value',
          colors: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']
        }
      };
    } catch (error) {
      console.error("Error generating chart:", error);
      return { error: "Could not generate chart data" };
    }
  },

  getCustomerDetails: async (args: { customerName: string }) => {
    try {
      const customers = await storage.getCustomerSummaries();
      
      // Find customers matching the name (case insensitive partial match)
      const matchingCustomers = customers.filter(c => 
        c.account_name?.toLowerCase().includes(args.customerName.toLowerCase())
      );
      
      if (matchingCustomers.length === 0) {
        return { error: `No customers found matching "${args.customerName}"` };
      }
      
      // Group by account_id and aggregate data
      const customerData = matchingCustomers.reduce((acc: any, customer) => {
        if (!acc[customer.account_id]) {
          acc[customer.account_id] = {
            account_id: customer.account_id,
            account_name: customer.account_name,
            transactions: [],
            totalSpending: 0,
            totalVisits: 0,
            totalPayments: 0,
            totalCharges: 0,
            dateRange: {
              earliest: customer.date,
              latest: customer.date
            }
          };
        }
        
        acc[customer.account_id].transactions.push({
          date: customer.date,
          spending: parseFloat(customer.nett_turnover || "0"),
          visits: customer.visits || 0,
          payments: parseFloat(customer.payments || "0"),
          charges: parseFloat(customer.charges || "0"),
          balance_start: parseFloat(customer.balance_start || "0"),
          balance_end: parseFloat(customer.balance_end || "0")
        });
        
        acc[customer.account_id].totalSpending += parseFloat(customer.nett_turnover || "0");
        acc[customer.account_id].totalVisits += customer.visits || 0;
        acc[customer.account_id].totalPayments += parseFloat(customer.payments || "0");
        acc[customer.account_id].totalCharges += parseFloat(customer.charges || "0");
        
        // Update date range
        if (customer.date < acc[customer.account_id].dateRange.earliest) {
          acc[customer.account_id].dateRange.earliest = customer.date;
        }
        if (customer.date > acc[customer.account_id].dateRange.latest) {
          acc[customer.account_id].dateRange.latest = customer.date;
        }
        
        return acc;
      }, {});
      
      return {
        matchingCustomers: Object.values(customerData),
        searchTerm: args.customerName
      };
    } catch (error) {
      console.error("Error getting customer details:", error);
      return { error: "Could not retrieve customer details" };
    }
  }
};

// Main agent chat function with function calling and conversation memory
export async function agentChat(message: string, conversationId: string, model: string = "gpt-4o-mini"): Promise<{ content: string; chart?: any }> {
  try {
    // Get conversation history to maintain context
    const conversationHistory = await storage.getChatMessages(conversationId);
    
    // Build conversation context from history
    const messages = [
      {
        role: "system" as const,
        content: `You are Alex, a virtual manager AI assistant for a Point of Sale (POS) system. 
        
Your role is to help analyze business data and provide insights about sales, staff performance, and operations.

You have access to these functions to get real business data:
- getRevenueComparison: Compare revenue across time periods
- getBusinessSummary: Get overall business metrics and today's performance  
- getTopPerformingStaff: Get information about top performing staff members
- getStaffDetails: Get detailed information about a specific staff member
- getTopSpendingCustomers: Get customers who spent the most money in a given time period
- getCustomerDetails: Get detailed information about a specific customer including transaction history

IMPORTANT: Maintain conversation context. When users ask follow-up questions like "did he also do refunds?" or mention names like "Brendan Catering", refer back to previous messages in the conversation to understand what they're referring to. Use getStaffDetails to get specific information about staff members mentioned in conversation.

Use these functions to answer questions with real data. Be conversational, friendly, and provide actionable insights.

When users ask about revenue comparisons, use getRevenueComparison.
When users ask for general business overview, use getBusinessSummary.
When users ask about staff performance, use getTopPerformingStaff.
When users ask about specific staff members or refunds, use getStaffDetails.
When users ask about top spending customers or customer spending patterns, use getTopSpendingCustomers.
When users ask about specific customers, use getCustomerDetails.
When users ask about top selling products, use getTopSellingProducts.
When users ask for product breakdown by category, use getProductSalesBreakdown.
When users ask for charts, graphs, or visual data representations, use generateChart.

CHART GENERATION REQUIREMENTS:
- ALWAYS use generateChart when users ask for charts, graphs, visualizations, or visual representations
- When users say "show me a chart", "create a chart", "visualize", or similar, you MUST call generateChart
- For product analysis: use generateChart with dataType='products' 
- For category breakdown: use generateChart with dataType='categories'
- For revenue trends: use generateChart with dataType='revenue'
- For staff performance: use generateChart with dataType='staff'
- Choose appropriate chartType: 'area' for trends, 'bar' for comparisons, 'pie' for breakdowns, 'line' for time series
- If user doesn't specify chart type, choose the most appropriate one and use generateChart
- NEVER just describe charts - always generate them using the generateChart function`
      }
    ];

    // Add conversation history (limit to last 10 exchanges to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    for (const historyItem of recentHistory) {
      messages.push({
        role: "user" as const,
        content: historyItem.message
      });
      messages.push({
        role: "assistant" as const,
        content: historyItem.response
      });
    }

    // Add current message
    messages.push({
      role: "user" as const,
      content: message
    });

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      tools: tools,
      tool_choice: "auto"
    });

    const responseMessage = response.choices[0].message;
    
    // Handle function calls
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const functionResults = [];
      let chartData = null;
      
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type !== 'function') continue;
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        if (functions[functionName as keyof typeof functions]) {
          const result = await (functions as any)[functionName](functionArgs);
          
          // Check if this is chart generation
          if (functionName === 'generateChart' && result && !result.error) {
            chartData = result;
          }
          
          functionResults.push({
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }
      }
      
      // Add function results to conversation and get final response
      const finalMessages = [
        ...messages,
        responseMessage,
        ...functionResults.map(result => ({
          role: "tool" as const,
          tool_call_id: result.tool_call_id,
          content: result.content
        }))
      ];
      
      const finalResponse = await openai.chat.completions.create({
        model: model,
        messages: finalMessages
      });
      
      return { 
        content: finalResponse.choices[0].message.content || "I couldn't generate a response.",
        chart: chartData
      };
    } else {
      // No function calls, return direct response
      return { content: responseMessage.content || "I couldn't understand that request." };
    }
  } catch (error) {
    console.error("Agent chat error:", error);
    throw new Error("Failed to get AI response");
  }
}