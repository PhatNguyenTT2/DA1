const reportsRouter = require('express').Router();
const Order = require('../models/order');
const Product = require('../models/product');
const logger = require('../utils/logger');
const { userExtractor } = require('../utils/auth');

/**
 * GET /api/reports/sales
 * Get sales report with product breakdown and order details
 */
reportsRouter.get('/sales', userExtractor, async (request, response) => {
  try {
    const { startDate, endDate } = request.query;

    if (!startDate || !endDate) {
      return response.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    // Parse dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    logger.info(`Fetching sales report from ${start} to ${end}`);

    // Find all delivered orders in date range
    const orders = await Order.find({
      createdAt: {
        $gte: start,
        $lte: end
      },
      status: 'delivered' // Only count delivered orders as sales
    })
      .populate('items.product', 'name sku unit')
      .sort({ createdAt: -1 });

    logger.info(`Found ${orders.length} delivered orders`);

    // Aggregate sales data by product
    const productSalesMap = new Map();

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalQuantity = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        // Check if product exists (might be deleted)
        if (!item.product) {
          logger.warn(`Product not found for item in order ${order.orderNumber}`);
          return;
        }

        const productId = item.product._id.toString();
        const productName = item.product.name;
        const productSku = item.product.sku;
        const productUnit = item.product.unit || 'pcs';
        const quantity = item.quantity;
        const price = item.price;
        const itemTotal = quantity * price;

        totalRevenue += itemTotal;
        totalQuantity += quantity;

        if (productSalesMap.has(productId)) {
          const existing = productSalesMap.get(productId);
          existing.quantity += quantity;
          existing.totalAmount += itemTotal;
          existing.orders.push({
            orderNumber: order.orderNumber,
            orderDate: order.createdAt,
            customerName: order.customer?.name || 'N/A',
            status: order.status,
            quantity: quantity,
            unitPrice: price,
            subtotal: itemTotal
          });
        } else {
          productSalesMap.set(productId, {
            productId,
            name: productName,
            sku: productSku,
            unit: productUnit,
            quantity: quantity,
            unitPrice: price,
            totalAmount: itemTotal,
            orders: [{
              orderNumber: order.orderNumber,
              orderDate: order.createdAt,
              customerName: order.customer?.name || 'N/A',
              status: order.status,
              quantity: quantity,
              unitPrice: price,
              subtotal: itemTotal
            }]
          });
        }
      });
    });

    // Convert map to array
    const salesList = Array.from(productSalesMap.values());

    // Sort by total amount descending
    salesList.sort((a, b) => b.totalAmount - a.totalAmount);

    logger.info(`Returning ${salesList.length} products with total revenue: ${totalRevenue}`);

    response.json({
      success: true,
      salesList,
      summary: {
        totalOrders,
        totalRevenue,
        totalQuantity,
        productCount: salesList.length,
        startDate,
        endDate
      }
    });

  } catch (error) {
    logger.error('Error fetching sales report:', error);
    response.status(500).json({
      success: false,
      error: 'Failed to fetch sales report',
      details: error.message
    });
  }
});

module.exports = reportsRouter;
