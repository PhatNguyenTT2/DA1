# Hệ Thống Quản Lý Bán Hàng - Database Design

## Tổng Quan
Hệ thống quản lý bán hàng sử dụng MongoDB với 11 collections chính để quản lý toàn bộ quy trình kinh doanh từ quản lý sản phẩm, khách hàng, đơn hàng, kho hàng, nhà cung cấp đến thanh toán và báo cáo.

---

## 1. Model: User (Người dùng)
**Collection**: `users`

### Mục đích
Quản lý thông tin người dùng hệ thống (admin, nhân viên)

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `userCode` | String | ✓ | Mã người dùng (USER001, USER002...) |
| `username` | String | ✓ | Tên đăng nhập (3-20 ký tự, unique) |
| `email` | String | ✓ | Email (unique, lowercase) |
| `fullName` | String | ✓ | Họ tên đầy đủ (3-50 ký tự) |
| `passwordHash` | String | ✓ | Mật khẩu đã mã hóa (min 6 ký tự) |
| `role` | ObjectId | ✓ | Tham chiếu đến Role |
| `department` | ObjectId |  | Tham chiếu đến Department |
| `isActive` | Boolean |  | Trạng thái hoạt động (default: true) |

### Indexes
- `userCode`, `username`, `email` (unique)
- `isActive`, `role`, `department`

### Relationships
- **Thuộc về**: 1 Role (Many-to-One)
- **Thuộc về**: 1 Department (Many-to-One)
- **Quản lý**: Nhiều Orders, PurchaseOrders, Payments

---

## 2. Model: Role (Vai trò)
**Collection**: `roles`

### Mục đích
Định nghĩa các vai trò và quyền hạn trong hệ thống

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `roleId` | String | ✓ | Mã vai trò (ADMIN, MANAGER..., uppercase, 2-20 ký tự) |
| `roleName` | String | ✓ | Tên vai trò (2-50 ký tự) |
| `description` | String |  | Mô tả vai trò (max 200 ký tự) |
| `permissions` | Array[String] |  | Danh sách quyền hạn |

### Indexes
- `roleId` (unique)
- `isActive`

### Relationships
- **Có**: Nhiều Users (One-to-Many)

---

## 3. Model: Department (Phòng ban)
**Collection**: `departments`

### Mục đích
Quản lý thông tin các phòng ban trong công ty

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `departmentId` | String | ✓ | Mã phòng ban (uppercase, 2-20 ký tự, unique) |
| `departmentName` | String | ✓ | Tên phòng ban (2-100 ký tự) |
| `description` | String |  | Mô tả (max 300 ký tự) |
| `manager` | ObjectId |  | Tham chiếu đến User (Trưởng phòng) |

### Indexes
- `departmentId` (unique)
- `isActive`, `manager`

### Relationships
- **Quản lý bởi**: 1 User (One-to-One với manager)
- **Có**: Nhiều Users (One-to-Many)

---

## 4. Model: Category (Danh mục sản phẩm)
**Collection**: `categories`

### Mục đích
Phân loại sản phẩm theo danh mục

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `name` | String | ✓ | Tên danh mục (max 100 ký tự, unique) |
| `slug` | String | Auto | URL-friendly name (unique, lowercase) |
| `image` | String |  | URL ảnh danh mục |
| `description` | String |  | Mô tả danh mục (max 500 ký tự) |
| `isActive` | Boolean |  | Trạng thái hoạt động (default: true) |

### Virtual Fields
- `productCount`: Số lượng sản phẩm trong danh mục

### Indexes
- `name`, `slug` (unique)

### Relationships
- **Cha của**: Nhiều Categories con (Self-referencing)
- **Con của**: 1 Category cha (Self-referencing)
- **Chứa**: Nhiều Products (One-to-Many)

---

## 5. Model: Product (Sản phẩm)
**Collection**: `products`

### Mục đích
Quản lý thông tin chi tiết về sản phẩm

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `name` | String | ✓ | Tên sản phẩm (max 255 ký tự) |
| `slug` | String | Auto | URL-friendly name (unique, lowercase) |
| `sku` | String | ✓ | Mã SKU (unique, uppercase) |
| `category` | ObjectId | ✓ | Tham chiếu đến Category |
| `costPrice` | Number | ✓ | Giá vốn (≥ 0) |
| `price` | Number | ✓ | Giá bán (> 0) |
| `originalPrice` | Number |  | Giá gốc (trước giảm giá) |
| `image` | String | ✓ | URL ảnh chính |
| `vendor` | String | ✓ | Nhà cung cấp/thương hiệu |
| `stock` | Number | ✓ | Số lượng tồn kho (≥ 0) |
| `isActive` | Boolean |  | Trạng thái hoạt động (default: true) |

### Virtual Fields
- `discountPercent`: Phần trăm giảm giá
- `profitMargin`: Tỷ suất lợi nhuận (%)
- `profitAmount`: Lợi nhuận trên mỗi sản phẩm

### Indexes
- `sku`, `slug` (unique)
- Text index: `name`, `description`, `tags`
- Compound: `category`, `price`

### Relationships
- **Thuộc về**: 1 Category (Many-to-One)
- **Có**: 1 Inventory record (One-to-One)
- **Xuất hiện trong**: Nhiều Orders (Many-to-Many)
- **Xuất hiện trong**: Nhiều PurchaseOrders (Many-to-Many)

---

## 6. Model: Customer (Khách hàng)
**Collection**: `customers`

### Mục đích
Quản lý thông tin khách hàng và lịch sử mua hàng

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `customerCode` | String | Auto | Mã khách hàng (CUST2025000001...) |
| `fullName` | String | ✓ | Họ tên đầy đủ |
| `email` | String |  | Email (unique, sparse - cho phép null) |
| `phone` | String | ✓ | Số điện thoại |
| `address` | Object |  | Địa chỉ chi tiết |
| `address.street` | String |  | Đường |
| `address.city` | String |  | Thành phố |
| `dateOfBirth` | Date |  | Ngày sinh |
| `gender` | String |  | Giới tính (male/female/other) |
| `customerType` | String |  | Loại KH (retail/wholesale/vip, default: retail) |
| `totalSpent` | Number |  | Tổng tiền đã chi (≥ 0, default: 0) |
| `notes` | String |  | Ghi chú |
| `isActive` | Boolean |  | Trạng thái hoạt động (default: true) |

### Virtual Fields
- `orders`: Danh sách đơn hàng của khách hàng

### Methods
- `updatePurchaseStats(orderTotal)`: Cập nhật thống kê mua hàng (tự động nâng cấp loại KH)

### Indexes
- `customerCode`, `email` (unique)
- `phone`, `customerType`, `isActive`

### Business Rules
- Tự động nâng cấp: 
  - VIP: totalSpent ≥ 50,000,000đ
  - Wholesale: totalSpent ≥ 20,000,000đ

### Relationships
- **Có**: Nhiều Orders (One-to-Many)

---

## 7. Model: Order (Đơn hàng)
**Collection**: `orders`

### Mục đích
Quản lý đơn hàng bán lẻ

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `orderNumber` | String | Auto | Mã đơn hàng (ORD2501000001...) |
| `customer` | Object | ✓ | Thông tin khách hàng |
| `user` | ObjectId |  | Tham chiếu đến User (nếu KH có tài khoản) |
| `deliveryType` | String |  | Loại giao hàng (delivery/pickup, default: delivery) |
| `shippingAddress` | Object |  | Địa chỉ giao hàng (bắt buộc nếu delivery) |
| `shippingAddress.street` | String |  | Đường |
| `shippingAddress.city` | String |  | Thành phố |
| `items` | Array | ✓ | Danh sách sản phẩm |
| `subtotal` | Number | ✓ | Tổng tiền hàng |
| `shippingFee` | Number |  | Phí vận chuyển (default: 0) |
| `tax` | Number |  | Thuế (default: 0) |
| `discountType` | String |  | Loại giảm giá (none/retail/wholesale/vip) |
| `discountPercentage` | Number |  | % giảm giá (default: 0) |
| `total` | Number | ✓ | Tổng thanh toán |
| `paymentStatus` | String |  | Trạng thái TT (pending/paid/failed/refunded) |
| `status` | String |  | Trạng thái ĐH (pending/processing/shipping/delivered/cancelled) |

### Indexes
- `orderNumber` (unique)
- `user` + `createdAt` (compound)
- `status`

### Relationships
- **Thuộc về**: 1 Customer (Many-to-One)
- **Chứa**: Nhiều Products (Many-to-Many thông qua items)
- **Có**: 1 Payment (One-to-One)

---

## 8. Model: Payment (Thanh toán)
**Collection**: `payments`

### Mục đích
Quản lý giao dịch thanh toán (bán hàng và mua hàng)

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `paymentNumber` | String | Auto | Mã thanh toán (PAY2025000001...) |
| `paymentType` | String | ✓ | Loại thanh toán (sales/purchase) |
| `relatedOrderId` | ObjectId | ✓ | ID đơn hàng/PO liên quan |
| `amount` | Number | ✓ | Số tiền (≥ 0) |
| `paymentMethod` | String | ✓ | PT thanh toán (cash/card/bank_transfer/e_wallet/check/credit) |
| `paymentDate` | Date |  | Ngày thanh toán (default: now) |
| `status` | String |  | Trạng thái (pending/completed/failed/refunded/cancelled) |
| `refundedAmount` | Number |  | Số tiền đã hoàn (≥ 0, default: 0) |
| `refundReason` | String |  | Lý do hoàn tiền |
| `customer` | ObjectId |  | Tham chiếu đến Customer (cho sales) |
| `supplier` | ObjectId |  | Tham chiếu đến Supplier (cho purchase) |
| `receivedBy` | ObjectId | ✓ | User xử lý thanh toán |
| `notes` | String |  | Ghi chú |

### Virtual Fields
- `netAmount`: Số tiền thực (amount - refundedAmount)

### Methods
- `processRefund(amount, reason)`: Xử lý hoàn tiền
- `cancel(reason)`: Hủy thanh toán
- `markAsFailed(reason)`: Đánh dấu thất bại

### Indexes
- `paymentNumber` (unique)
- `paymentType`, `relatedOrderId`, `status`, `paymentDate`
- `customer`, `supplier`

### Relationships
- **Liên quan đến**: 1 Order HOẶC 1 PurchaseOrder
- **Thuộc về**: 1 Customer (nếu sales)
- **Thuộc về**: 1 Supplier (nếu purchase)
- **Xử lý bởi**: 1 User

---

## 9. Model: Supplier (Nhà cung cấp)
**Collection**: `suppliers`

### Mục đích
Quản lý thông tin nhà cung cấp

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `supplierCode` | String | Auto | Mã NCC (SUP2025000001...) |
| `companyName` | String | ✓ | Tên công ty |
| `email` | String | ✓ | Email công ty (unique) |
| `phone` | String | ✓ | SĐT công ty |
| `address` | Object |  | Địa chỉ |
| `address.street` | String |  | Đường |
| `address.city` | String |  | Thành phố |
| `bankAccount` | Object |  | Thông tin ngân hàng |
| `bankAccount.bankName` | String |  | Tên ngân hàng |
| `bankAccount.accountNumber` | String |  | Số tài khoản |
| `paymentTerms` | String |  | Điều khoản TT (cod/net15/net30/net60/net90, default: net30) |
| `creditLimit` | Number |  | Hạn mức tín dụng (≥ 0, default: 0) |
| `currentDebt` | Number |  | Công nợ hiện tại (≥ 0, default: 0) |
| `productsSupplied` | Array[ObjectId] |  | Danh sách sản phẩm cung cấp |
| `notes` | String |  | Ghi chú |
| `isActive` | Boolean |  | Trạng thái hoạt động (default: true) |

### Virtual Fields
- `purchaseOrders`: Danh sách đơn đặt hàng

### Methods
- `updateRating(newRating)`: Cập nhật đánh giá
- `updatePurchaseStats(orderTotal)`: Cập nhật thống kê mua hàng
- `addDebt(amount)`: Thêm công nợ
- `payDebt(amount)`: Thanh toán công nợ

### Indexes
- `supplierCode`, `email`, `taxId` (unique)
- `companyName`, `isActive`

### Relationships
- **Cung cấp**: Nhiều Products (Many-to-Many)
- **Có**: Nhiều PurchaseOrders (One-to-Many)
- **Có**: Nhiều Payments (One-to-Many)

---

## 10. Model: PurchaseOrder (Đơn đặt hàng)
**Collection**: `purchaseorders`

### Mục đích
Quản lý đơn đặt hàng từ nhà cung cấp

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `poNumber` | String | Auto | Mã PO (PO2025000001...) |
| `supplier` | ObjectId | ✓ | Tham chiếu đến Supplier |
| `orderDate` | Date |  | Ngày đặt hàng (default: now) |
| `expectedDeliveryDate` | Date |  | Ngày giao dự kiến |
| `items` | Array | ✓ | Danh sách sản phẩm |
| `subtotal` | Number |  | Tổng tiền hàng (≥ 0, default: 0) |
| `shippingFee` | Number |  | Phí vận chuyển (≥ 0, default: 0) |
| `tax` | Number |  | Thuế (≥ 0, default: 0) |
| `total` | Number |  | Tổng thanh toán (≥ 0, default: 0) |
| `status` | String |  | Trạng thái (pending/approved/received/cancelled) |
| `paidAmount` | Number |  | Đã thanh toán (≥ 0, default: 0) |
| `createdBy` | ObjectId | ✓ | User tạo đơn |
| `notes` | String |  | Ghi chú |

### Methods
- `approve(userId)`: Phê duyệt đơn hàng
- `receiveItems(receivedItems, userId)`: Nhận hàng (cập nhật inventory)
- `cancel()`: Hủy đơn hàng
- `addPayment(amount)`: Thêm thanh toán

### Indexes
- `poNumber` (unique)
- `supplier`, `status`, `paymentStatus`, `orderDate`

### Relationships
- **Thuộc về**: 1 Supplier (Many-to-One)
- **Chứa**: Nhiều Products (Many-to-Many thông qua items)
- **Tạo bởi**: 1 User
- **Phê duyệt bởi**: 1 User
- **Nhận bởi**: 1 User
- **Có**: Nhiều Payments (One-to-Many)

---

## 11. Model: Inventory (Tồn kho)
**Collection**: `inventories`

### Mục đích
Quản lý tồn kho và lịch sử xuất nhập kho

### Thuộc tính

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `product` | ObjectId | ✓ | Tham chiếu đến Product (unique) |
| `quantityOnHand` | Number |  | Số lượng tồn kho (≥ 0, default: 0) |
| `quantityReserved` | Number |  | Số lượng đã đặt trước (≥ 0, default: 0) |
| `quantityAvailable` | Number |  | Số lượng khả dụng (≥ 0, default: 0) |
| `reorderPoint` | Number |  | Điểm đặt hàng lại (≥ 0, default: 10) |
| `warehouseLocation` | String |  | Vị trí trong kho |
| `movements` | Array |  | Lịch sử xuất nhập |
| `movements[].type` | String | ✓ | Loại (in/out/adjustment/reserved/released) |
| `movements[].quantity` | Number | ✓ | Số lượng |
| `movements[].adjustmentType` | String |  | Loại điều chỉnh (increase/decrease) |
| `movements[].reason` | String |  | Lý do |
| `movements[].referenceId` | String |  | Mã tham chiếu |
| `movements[].referenceType` | String |  | Loại tham chiếu (order/purchase_order/stock_adjustment/reservation/release/return) |
| `movements[].date` | Date |  | Ngày (default: now) |
| `movements[].performedBy` | ObjectId |  | User thực hiện |
| `movements[].notes` | String |  | Ghi chú |

### Virtual Fields
- `isLowStock`: Kiểm tra hết hàng (quantityAvailable ≤ reorderPoint)
- `turnoverInfo`: Thông tin luân chuyển (số lượng bán 30 ngày, trung bình/ngày)

### Methods
- `addStock(quantity, reason, referenceId, userId)`: Nhập hàng
- `removeStock(quantity, reason, referenceId, userId)`: Xuất hàng
- `reserveStock(quantity, referenceId, userId)`: Đặt trước
- `releaseStock(quantity, referenceId, userId)`: Hủy đặt trước
- `adjustStock(newQuantity, reason, userId)`: Điều chỉnh tồn kho
- `adjustStockIncrease(quantity, reason, referenceId, userId)`: Tăng tồn kho

### Static Methods
- `getReservedByOrder(orderId)`: Lấy danh sách hàng đặt trước theo đơn hàng

### Indexes
- `product` (unique)
- `quantityAvailable`
- `movements.date` (desc)

### Business Rules
- `quantityAvailable = quantityOnHand - quantityReserved` (tự động tính)

### Relationships
- **Của**: 1 Product (One-to-One)
- **Thao tác bởi**: Nhiều Users (qua movements)

---

## Sơ Đồ Quan Hệ (Entity Relationship)

```
User ──┬── belongs to ──> Role
       ├── belongs to ──> Department
       ├── creates ──────> Order
       ├── creates ──────> PurchaseOrder
       └── processes ────> Payment

Category ──┬── contains ──> Product
           └── has parent ─> Category (self-reference)

Product ──┬── belongs to ──> Category
          ├── has ─────────> Inventory (1:1)
          ├── in ──────────> Order (M:N via items)
          └── in ──────────> PurchaseOrder (M:N via items)

Customer ──> has ────────> Order

Order ──┬── belongs to ──> Customer
        ├── contains ────> Product (M:N via items)
        └── has ─────────> Payment (1:1)

Supplier ──┬── supplies ──> Product (M:N)
           ├── has ──────> PurchaseOrder
           └── has ──────> Payment

PurchaseOrder ──┬── from ──> Supplier
                ├── contains > Product (M:N via items)
                └── has ────> Payment (1:1)

Inventory ──┬── of ──────> Product (1:1)
            └── tracked by > User (via movements)

Payment ──┬── for ──────> Order (sales) OR PurchaseOrder (purchase)
          ├── from ─────> Customer (if sales)
          ├── to ───────> Supplier (if purchase)
          └── processed > User
```

---

## Quy Trình Nghiệp Vụ Chính

### 1. Quy trình Bán hàng
1. Tạo Order (status: pending)
2. Inventory.reserveStock() - Đặt trước hàng
3. Xử lý thanh toán → Payment (paymentType: sales)
4. Cập nhật Order.paymentStatus = paid
5. Inventory.removeStock() - Xuất kho
6. Cập nhật Order.status (processing → shipping → delivered)
7. Customer.updatePurchaseStats() - Cập nhật thống kê KH

### 2. Quy trình Mua hàng
1. Tạo PurchaseOrder (status: pending)
2. Phê duyệt: PO.approve() (status: approved)
3. Nhận hàng: PO.receiveItems() 
   - Cập nhật items[].received
   - Product.stock tăng
   - Inventory.addStock() - Nhập kho
   - Status: received
4. Thanh toán → Payment (paymentType: purchase)
5. PO.addPayment() - Cập nhật paymentStatus
6. Supplier.updatePurchaseStats() - Cập nhật thống kê NCC

### 3. Quy trình Quản lý Tồn kho
1. Theo dõi: quantityAvailable, isLowStock
2. Cảnh báo: quantityAvailable ≤ reorderPoint
3. Tạo PurchaseOrder với quantity = reorderQuantity
4. Điều chỉnh: Inventory.adjustStock()
5. Lịch sử: movements[] tracking

---

## Các Ràng Buộc và Validation

### Unique Constraints
- User: userCode, username, email
- Role: roleId
- Department: departmentId
- Category: name, slug
- Product: sku, slug
- Customer: customerCode, email (sparse)
- Order: orderNumber
- Payment: paymentNumber
- Supplier: supplierCode, email, taxId (sparse)
- PurchaseOrder: poNumber
- Inventory: product

### Auto-generated Fields
- User: tokens.createdAt (expires 7 days)
- Category: slug (from name)
- Product: slug (from name), isInStock (from stock)
- Customer: customerCode (CUST{year}{6-digit})
- Order: orderNumber (ORD{YY}{MM}{5-digit})
- Payment: paymentNumber (PAY{year}{6-digit})
- Supplier: supplierCode (SUP{year}{6-digit})
- PurchaseOrder: poNumber (PO{year}{6-digit})
- Inventory: quantityAvailable (onHand - reserved)

### Virtual Fields (Computed)
- Category: productCount
- Product: discountPercent, profitMargin, profitAmount
- Customer: orders
- Payment: netAmount
- Supplier: purchaseOrders
- Inventory: isLowStock, turnoverInfo

### Indexes (Performance)
- Text Search: Product (name, description, tags)
- Compound: Product (category + price), Order (user + createdAt)
- Single: Hầu hết unique fields và foreign keys
- Descending: Inventory.movements.date

---

## Tổng Kết Số Liệu

| Collection | Ước tính Records | Primary Keys | Foreign Keys | Indexes |
|-----------|------------------|--------------|--------------|---------|
| Users | 10-100 | userCode | role, department | 6 |
| Roles | 5-20 | roleId | - | 2 |
| Departments | 5-50 | departmentId | manager | 3 |
| Categories | 20-200 | _id | parent | 2 |
| Products | 1,000-100,000 | sku | category | 5 |
| Customers | 100-100,000 | customerCode | - | 5 |
| Orders | 1,000-1,000,000 | orderNumber | user, products | 3 |
| Payments | 1,000-1,000,000 | paymentNumber | orders/POs, customer, supplier | 7 |
| Suppliers | 10-1,000 | supplierCode | products | 4 |
| PurchaseOrders | 100-10,000 | poNumber | supplier, products | 5 |
| Inventories | 1,000-100,000 | product | product | 3 |

**Tổng cộng**: 11 Collections, ~45 Indexes

---

## Notes cho Thiết Kế Database

1. **MongoDB Schema Design**: Sử dụng embedded documents cho:
   - Order.items[], PurchaseOrder.items[] (tránh populate nhiều)
   - Customer.address, Supplier.address (dữ liệu liên kết chặt)
   - Inventory.movements[] (audit trail)

2. **Denormalization**: Cache dữ liệu thường dùng:
   - Order: customer info, productName, productImage
   - PurchaseOrder: productName, sku
   - Payment: relatedOrderNumber

3. **Indexing Strategy**:
   - Unique indexes cho business keys
   - Compound indexes cho queries phổ biến
   - Text indexes cho search features
   - TTL index cho tokens (auto-expire)

4. **Data Integrity**:
   - Pre-save hooks: auto-generate codes, calculate totals
   - Methods: business logic encapsulation
   - Validation: required fields, enums, min/max
   - Transactions: cho các thao tác multi-collection

5. **Performance Optimization**:
   - Virtuals thay vì stored computed fields
   - Sparse indexes cho optional unique fields
   - Pagination cho large datasets
   - Aggregation pipelines cho reports

6. **Security**:
   - passwordHash không bao giờ trả về trong JSON
   - tokens array bảo mật
   - Soft delete với isActive flag

---

## Changelog
- **v1.0** (2025-01-20): Khởi tạo database design với 11 models
