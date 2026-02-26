# 📋 BÁO CÁO VI PHẠM NGUYÊN LÝ THIẾT KẾ — Models & Database Layer

> **Phạm vi kiểm tra:** Tất cả file trong `src/models/*.model.js` và `src/utils/db.js`  
> **Ngày kiểm tra:** 26/02/2026

---

## Mục lục

1. [Tổng kết vi phạm](#1-tổng-kết-vi-phạm)
2. [Chi tiết vi phạm theo nguyên lý](#2-chi-tiết-vi-phạm-theo-nguyên-lý)
   - [DRY — Don't Repeat Yourself](#21-dry--dont-repeat-yourself)
   - [SRP — Single Responsibility Principle](#22-srp--single-responsibility-principle)
   - [OCP — Open/Closed Principle](#23-ocp--openclosed-principle)
   - [DIP — Dependency Inversion Principle](#24-dip--dependency-inversion-principle)
   - [KISS — Keep It Simple, Stupid](#25-kiss--keep-it-simple-stupid)
   - [YAGNI — You Ain't Gonna Need It](#26-yagni--you-aint-gonna-need-it)
3. [Tổng hợp thay đổi đã thực hiện](#3-tổng-hợp-thay-đổi-đã-thực-hiện)

---

## 1. Tổng kết vi phạm

| Nguyên lý | Số vi phạm | Mức độ | File chính bị ảnh hưởng |
|-----------|-----------|--------|------------------------|
| **DRY**   | 11        | 🔴 Cao | `product.model.js`, `invoice.model.js`, `order.model.js`, `review.model.js`, `autoBidding.model.js` |
| **SRP**   | 2         | 🟡 Trung bình | `invoice.model.js`, `product.model.js` |
| **OCP**   | 1         | 🟡 Trung bình | `product.model.js` |
| **DIP**   | 1         | 🟡 Trung bình | `db.js` |
| **KISS**  | 2         | 🟡 Trung bình | `product.model.js` |
| **YAGNI** | 4         | 🟢 Thấp | `invoice.model.js`, `productComment.model.js`, `systemSetting.model.js`, `order.model.js` |

---

## 2. Chi tiết vi phạm theo nguyên lý

---

### 2.1 DRY — Don't Repeat Yourself

#### DRY-01: Subquery `bid_count` lặp lại 15+ lần (product.model.js, autoBidding.model.js)

**Mô tả:** Đoạn SQL đếm lượt bid được copy-paste ở khắp nơi.

**Code vi phạm (lặp lại trong 15+ hàm):**
```js
db.raw(`(SELECT COUNT(*) FROM bidding_history WHERE bidding_history.product_id = products.id) AS bid_count`)
```

**Xuất hiện tại:** `findAll`, `findByProductIdForAdmin`, `findPage`, `searchPageByKeywords`, `findByCategoryId`, `findByCategoryIds`, `BASE_QUERY`, `findTopBids`, `findByProductId`, `findByProductId2`, `findAllProductsBySellerId`, `findActiveProductsBySellerId`, `findPendingProductsBySellerId`, `findSoldProductsBySellerId` trong `product.model.js`, và `getBiddingProductsByBidderId`, `getWonAuctionsByBidderId` trong `autoBidding.model.js`.

**Cách sửa:** Trích xuất thành hàm helper `bidCountSubquery()`.

---

#### DRY-02: `mask_name_alternating` lặp lại 8+ lần (product.model.js)

**Mô tả:** Hàm che tên bidder được copy-paste nhiều lần.

**Code vi phạm:**
```js
db.raw(`mask_name_alternating(users.fullname) AS bidder_name`)
```

**Cách sửa:** Trích xuất thành hàm helper `maskedBidderName()`.

---

#### DRY-03: Watchlist JOIN lặp lại 5 lần (product.model.js)

**Mô tả:** Logic join bảng watchlist bị copy-paste.

**Code vi phạm:**
```js
.leftJoin('watchlists', function() {
    this.on('products.id', '=', 'watchlists.product_id')
        .andOnVal('watchlists.user_id', '=', userId || -1);
})
```

**Xuất hiện tại:** `findByProductIdForAdmin`, `searchPageByKeywords`, `findByCategoryId`, `findByCategoryIds`, `findByProductId2`.

**Cách sửa:** Trích xuất thành hàm helper `addWatchlistJoin(query, userId)`.

---

#### DRY-04: Active product filter lặp lại 8+ lần (product.model.js)

**Mô tả:** Điều kiện lọc sản phẩm đang active bị copy-paste.

**Code vi phạm:**
```js
.where('products.end_at', '>', new Date())
.whereNull('products.closed_at')
```

**Cách sửa:** Trích xuất thành hàm helper `addActiveFilter(query)`.

---

#### DRY-05: Logic sắp xếp (sort) lặp lại 3 lần (product.model.js)

**Mô tả:** Chuỗi if/else if cho sorting bị copy-paste y hệt.

**Code vi phạm (lặp lại trong `searchPageByKeywords`, `findByCategoryId`, `findByCategoryIds`):**
```js
if (sort === 'price_asc') {
    queryBuilder.orderBy('products.current_price', 'asc');
} else if (sort === 'price_desc') {
    queryBuilder.orderBy('products.current_price', 'desc');
} else if (sort === 'newest') {
    queryBuilder.orderBy('products.created_at', 'desc');
} else if (sort === 'oldest') {
    queryBuilder.orderBy('products.created_at', 'asc');
} else {
    queryBuilder.orderBy('products.created_at', 'desc');
}
```

**Cách sửa:** Trích xuất thành hàm `applySort(query, sort)` + dùng map thay vì if/else (đồng thời sửa OCP).

---

#### DRY-06: Keyword normalization lặp lại 2 lần (product.model.js)

**Mô tả:** Logic xử lý dấu tiếng Việt bị copy-paste giữa `searchPageByKeywords` và `countByKeywords`.

**Code vi phạm:**
```js
const searchQuery = keywords.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
```

**Cách sửa:** Trích xuất thành hàm `normalizeKeywords(keywords)`.

---

#### DRY-07: Keyword WHERE clause lặp lại 2 lần (product.model.js)

**Mô tả:** Toàn bộ khối `.where()` cho tìm kiếm keyword bị duplicate giữa `searchPageByKeywords` và `countByKeywords`.

**Cách sửa:** Trích xuất thành hàm `buildKeywordWhereClause(builder, searchQuery, logic)`.

---

#### DRY-08: `getPaymentInvoice` / `getShippingInvoice` gần giống hệt (invoice.model.js)

**Mô tả:** Hai hàm chỉ khác giá trị `invoice_type` (`'payment'` vs `'shipping'`), nhưng toàn bộ query bị copy-paste.

**Cách sửa:** Gộp thành `getInvoiceByType(orderId, invoiceType)`, giữ lại 2 hàm cũ gọi vào hàm chung.

---

#### DRY-09: `createPaymentInvoice` / `createShippingInvoice` gần giống hệt (invoice.model.js)

**Mô tả:** Hai hàm tạo invoice chỉ khác vài field nhưng cấu trúc bị duplicate hoàn toàn.

**Cách sửa:** Trích xuất logic chung thành hàm `createInvoice(invoiceData, type)`.

---

#### DRY-10: `findByIdWithDetails` / `findByProductIdWithDetails` gần giống hệt (order.model.js)

**Mô tả:** Hai hàm chỉ khác WHERE clause (`orders.id` vs `orders.product_id`), nhưng toàn bộ select/join bị copy-paste (~30 dòng mỗi hàm).

**Cách sửa:** Gộp thành hàm nội bộ `findOrderWithDetails(whereClause)`, hai hàm export gọi vào.

---

#### DRY-11: `createReview` / `create` làm cùng một việc (review.model.js)

**Mô tả:** Hai hàm cùng insert vào bảng `reviews` với logic gần giống. `createReview` nhận object có `reviewData`, `create` nhận object riêng lẻ.

**Cách sửa:** Giữ `createReview` làm hàm chính, `create` gọi lại `createReview`.

---

### 2.2 SRP — Single Responsibility Principle

#### SRP-01: File system operations trong model (invoice.model.js)

**Mô tả:** Hàm `moveUploadedFiles()` thực hiện thao tác file system (đọc/ghi/di chuyển file) ngay bên trong model layer. Model chỉ nên chịu trách nhiệm về database.

**Code vi phạm:**
```js
// Trong invoice.model.js
import fs from 'fs';
import path from 'path';

function moveUploadedFiles(tempUrls, type) {
  // ... ~30 dòng xử lý file system
  fs.mkdirSync(targetPath, { recursive: true });
  fs.renameSync(tempPath, newPath);
  // ...
}
```

**Cách sửa:** Di chuyển `moveUploadedFiles` sang `src/utils/fileHelper.js`.

---

#### SRP-02: Business logic trong model — `cancelProduct` (product.model.js)

**Mô tả:** Hàm `cancelProduct` không chỉ cập nhật product mà còn query orders, cancel orders — đây là business logic nên nằm ở service/route layer.

**Code vi phạm:**
```js
export async function cancelProduct(productId, sellerId) {
  const product = await db('products').where('id', productId).first();
  // ... verify seller ...
  // Cancel active orders (business logic!)
  const activeOrders = await db('orders')...
  for (let order of activeOrders) {
    await db('orders').where('id', order.id).update({...});
  }
  await updateProduct(productId, {...});
  return product;
}
```

**Cách sửa:** Tách logic cancel orders ra khỏi model, chỉ giữ hàm update product thuần túy. Sử dụng transaction để đảm bảo tính toàn vẹn.

---

### 2.3 OCP — Open/Closed Principle

#### OCP-01: Sort logic dùng if/else chain (product.model.js)

**Mô tả:** Mỗi khi thêm kiểu sort mới, phải sửa code bên trong hàm (vi phạm "closed for modification").

**Code vi phạm:** (xem DRY-05 ở trên)

**Cách sửa:** Dùng mapping object `SORT_OPTIONS` — thêm sort mới chỉ cần thêm entry vào map.

```js
const SORT_OPTIONS = {
  'price_asc':  { column: 'products.current_price', order: 'asc' },
  'price_desc': { column: 'products.current_price', order: 'desc' },
  'newest':     { column: 'products.created_at', order: 'desc' },
  'oldest':     { column: 'products.created_at', order: 'asc' },
};
```

---

### 2.4 DIP — Dependency Inversion Principle

#### DIP-01: Hardcoded database credentials (db.js)

**Mô tả:** File `db.js` chứa trực tiếp host, user, password thay vì đọc từ biến môi trường. Ngoài ra còn có **bug**: `post: 5432` thay vì `port: 5432`.

**Code vi phạm:**
```js
export default knex({
  client: 'pg',
  connection: {
    host: 'aws-1-ap-southeast-2.pooler.supabase.com',
    post: 5432,  // ← BUG: phải là "port"
    user: 'postgres.oirldpzqsfngdmisrakp',
    password: 'WYaxZ0myJw9fIbPH',
    database: 'postgres'
  }
});
```

**Cách sửa:** Sử dụng `process.env.*` đã load từ `.env` thông qua `dotenv`.

---

### 2.5 KISS — Keep It Simple, Stupid

#### KISS-01: `BASE_QUERY` ở module-level + where clause trùng lặp (product.model.js)

**Mô tả:** `BASE_QUERY` được tạo ở module-level và luôn phải dùng `.clone()`. Thêm vào đó, `findTopEnding` và `findTopPrice` lại thêm `.where('products.end_at', '>', new Date())` một lần nữa dù `BASE_QUERY` đã có rồi — gây nhầm lẫn.

**Code vi phạm:**
```js
const BASE_QUERY = db('products')
  .leftJoin('users', ...)
  .select(...)
  .where('end_at', '>', new Date()) // ← đã có active filter
  .limit(5);

export function findTopEnding() {
  return BASE_QUERY.clone()
    .where('products.end_at', '>', new Date())   // ← thêm lần nữa (thừa!)
    .whereNull('products.closed_at')
    .orderBy('end_at', 'asc');
}
```

**Cách sửa:** Thay `BASE_QUERY` bằng hàm `createTopQuery()` rõ ràng hơn, xóa các where clause trùng lặp.

---

#### KISS-02: Đặt tên hàm không rõ ràng — `findByProductId2` (product.model.js)

**Mô tả:** Tên `findByProductId2` không mô tả được sự khác biệt so với `findByProductId`. Thực tế hàm này bổ sung thêm watchlist check + seller info.

**Cách sửa:** Đổi tên thành `findByProductIdWithWatchlist` — giữ lại alias `findByProductId2` cho backward-compatible.

---

### 2.6 YAGNI — You Ain't Gonna Need It

#### YAGNI-01: `hasPaymentInvoice` / `hasShippingInvoice` không được sử dụng (invoice.model.js)

**Mô tả:** Hai hàm này được định nghĩa nhưng không có file nào gọi đến.

**Cách sửa:** Gộp thành `hasInvoiceOfType(orderId, type)` để giảm code chết, giữ lại phòng trường hợp cần.

---

#### YAGNI-02: `getRepliesByCommentId` (singular) không được sử dụng (productComment.model.js)

**Mô tả:** Chỉ có phiên bản batch `getRepliesByCommentIds` (plural) được sử dụng. Phiên bản đơn `getRepliesByCommentId` là dead code.

**Cách sửa:** Xóa hàm, vì `getRepliesByCommentIds([id])` có thể thay thế hoàn toàn.

---

#### YAGNI-03: `editNewProductLimitMinutes` không được sử dụng (systemSetting.model.js)

**Mô tả:** Hàm đặc thù cho 1 setting cụ thể nhưng không được gọi ở bất kỳ đâu. Hàm `updateSetting(key, value)` tổng quát hơn đã tồn tại.

**Cách sửa:** Xóa hàm, dùng `updateSetting('new_product_limit_minutes', minutes)` khi cần.

---

#### YAGNI-04: `findByIdWithDetails` / `findByProductIdWithDetails` không được sử dụng (order.model.js)

**Mô tả:** Hai hàm query chi tiết nhưng không được gọi ở bất kỳ route nào.

**Cách sửa:** Gộp thành 1 hàm nội bộ, giữ export phòng trường hợp cần trong tương lai.

---

## 3. Tổng hợp thay đổi đã thực hiện

| File | Thay đổi | Nguyên lý áp dụng |
|------|----------|-------------------|
| `src/utils/db.js` | Sử dụng `process.env`, sửa bug `post` → `port` | DIP |
| `src/utils/fileHelper.js` | **Tạo mới** — chuyển `moveUploadedFiles` từ invoice model | SRP |
| `src/models/product.model.js` | Trích xuất 7 helper functions, refactor 15+ hàm, đổi tên `findByProductId2`, xóa BASE_QUERY | DRY, OCP, KISS |
| `src/models/invoice.model.js` | Gộp các hàm duplicate thành hàm chung, import fileHelper | DRY, SRP, YAGNI |
| `src/models/order.model.js` | Gộp `findByIdWithDetails`/`findByProductIdWithDetails` | DRY, YAGNI |
| `src/models/review.model.js` | Gộp `create` gọi lại `createReview` | DRY |
| `src/models/autoBidding.model.js` | Trích xuất `bidCountSubquery` | DRY |
| `src/models/productComment.model.js` | Xóa `getRepliesByCommentId` (unused) | YAGNI |
| `src/models/systemSetting.model.js` | Xóa `editNewProductLimitMinutes` (unused) | YAGNI |

---

> **Ghi chú:** Tất cả hàm export cũ đều được giữ lại (hoặc tạo alias) để đảm bảo backward-compatible với các route hiện tại.
