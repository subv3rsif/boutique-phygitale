import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db, orders, orderItems, pickupTokens, emailQueue, type NewOrder, type NewOrderItem, type Order, type OrderItem } from './index';

/**
 * Create a new order with its items
 */
export async function createOrder(
  orderData: NewOrder,
  items: NewOrderItem[]
): Promise<string> {
  // Start transaction
  const result = await db.transaction(async (tx) => {
    // Insert order
    const [order] = await tx.insert(orders).values(orderData).returning({ id: orders.id });

    if (!order) {
      throw new Error('Failed to create order');
    }

    // Insert order items
    const itemsWithOrderId = items.map(item => ({
      ...item,
      orderId: order.id,
    }));

    await tx.insert(orderItems).values(itemsWithOrderId);

    return order.id;
  });

  return result;
}

/**
 * Get order by ID with all items
 */
export async function getOrderById(orderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return null;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    ...order,
    items,
  };
}

/**
 * Get order by Stripe session ID
 */
export async function getOrderByStripeSessionId(sessionId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);

  if (!order) {
    return null;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return {
    ...order,
    items,
  };
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  additionalData?: Partial<Order>
) {
  const [updated] = await db
    .update(orders)
    .set({
      status,
      ...additionalData,
    })
    .where(eq(orders.id, orderId))
    .returning();

  return updated;
}

/**
 * Get all orders with optional filters
 */
export async function getOrders(filters?: {
  status?: Order['status'];
  fulfillmentMode?: Order['fulfillmentMode'];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}) {
  let query = db.select().from(orders);

  // Apply filters
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status));
  }
  if (filters?.fulfillmentMode) {
    conditions.push(eq(orders.fulfillmentMode, filters.fulfillmentMode));
  }
  if (filters?.fromDate) {
    conditions.push(gte(orders.createdAt, filters.fromDate));
  }
  if (filters?.toDate) {
    conditions.push(lte(orders.createdAt, filters.toDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  // Order by most recent first
  query = query.orderBy(desc(orders.createdAt)) as typeof query;

  // Apply pagination
  if (filters?.limit) {
    query = query.limit(filters.limit) as typeof query;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as typeof query;
  }

  return await query;
}

/**
 * Get all orders (shorthand for getOrders with no filters)
 */
export async function getAllOrders() {
  return await getOrders();
}

/**
 * Get order stats for dashboard
 */
export async function getOrderStats() {
  const allOrders = await db.select().from(orders);

  const stats = {
    totalOrders: allOrders.length,
    totalRevenueCents: allOrders
      .filter(o => o.status === 'paid' || o.status === 'fulfilled')
      .reduce((sum, o) => sum + o.grandTotalCents, 0),
    toShip: allOrders.filter(o => o.status === 'paid' && o.fulfillmentMode === 'delivery').length,
    toPickup: allOrders.filter(o => o.status === 'paid' && o.fulfillmentMode === 'pickup').length,
    ordersByStatus: {
      pending: allOrders.filter(o => o.status === 'pending').length,
      paid: allOrders.filter(o => o.status === 'paid').length,
      fulfilled: allOrders.filter(o => o.status === 'fulfilled').length,
      canceled: allOrders.filter(o => o.status === 'canceled').length,
    },
    ordersByMode: {
      delivery: allOrders.filter(o => o.fulfillmentMode === 'delivery').length,
      pickup: allOrders.filter(o => o.fulfillmentMode === 'pickup').length,
    },
  };

  return stats;
}

/**
 * Check if product has sufficient stock
 * Returns true if stock tracking is not enabled for the product
 */
export async function checkStockAvailability(productId: string, requestedQty: number): Promise<boolean> {
  // For MVP, stock tracking is optional
  // This function can be enhanced when stock management is implemented
  // For now, we'll return true (unlimited stock)
  return true;
}

/**
 * Get pickup token by hash
 */
export async function getPickupTokenByHash(tokenHash: string) {
  const [token] = await db
    .select()
    .from(pickupTokens)
    .where(eq(pickupTokens.tokenHash, tokenHash))
    .limit(1);

  return token || null;
}

/**
 * Mark pickup token as used
 */
export async function markPickupTokenUsed(tokenId: string, usedBy: string) {
  const [updated] = await db
    .update(pickupTokens)
    .set({
      usedAt: new Date(),
      usedBy,
    })
    .where(eq(pickupTokens.id, tokenId))
    .returning();

  return updated;
}

/**
 * Get email queue items ready to process
 */
export async function getEmailsToProcess(limit: number = 10) {
  const now = new Date();

  return await db
    .select()
    .from(emailQueue)
    .where(
      and(
        eq(emailQueue.status, 'pending'),
        lte(emailQueue.nextRetryAt, now),
        lte(emailQueue.attempts, 5)
      )
    )
    .limit(limit);
}

/**
 * Mark email as sent
 */
export async function markEmailSent(emailId: string) {
  const [updated] = await db
    .update(emailQueue)
    .set({
      status: 'sent',
      sentAt: new Date(),
    })
    .where(eq(emailQueue.id, emailId))
    .returning();

  return updated;
}

/**
 * Mark email as failed and schedule retry
 */
export async function markEmailFailed(emailId: string, error: string, nextRetryAt: Date) {
  const [email] = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.id, emailId))
    .limit(1);

  if (!email) return null;

  const [updated] = await db
    .update(emailQueue)
    .set({
      status: email.attempts >= 4 ? 'failed' : 'pending',
      attempts: email.attempts + 1,
      lastError: error,
      nextRetryAt,
    })
    .where(eq(emailQueue.id, emailId))
    .returning();

  return updated;
}
