# Integration Tests

This directory contains integration tests for the product management and stock management libraries.

## Test Files

- `products.test.ts` - Tests for product CRUD operations (create, read, update, delete)
- `stock.test.ts` - Tests for stock management (decrement, adjust, movements)

## Prerequisites

These tests require a live database connection. Before running the tests, ensure:

1. **DATABASE_URL is configured** in `.env.local`:
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. **Database schema is up to date**:
   ```bash
   npm run db:push
   ```

## Running Tests

Run all tests:
```bash
npm test
```

Run specific test file:
```bash
npm test -- src/__tests__/products.test.ts
npm test -- src/__tests__/stock.test.ts
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Test Characteristics

- **Integration tests**: These tests use the actual database, not mocks
- **Cleanup**: Each test suite cleans up after itself using `afterAll` hooks
- **Test isolation**: Each test uses unique slugs with timestamps to avoid conflicts
- **Comprehensive coverage**: Tests cover success cases, error cases, and edge cases

## Coverage

### products.test.ts
- ✓ Create product with all fields
- ✓ Create product with minimal fields
- ✓ Prevent duplicate slugs on create
- ✓ Get product by ID
- ✓ Return null for non-existent ID
- ✓ Check slug exists
- ✓ Exclude ID when checking slug
- ✓ Update product fields
- ✓ Update slug if unique
- ✓ Prevent duplicate slug on update
- ✓ Error for non-existent product on update
- ✓ Delete product
- ✓ Error for non-existent product on delete

### stock.test.ts
- ✓ Decrement stock for sale
- ✓ Prevent negative stock (stop at 0)
- ✓ Auto-disable product when stock reaches 0
- ✓ Error for non-existent product on decrement
- ✓ Add stock (restock)
- ✓ Auto-reactivate product when adding stock
- ✓ Remove stock (adjustment)
- ✓ Prevent negative stock when removing
- ✓ Set stock to absolute value
- ✓ Set stock to lower value
- ✓ Set stock to 0
- ✓ Get stock movement history
- ✓ Empty movements for new product
- ✓ Error for non-existent product on adjust

## Notes

- Tests create products with timestamps in slugs to ensure uniqueness
- All test products are automatically cleaned up after tests complete
- Stock movements are cascade deleted when products are deleted
- Tests verify both database state and business logic (e.g., auto-disable on zero stock)
