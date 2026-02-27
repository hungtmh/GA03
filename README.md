# BÁO CÁO VI PHẠM NGUYÊN LÝ THIẾT KẾ — Models & Database Layer

> **Phạm vi kiểm tra:** `src/models/*.model.js`, `src/utils/db.js`  
> **Ngày kiểm tra:** 26/02/2026  
> **Tổng số lỗi tìm được:** 11

---

## MỤC LỤC

| Lỗi # | Nguyên lý | File | Mô tả ngắn | Debt Score |
|--------|-----------|------|-------------|------------|
| 1 | DRY | `product.model.js` | `bid_count` subquery lặp lại 15+ lần | 9 |
| 2 | DRY + OCP | `product.model.js` | Sort logic if/else chain lặp 3 lần | 7 |
| 3 | DRY | `product.model.js` | Watchlist JOIN lặp lại 5 lần | 7 |
| 4 | KISS | `product.model.js` | `BASE_QUERY` module-level + where trùng | 6 |
| 5 | KISS | `product.model.js` | Tên hàm `findByProductId2` không rõ ràng | 4 |
| 6 | SRP | `invoice.model.js` | File system operations trong model | 8 |
| 7 | DRY | `invoice.model.js` | `createPayment/ShippingInvoice` duplicate | 7 |
| 8 | DRY | `invoice.model.js` | `getPayment/ShippingInvoice` duplicate | 6 |
| 9 | DRY | `order.model.js` | `findById/ProductIdWithDetails` duplicate | 7 |
| 10 | DIP | `db.js` | Hardcoded credentials + bug `post→port` | 9 |
| 11 | DRY | `review.model.js` | `create()` / `createReview()` duplicate | 5 |

---

## LỖI #1

**File:** `src/models/product.model.js`  
**Dòng:** Xuất hiện tại dòng 9, 42, 82, 139, 229, 238, 292, 336, 358, 425, 462, 505, 539 (bản gốc, lặp 15+ lần)  
**Nguyên lý vi phạm:** DRY (Don't Repeat Yourself)  
**Mô tả vấn đề:** Subquery `bid_count` để đếm số lượt đấu giá bị copy-paste y hệt nhau tại 15+ hàm khác nhau trong `product.model.js` và cả trong `autoBidding.model.js`.

**Code hiện tại (trước khi sửa):**
```javascript
// Đoạn này xuất hiện y hệt trong 15+ hàm:
// findAll, findByProductIdForAdmin, findPage, searchPageByKeywords,
// findByCategoryId, findByCategoryIds, BASE_QUERY, findTopBids,
// findByProductId, findByProductId2, findAllProductsBySellerId,
// findActiveProductsBySellerId, findPendingProductsBySellerId,
// findSoldProductsBySellerId, v.v.

export function findAll() {
  return db('products')
    .leftJoin('users as bidder', 'products.highest_bidder_id', 'bidder.id')
    .leftJoin('users as seller', 'products.seller_id', 'seller.id')
    .select(
      'products.*', 'seller.fullname as seller_name',
      'bidder.fullname as highest_bidder_name',
      db.raw(`
        (
          SELECT COUNT(*)
          FROM bidding_history
          WHERE bidding_history.product_id = products.id
        ) AS bid_count
      `)
    );
}
```

---

### Tại sao đây là vấn đề:
- Đoạn SQL subquery 5 dòng bị lặp lại nguyên bản ở 15+ vị trí khác nhau
- Nếu cần đổi tên bảng `bidding_history` hoặc thêm điều kiện, phải sửa tại 15+ chỗ
- Vi phạm rõ ràng nguyên lý DRY — một thay đổi phải sửa ở nhiều nơi

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:**
- Khi cần sửa bug liên quan đến bid_count, phải tìm và sửa ở **15+ chỗ** trong 2 file
- Developer mới dễ bỏ sót 1-2 chỗ khi sửa, gây ra inconsistency

**Khó mở rộng:**
- Nếu muốn thêm điều kiện lọc vào bid_count (ví dụ: chỉ đếm bid hợp lệ), phải sửa tất cả 15+ nơi
- Rủi ro cao break existing features nếu sửa thiếu

**Khó test:**
- Không thể test logic đếm bid riêng lẻ, nó bị nhúng sâu vào từng query

**Khó đọc hiểu:**
- 5 dòng SQL raw lặp lại liên tục gây nhiễu khi đọc code

**Technical Debt Score: 9/10** (cần fix urgent — ảnh hưởng diện rộng)

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
Trích xuất subquery thành hàm helper `bidCountSubquery()` ở đầu file, tất cả 15+ hàm gọi helper thay vì copy-paste.

**Cấu trúc mới:**
- Thêm hàm `bidCountSubquery()` (private helper) ở đầu `product.model.js`
- Thêm hàm tương tự trong `autoBidding.model.js`
- Tất cả hàm export gọi `bidCountSubquery()` thay vì inline SQL

**Code đề xuất:**
```javascript
// Helper function — khai báo 1 lần duy nhất
function bidCountSubquery() {
  return db.raw(
    `(SELECT COUNT(*) FROM bidding_history 
      WHERE bidding_history.product_id = products.id) AS bid_count`
  );
}

// Sử dụng trong mọi hàm:
export function findAll() {
  return db('products')
    .leftJoin('users as bidder', 'products.highest_bidder_id', 'bidder.id')
    .leftJoin('users as seller', 'products.seller_id', 'seller.id')
    .select(
      'products.*',
      'seller.fullname as seller_name',
      'bidder.fullname as highest_bidder_name',
      bidCountSubquery()   // ← Gọn, rõ ràng, 1 chỗ sửa
    );
}
```

**Lợi ích:**
- Sửa 1 chỗ → ảnh hưởng toàn bộ 15+ hàm
- Code gọn hơn ~60 dòng tổng cộng
- Dễ đọc, dễ hiểu mục đích

**Trade-offs:**
- Không có trade-off đáng kể

**Checklist implementation:**
- [x] Tạo hàm `bidCountSubquery()` trong `product.model.js`
- [x] Tạo hàm `bidCountSubquery()` trong `autoBidding.model.js`
- [x] Refactor tất cả 15+ hàm sử dụng helper
- [x] Test functionality
- [x] Giữ backward-compatible (không đổi tên hàm export)

---

## LỖI #2

**File:** `src/models/product.model.js`  
**Dòng:** 149-161, 248-261, 302-315 (bản gốc, lặp 3 lần)  
**Nguyên lý vi phạm:** DRY (Don't Repeat Yourself) + OCP (Open/Closed Principle)  
**Mô tả vấn đề:** Logic sắp xếp sản phẩm (sort) sử dụng chuỗi if/else chain giống hệt nhau, bị copy-paste ở 3 hàm: `searchPageByKeywords`, `findByCategoryId`, `findByCategoryIds`. Thêm sort mới phải sửa ở 3 nơi (vi phạm DRY), và phải sửa code bên trong hàm (vi phạm OCP).

**Code hiện tại (trước khi sửa):**
```javascript
// Đoạn này lặp lại ở 3 hàm: searchPageByKeywords, findByCategoryId, findByCategoryIds

  // Apply sorting
  if (sort === 'price_asc') {
    query = query.orderBy('products.current_price', 'asc');
  } else if (sort === 'price_desc') {
    query = query.orderBy('products.current_price', 'desc');
  } else if (sort === 'newest') {
    query = query.orderBy('products.created_at', 'desc');
  } else if (sort === 'oldest') {
    query = query.orderBy('products.created_at', 'asc');
  } else {
    // Default: sort by end_at ascending
    query = query.orderBy('products.end_at', 'asc');
  }

  return query.limit(limit).offset(offset);
```

---

### Tại sao đây là vấn đề:
- Cùng 1 logic sắp xếp bị viết 3 lần ở 3 hàm khác nhau
- Thêm sort option mới (ví dụ: sort theo `bid_count`) phải sửa code bên trong 3 hàm
- If/else chain dài, không linh hoạt — vi phạm OCP ("open for extension, closed for modification")

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:**
- Sửa bug sort phải tìm 3 chỗ
- Default sort khác nhau giữa các hàm (1 hàm dùng `end_at`, 2 hàm dùng `created_at`) — dễ nhầm lẫn

**Khó mở rộng:**
- Thêm sort option mới phải mở code, thêm `else if` vào 3 hàm (vi phạm OCP)
- Risk break existing sort behavior

**Khó test:**
- Phải test sort ở cả 3 hàm riêng, không thể test logic sort độc lập

**Khó đọc hiểu:**
- 12 dòng if/else chain khiến hàm dài hơn không cần thiết

**Technical Debt Score: 7/10**

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
Sử dụng mapping object `SORT_OPTIONS` (Strategy Pattern đơn giản) + hàm `applySort()`. Thêm sort mới chỉ cần thêm 1 entry vào map — không cần sửa code logic.

**Cấu trúc mới:**
- `SORT_OPTIONS` — object map chứa tất cả sort options
- `applySort(query, sort, defaultColumn, defaultOrder)` — áp dụng sort lên query

**Code đề xuất:**
```javascript
// Mapping object — thêm sort mới chỉ cần thêm 1 dòng
const SORT_OPTIONS = {
  'price_asc':  { column: 'products.current_price', order: 'asc' },
  'price_desc': { column: 'products.current_price', order: 'desc' },
  'newest':     { column: 'products.created_at',     order: 'desc' },
  'oldest':     { column: 'products.created_at',     order: 'asc' },
};

function applySort(query, sort, defaultColumn = 'products.end_at', defaultOrder = 'asc') {
  const option = SORT_OPTIONS[sort];
  if (option) {
    return query.orderBy(option.column, option.order);
  }
  return query.orderBy(defaultColumn, defaultOrder);
}

// Sử dụng: 1 dòng thay vì 12 dòng if/else
query = applySort(query, sort);
```

**Lợi ích:**
- Thêm sort option mới: chỉ thêm 1 entry vào `SORT_OPTIONS` (OCP compliant)
- Code gọn: từ 12 dòng if/else → 1 dòng `applySort()`
- Logic sort được test riêng lẻ

**Trade-offs:**
- Default sort khác nhau giữa các hàm → cần truyền tham số `defaultColumn`

**Checklist implementation:**
- [x] Tạo `SORT_OPTIONS` mapping object
- [x] Tạo hàm `applySort()`
- [x] Refactor 3 hàm sử dụng `applySort()`
- [x] Test sort ở tất cả các hàm
- [x] Đảm bảo default sort đúng cho mỗi hàm

---

## LỖI #3

**File:** `src/models/product.model.js`  
**Dòng:** 35, 102, 213, 282, 411 (bản gốc, lặp 5 lần)  
**Nguyên lý vi phạm:** DRY (Don't Repeat Yourself)  
**Mô tả vấn đề:** Logic JOIN bảng `watchlists` để kiểm tra user đã yêu thích sản phẩm hay chưa bị copy-paste 5 lần, kèm theo cùng 1 đoạn `.select(db.raw('watchlists.product_id IS NOT NULL AS is_favorite'))` lặp lại.

**Code hiện tại (trước khi sửa):**
```javascript
// Đoạn này lặp 5 lần trong: findByProductIdForAdmin, searchPageByKeywords,
// findByCategoryId, findByCategoryIds, findByProductId2

  .leftJoin('watchlists', function() {
    this.on('products.id', '=', 'watchlists.product_id')
        .andOnVal('watchlists.user_id', '=', userId || -1); 
        // Nếu userId null (chưa login) thì so sánh với -1
  })
  // ...
  .select(
    // ...
    db.raw('watchlists.product_id IS NOT NULL AS is_favorite')
  )
```

---

### Tại sao đây là vấn đề:
- 5 đoạn JOIN + select giống hệt nhau, tổng ~25 dòng duplicate
- Nếu thay đổi logic yêu thích (ví dụ: thêm bảng `favorites`), phải sửa 5 nơi
- Logic fallback `-1` cho userId bị phân tán, khó đảm bảo consistency

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:**
- Sửa 1 bug phải sửa 5 chỗ, dễ bỏ sót

**Khó mở rộng:**
- Đổi cấu trúc bảng watchlists → sửa 5 nơi

**Khó test:**
- Logic yêu thích không test riêng được

**Khó đọc hiểu:**
- Mỗi hàm dài thêm 5 dòng không cần thiết

**Technical Debt Score: 7/10**

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
Trích xuất thành 2 helper: `addWatchlistJoin(query, userId)` và `isFavoriteSelect()`.

**Code đề xuất:**
```javascript
function addWatchlistJoin(query, userId) {
  return query.leftJoin('watchlists', function () {
    this.on('products.id', '=', 'watchlists.product_id')
      .andOnVal('watchlists.user_id', '=', userId || -1);
  });
}

function isFavoriteSelect() {
  return db.raw('watchlists.product_id IS NOT NULL AS is_favorite');
}

// Sử dụng:
let query = db('products').leftJoin('users', ...);
query = addWatchlistJoin(query, userId);
query.select('products.*', isFavoriteSelect());
```

**Lợi ích:**
- 1 chỗ sửa cho logic yêu thích
- Code gọn: từ 5 dòng → 2 dòng mỗi hàm
- Logic fallback `-1` tập trung 1 nơi

**Trade-offs:**
- Không có

**Checklist implementation:**
- [x] Tạo `addWatchlistJoin()` và `isFavoriteSelect()`
- [x] Refactor 5 hàm
- [x] Test favorite toggle

---

## LỖI #4

**File:** `src/models/product.model.js`  
**Dòng:** 334-354 (bản gốc)  
**Nguyên lý vi phạm:** KISS (Keep It Simple, Stupid)  
**Mô tả vấn đề:** `BASE_QUERY` được khai báo ở module-level, buộc phải luôn dùng `.clone()`. Hơn nữa, `findTopEnding` và `findTopPrice` thêm `.where('products.end_at', '>', new Date())` một lần nữa dù `BASE_QUERY` đã có rồi — gây nhầm lẫn về intention.

**Code hiện tại (trước khi sửa):**
```javascript
// Khai báo ở module-level — shared mutable state
const BASE_QUERY = db('products')
  .leftJoin('users', 'products.highest_bidder_id', 'users.id')
  .select(
    'products.*',
    db.raw(`mask_name_alternating(users.fullname) AS bidder_name`),
    db.raw(`(SELECT COUNT(*) FROM bidding_history WHERE product_id = products.id) AS bid_count`)
  )
  .where('end_at', '>', new Date())   // ← Đã có active filter
  .limit(5);

export function findTopEnding() {
  return BASE_QUERY.clone()
    .where('products.end_at', '>', new Date())   // ← LẶP LẠI! Thừa!
    .whereNull('products.closed_at')
    .orderBy('end_at', 'asc');
}

export function findTopPrice() {
  return BASE_QUERY.clone()
    .where('products.end_at', '>', new Date())   // ← LẶP LẠI! Thừa!
    .whereNull('products.closed_at')
    .orderBy('current_price', 'desc');
}
```

---

### Tại sao đây là vấn đề:
- Module-level query object là shared mutable state — dễ gây side effect nếu quên `.clone()`
- Where clause active filter bị duplicate, gây hoang mang: "đã filter rồi sao lại filter tiếp?"
- `BASE_QUERY` thiếu `whereNull('closed_at')` — logic active filter không đầy đủ ở base

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:**
- Developer mới không hiểu tại sao phải `.clone()`, quên sẽ gây bug nghiêm trọng
- Where clause trùng lặp gây confusion

**Khó mở rộng:**
- Thêm Top query mới phải nhớ `.clone()` + hiểu implicit state

**Khó test:**
- Shared state gây flaky tests

**Khó đọc hiểu:**
- Code không self-documenting, phải hiểu knex internal (`.clone()`)

**Technical Debt Score: 6/10**

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
Thay `BASE_QUERY` module-level bằng hàm factory `createTopQuery()` — mỗi lần gọi trả về query object mới, không cần `.clone()`.

**Code đề xuất:**
```javascript
function createTopQuery() {
  let query = db('products')
    .leftJoin('users', 'products.highest_bidder_id', 'users.id')
    .select(
      'products.*',
      maskedBidderName(),
      bidCountSubquery()
    );
  query = addActiveFilter(query);   // ← Dùng helper, đầy đủ logic
  return query.limit(5);
}

export function findTopEnding() {
  return createTopQuery().orderBy('end_at', 'asc');     // Gọn, rõ ràng
}

export function findTopPrice() {
  return createTopQuery().orderBy('current_price', 'desc');
}

export function findTopBids() {
  return createTopQuery().orderBy('bid_count', 'desc');
}
```

**Lợi ích:**
- Không shared mutable state, không cần `.clone()`
- Mỗi hàm rõ ràng mục đích, không where clause trùng lặp
- Active filter logic đầy đủ (bao gồm `closed_at`)

**Trade-offs:**
- Mỗi lần gọi tạo object mới — performance không ảnh hưởng vì knex là lazy query builder

**Checklist implementation:**
- [x] Xóa `BASE_QUERY` const
- [x] Tạo `createTopQuery()` function
- [x] Refactor `findTopEnding`, `findTopPrice`, `findTopBids`
- [x] Test 3 hàm top queries

---

## LỖI #5

**File:** `src/models/product.model.js`  
**Dòng:** 404 (bản gốc)  
**Nguyên lý vi phạm:** KISS (Keep It Simple, Stupid)  
**Mô tả vấn đề:** Hàm `findByProductId2` có tên không mô tả được chức năng. Sự khác biệt so với `findByProductId` là bổ sung watchlist check + seller email — nhưng tên "2" không truyền đạt điều này.

**Code hiện tại (trước khi sửa):**
```javascript
export async function findByProductId2(productId, userId) {
  // Chuyển sang async để xử lý dữ liệu trước khi trả về controller
  const rows = await db('products')
    .leftJoin('users', 'products.highest_bidder_id', 'users.id')
    .leftJoin('product_images', 'products.id', 'product_images.product_id')
    .leftJoin('watchlists', function() {
        this.on('products.id', '=', 'watchlists.product_id')
            .andOnVal('watchlists.user_id', '=', userId || -1); 
    })
    .leftJoin('users as seller', 'products.seller_id', 'seller.id')
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .where('products.id', productId)
    .select(
      'products.*',
      'product_images.img_link',
      'seller.fullname as seller_name',
      'seller.email as seller_email',
      // ... nhiều fields khác
    );
  // ...
}
```

---

### Tại sao đây là vấn đề:
- Tên `findByProductId2` vi phạm naming convention — suffix "2" không self-documenting
- Developer mới phải đọc toàn bộ implementation để hiểu khác gì `findByProductId`
- Không tuân thủ "code should be its own documentation"

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:**
- Developer mất thời gian tìm hiểu "2" nghĩa là gì

**Khó mở rộng:**
- Nếu cần `findByProductId3`, naming convention càng tệ hơn

**Khó test:**
- Test name không mô tả hành vi: `test findByProductId2` — test cái gì?

**Khó đọc hiểu:**
- Code calling: `productModel.findByProductId2(id, userId)` — không rõ intention

**Technical Debt Score: 4/10** (minor nhưng ảnh hưởng readability)

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
Đổi tên thành `findByProductIdWithWatchlist` — mô tả rõ chức năng bổ sung. Giữ alias `findByProductId2` cho backward-compatible.

**Code đề xuất:**
```javascript
export async function findByProductIdWithWatchlist(productId, userId) {
  // ... logic giữ nguyên
}

// Backward-compatible alias
export const findByProductId2 = findByProductIdWithWatchlist;
```

**Lợi ích:**
- Tên hàm tự giải thích mục đích
- Không break code cũ nhờ alias

**Trade-offs:**
- Tên dài hơn, nhưng rõ ràng hơn rất nhiều

**Checklist implementation:**
- [x] Đổi tên hàm chính
- [x] Tạo alias `findByProductId2`
- [x] Không cần update imports (alias giữ nguyên)

---

## LỖI #6

**File:** `src/models/invoice.model.js`  
**Dòng:** 1-68 (bản gốc)  
**Nguyên lý vi phạm:** SRP (Single Responsibility Principle)  
**Mô tả vấn đề:** `invoice.model.js` vừa chịu trách nhiệm database operations VỪA xử lý file system (di chuyển file upload). Import cả `fs`, `path`, `fileURLToPath` — không thuộc tầng Model.

**Code hiện tại (trước khi sửa):**
```javascript
import db from '../utils/db.js';
import fs from 'fs';                    // ← File system trong Model!
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function moveUploadedFiles(tempUrls, type) {
  if (!tempUrls || tempUrls.length === 0) return [];
  
  const targetFolder = `public/images/${type}`;
  const publicPath = path.join(__dirname, '..', 'public');
  const targetPath = path.join(publicPath, 'images', type);
  
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  
  const permanentUrls = [];
  for (const tempUrl of tempUrls) {
    const tempFilename = path.basename(tempUrl);
    const tempPath = path.join(publicPath, tempUrl);
    const ext = path.extname(tempFilename);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const newFilename = `${timestamp}-${random}${ext}`;
    const newPath = path.join(targetPath, newFilename);
    const newUrl = `images/${type}/${newFilename}`;
    try {
      if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, newPath);
        permanentUrls.push(newUrl);
      }
    } catch (error) {
      console.error(`Error moving file ${tempUrl}:`, error);
    }
  }
  return permanentUrls;
}
```

---

### Tại sao đây là vấn đề:
- Model layer chỉ nên chịu trách nhiệm database CRUD — không nên xử lý file I/O
- `fs`, `path` operations thuộc về utility/service layer
- Gộp 2 concerns khác nhau (DB + File System) vào 1 file vi phạm SRP

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:**
- Đổi storage provider (local → S3/Cloud) phải sửa model file
- Logic file system lẫn với DB code, khó phân biệt

**Khó mở rộng:**
- Thêm resize ảnh, validate file type → model càng phình to

**Khó test:**
- Unit test model phải mock cả `fs` module
- Không thể test DB logic riêng biệt khỏi file operations

**Khó đọc hiểu:**
- Developer tìm model để xem DB schema, nhưng thấy 40 dòng file manipulation

**Technical Debt Score: 8/10** (ảnh hưởng kiến trúc)

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
Di chuyển `moveUploadedFiles()` sang file utility riêng: `src/utils/fileHelper.js`. Model chỉ import và gọi.

**Cấu trúc mới:**
- Tạo file mới: `src/utils/fileHelper.js` — chứa `moveUploadedFiles()`
- `invoice.model.js` — import từ `fileHelper.js`, xóa `fs`, `path` imports

**Code đề xuất:**

**`src/utils/fileHelper.js` (file mới):**
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function moveUploadedFiles(tempUrls, type) {
  // ... logic giữ nguyên, chỉ chuyển sang file riêng
}
```

**`src/models/invoice.model.js` (sau refactor):**
```javascript
import db from '../utils/db.js';
import { moveUploadedFiles } from '../utils/fileHelper.js';
// Không còn fs, path imports
```

**Lợi ích:**
- Model chỉ lo database — đúng SRP
- `fileHelper.js` có thể reuse cho module khác
- Unit test model không cần mock `fs`

**Trade-offs:**
- Thêm 1 file utility — nhưng đáng đánh đổi cho clean architecture

**Checklist implementation:**
- [x] Tạo `src/utils/fileHelper.js`
- [x] Di chuyển `moveUploadedFiles()` sang file mới
- [x] Update imports trong `invoice.model.js`
- [x] Xóa `fs`, `path`, `fileURLToPath` imports khỏi model
- [x] Test upload functionality

---

## LỖI #7

**File:** `src/models/invoice.model.js`  
**Dòng:** 72-139 (bản gốc)  
**Nguyên lý vi phạm:** DRY (Don't Repeat Yourself)  
**Mô tả vấn đề:** `createPaymentInvoice()` và `createShippingInvoice()` gần giống hệt nhau — cùng flow: destructure data → move files → insert DB. Chỉ khác vài field (`payment_method` vs `tracking_number` + `shipping_provider`).

**Code hiện tại (trước khi sửa):**
```javascript
export async function createPaymentInvoice(invoiceData) {
  const { order_id, issuer_id, payment_method, payment_proof_urls, note } = invoiceData;
  const permanentUrls = moveUploadedFiles(payment_proof_urls, 'payment_proofs');
  const rows = await db('invoices').insert({
    order_id, issuer_id,
    invoice_type: 'payment',         // ← Khác
    payment_method,                   // ← Khác
    payment_proof_urls: permanentUrls,
    note, is_verified: false, created_at: db.fn.now()
  }).returning('*');
  return rows[0];
}

export async function createShippingInvoice(invoiceData) {
  const { order_id, issuer_id, tracking_number, shipping_provider, shipping_proof_urls, note } = invoiceData;
  const permanentUrls = moveUploadedFiles(shipping_proof_urls, 'shipping_proofs');
  const rows = await db('invoices').insert({
    order_id, issuer_id,
    invoice_type: 'shipping',        // ← Khác
    tracking_number,                  // ← Khác
    shipping_provider,                // ← Khác
    shipping_proof_urls: permanentUrls,
    note, is_verified: false, created_at: db.fn.now()
  }).returning('*');
  return rows[0];
}
```

---

### Tại sao đây là vấn đề:
- ~80% code giống hệt (destructure, moveFiles, insert, returning)
- Thêm loại invoice mới (ví dụ: `refund`) phải copy-paste thêm 1 hàm nữa
- Bug ở common flow (ví dụ: quên `is_verified: false`) phải sửa 2+ chỗ

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:**
- Sửa flow chung phải sửa 2 hàm

**Khó mở rộng:**
- Thêm loại invoice → thêm 1 hàm duplicate nữa

**Khó test:**
- Test 2 hàm có common logic, nhưng phải test riêng

**Khó đọc hiểu:**
- Phải so sánh 2 hàm để tìm điểm khác

**Technical Debt Score: 7/10**

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
Tạo hàm private `createInvoice(invoiceData, type, proofUrls, proofField)` chứa flow chung. 2 hàm export gọi vào hàm chung.

**Code đề xuất:**
```javascript
async function createInvoice(invoiceData, type, proofUrls, proofField) {
  const permanentUrls = moveUploadedFiles(proofUrls, `${type}_proofs`);
  const insertData = {
    order_id: invoiceData.order_id,
    issuer_id: invoiceData.issuer_id,
    invoice_type: type,
    note: invoiceData.note,
    is_verified: false,
    created_at: db.fn.now(),
    [proofField]: permanentUrls,
  };
  // Thêm fields đặc thù theo loại
  if (type === 'payment') insertData.payment_method = invoiceData.payment_method;
  if (type === 'shipping') {
    insertData.tracking_number = invoiceData.tracking_number;
    insertData.shipping_provider = invoiceData.shipping_provider;
  }
  const rows = await db('invoices').insert(insertData).returning('*');
  return rows[0];
}

export async function createPaymentInvoice(invoiceData) {
  return createInvoice(invoiceData, 'payment', invoiceData.payment_proof_urls, 'payment_proof_urls');
}

export async function createShippingInvoice(invoiceData) {
  return createInvoice(invoiceData, 'shipping', invoiceData.shipping_proof_urls, 'shipping_proof_urls');
}
```

**Lợi ích:**
- Common flow chỉ viết 1 lần
- Thêm loại invoice mới: chỉ cần thêm 1 hàm wrapper 1 dòng
- Backward-compatible: 2 hàm export giữ nguyên signature

**Trade-offs:**
- `if (type === ...)` trong `createInvoice` — chấp nhận được cho 2-3 loại

**Checklist implementation:**
- [x] Tạo `createInvoice()` private function
- [x] Refactor `createPaymentInvoice()` và `createShippingInvoice()`
- [x] Test tạo cả 2 loại invoice
- [x] Giữ nguyên signature export

---

## LỖI #8

**File:** `src/models/invoice.model.js`  
**Dòng:** 156-186 (bản gốc)  
**Nguyên lý vi phạm:** DRY (Don't Repeat Yourself)  
**Mô tả vấn đề:** `getPaymentInvoice()` và `getShippingInvoice()` giống hệt nhau, chỉ khác giá trị `invoice_type` ('payment' vs 'shipping').

**Code hiện tại (trước khi sửa):**
```javascript
export async function getPaymentInvoice(orderId) {
  return db('invoices')
    .leftJoin('users as issuer', 'invoices.issuer_id', 'issuer.id')
    .where('invoices.order_id', orderId)
    .where('invoices.invoice_type', 'payment')     // ← Chỉ khác chỗ này
    .select('invoices.*', 'issuer.fullname as issuer_name')
    .first();
}

export async function getShippingInvoice(orderId) {
  return db('invoices')
    .leftJoin('users as issuer', 'invoices.issuer_id', 'issuer.id')
    .where('invoices.order_id', orderId)
    .where('invoices.invoice_type', 'shipping')    // ← Chỉ khác chỗ này
    .select('invoices.*', 'issuer.fullname as issuer_name')
    .first();
}
```

---

### Tại sao đây là vấn đề:
- 2 hàm 100% giống nhau chỉ khác 1 string value
- Vi phạm DRY rõ ràng nhất

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:** Thêm field vào select → sửa 2 nơi  
**Khó mở rộng:** Thêm loại invoice → thêm 1 hàm duplicate  
**Khó đọc hiểu:** Phải so 2 hàm dài để thấy chỉ khác 1 string  

**Technical Debt Score: 6/10**

---

### ĐỀ XUẤT GIẢI PHÁP

**Code đề xuất:**
```javascript
function getInvoiceByType(orderId, invoiceType) {
  return db('invoices')
    .leftJoin('users as issuer', 'invoices.issuer_id', 'issuer.id')
    .where('invoices.order_id', orderId)
    .where('invoices.invoice_type', invoiceType)
    .select('invoices.*', 'issuer.fullname as issuer_name')
    .first();
}

export async function getPaymentInvoice(orderId) {
  return getInvoiceByType(orderId, 'payment');
}

export async function getShippingInvoice(orderId) {
  return getInvoiceByType(orderId, 'shipping');
}
```

**Lợi ích:** Từ 16 dòng → 11 dòng, DRY, dễ mở rộng  

**Checklist implementation:**
- [x] Tạo `getInvoiceByType()` private function
- [x] Refactor 2 hàm export
- [x] Test lấy invoice cả 2 loại

---

## LỖI #9

**File:** `src/models/order.model.js`  
**Dòng:** 69-124 (bản gốc)  
**Nguyên lý vi phạm:** DRY (Don't Repeat Yourself)  
**Mô tả vấn đề:** `findByIdWithDetails()` và `findByProductIdWithDetails()` có ~30 dòng JOIN + SELECT giống hệt nhau, chỉ khác WHERE clause (`orders.id` vs `orders.product_id`).

**Code hiện tại (trước khi sửa):**
```javascript
export async function findByIdWithDetails(orderId) {
  return db('orders')
    .leftJoin('products', 'orders.product_id', 'products.id')
    .leftJoin('users as buyer', 'orders.buyer_id', 'buyer.id')
    .leftJoin('users as seller', 'orders.seller_id', 'seller.id')
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .where('orders.id', orderId)                    // ← Chỉ khác WHERE
    .select(
      'orders.*',
      'products.name as product_name',
      'products.thumbnail as product_thumbnail',
      'products.end_at as product_end_at',
      'products.closed_at as product_closed_at',
      'categories.name as category_name',
      'buyer.id as buyer_id', 'buyer.fullname as buyer_name',
      'buyer.email as buyer_email',
      'seller.id as seller_id', 'seller.fullname as seller_name',
      'seller.email as seller_email'
    ).first();
}

export async function findByProductIdWithDetails(productId) {
  return db('orders')
    .leftJoin('products', 'orders.product_id', 'products.id')    // ← GIỐNG HỆT
    .leftJoin('users as buyer', 'orders.buyer_id', 'buyer.id')   // ← GIỐNG HỆT
    .leftJoin('users as seller', 'orders.seller_id', 'seller.id') // ← GIỐNG HỆT
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .where('orders.product_id', productId)          // ← Chỉ khác WHERE
    .select(/* ... 12 cột giống hệt ... */).first();
}
```

---

### Tại sao đây là vấn đề:
- ~30 dòng JOIN + SELECT hoàn toàn giống nhau, chỉ khác 1 dòng WHERE
- Thêm field mới vào select → phải sửa 2 nơi

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:** Sửa JOIN/SELECT phải sửa 2 chỗ  
**Khó mở rộng:** Thêm field → 2 nơi, dễ quên  
**Khó đọc hiểu:** Phải diff 2 hàm dài để thấy khác gì  

**Technical Debt Score: 7/10**

---

### ĐỀ XUẤT GIẢI PHÁP

**Code đề xuất:**
```javascript
function findOrderWithDetails(whereClause) {
  return db('orders')
    .leftJoin('products', 'orders.product_id', 'products.id')
    .leftJoin('users as buyer', 'orders.buyer_id', 'buyer.id')
    .leftJoin('users as seller', 'orders.seller_id', 'seller.id')
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .where(whereClause)
    .select(
      'orders.*',
      'products.name as product_name',
      'products.thumbnail as product_thumbnail',
      'products.end_at as product_end_at',
      'products.closed_at as product_closed_at',
      'categories.name as category_name',
      'buyer.id as buyer_id', 'buyer.fullname as buyer_name', 'buyer.email as buyer_email',
      'seller.id as seller_id', 'seller.fullname as seller_name', 'seller.email as seller_email'
    ).first();
}

export async function findByIdWithDetails(orderId) {
  return findOrderWithDetails({ 'orders.id': orderId });
}

export async function findByProductIdWithDetails(productId) {
  return findOrderWithDetails({ 'orders.product_id': productId });
}
```

**Lợi ích:** Từ 56 dòng → 26 dòng, 1 chỗ sửa SELECT/JOIN  

**Checklist implementation:**
- [x] Tạo `findOrderWithDetails()` private function
- [x] Refactor 2 hàm export
- [x] Test cả 2 hàm

---

## LỖI #10

**File:** `src/utils/db.js`  
**Dòng:** 1-12 (bản gốc)  
**Nguyên lý vi phạm:** DIP (Dependency Inversion Principle) + **BUG**  
**Mô tả vấn đề:** File kết nối database **hardcode** trực tiếp host, user, password thay vì đọc từ biến môi trường. Ngoài ra còn có **bug**: property `post: 5432` thay vì `port: 5432`.

**Code hiện tại (trước khi sửa):**
```javascript
import knex from 'knex';
export default knex({
  client: 'pg',
  connection: {
    host: 'aws-1-ap-southeast-2.pooler.supabase.com',   // ← Hardcoded!
    post: 5432,                                           // ← BUG: "post" thay vì "port"!
    user: 'postgres.oirldpzqsfngdmisrakp',               // ← Hardcoded credential!
    password: 'WYaxZ0myJw9fIbPH',                        // ← Hardcoded password!
    database: 'postgres'
  },
  pool: { min: 0, max: 7 }
});
```

---

### Tại sao đây là vấn đề:
- **Hardcoded credentials** — password xuất hiện trực tiếp trong source code → bảo mật nghiêm trọng
- **Bug `post` thay vì `port`** — knex sẽ dùng default port, may mắn vẫn hoạt động nhưng là bug tiềm ẩn
- Không thể chuyển môi trường (dev → staging → production) mà không sửa code
- Vi phạm DIP: module high-level phụ thuộc trực tiếp vào giá trị cụ thể thay vì abstraction (env vars)

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:**
- Đổi database → phải sửa source code, commit, deploy
- Password lộ trong git history vĩnh viễn

**Khó mở rộng:**
- Không hỗ trợ multi-environment (dev/staging/prod)
- Không thể dùng CI/CD secrets

**Khó test:**
- Không thể trỏ sang test database mà không sửa code

**Khó đọc hiểu:**
- Credentials nằm trong code — security review sẽ flag ngay

**Technical Debt Score: 9/10** (urgent — security + bug)

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
Sử dụng `process.env` từ file `.env` (đã load bằng `dotenv` trong `index.js`). Sửa typo `post` → `port`.

**Code đề xuất:**
```javascript
import knex from 'knex';

export default knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,       // ← Sửa bug "post" → "port"
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres'
  },
  pool: { min: 0, max: 7 }
});
```

**Lợi ích:**
- Credentials không còn trong source code
- Hỗ trợ multi-environment qua `.env` files
- Sửa bug `post` → `port`
- Default values cho local development

**Trade-offs:**
- Phải tạo file `.env` — nhưng đã có hướng dẫn trong `readme.txt`

**Checklist implementation:**
- [x] Sửa `post` → `port`
- [x] Thay hardcoded values bằng `process.env`
- [x] Thêm default values fallback
- [x] Đảm bảo `.env` có trong `.gitignore`
- [x] Test kết nối database

---

## LỖI #11

**File:** `src/models/review.model.js`  
**Dòng:** 89-119 (bản gốc)  
**Nguyên lý vi phạm:** DRY (Don't Repeat Yourself)  
**Mô tả vấn đề:** Hàm `create()` và `createReview()` cùng insert vào bảng `reviews` với logic gần giống. `createReview` nhận object trực tiếp, `create` nhận object rồi map lại fields trước khi insert — nhưng kết quả cuối cùng giống nhau.

**Code hiện tại (trước khi sửa):**
```javascript
// Hàm 1: nhận reviewData trực tiếp
export function createReview(reviewData) {
    return db('reviews').insert(reviewData).returning('*');
}

// Hàm 2: map fields rồi insert — DUPLICATE LOGIC
export function create(data) {
    return db('reviews').insert({
        reviewer_id: data.reviewer_id,
        reviewee_id: data.reviewed_user_id,   // ← Chỉ khác tên field
        product_id: data.product_id,
        rating: data.rating,
        comment: data.comment,
        created_at: new Date()
    });
}
```

---

### Tại sao đây là vấn đề:
- 2 hàm cùng insert vào `reviews` — nếu thêm required field, phải sửa 2 nơi
- `create()` không gọi `.returning('*')` như `createReview()` — inconsistency
- Caller phải chọn giữa 2 hàm, gây nhầm lẫn

### PHÂN TÍCH TÁC ĐỘNG

**Khó bảo trì:** Thêm field → sửa 2 hàm  
**Khó mở rộng:** Return value khác nhau (1 hàm có `.returning('*')`, 1 không)  
**Khó đọc hiểu:** Tại sao có 2 hàm tạo review?  

**Technical Debt Score: 5/10**

---

### ĐỀ XUẤT GIẢI PHÁP

**Mô tả giải pháp:**  
`create()` gọi lại `createReview()` sau khi map fields — một entry point duy nhất cho insert logic.

**Code đề xuất:**
```javascript
export function createReview(reviewData) {
    return db('reviews').insert(reviewData).returning('*');
}

// Gọi lại createReview thay vì duplicate insert logic
export function create(data) {
    return createReview({
        reviewer_id: data.reviewer_id,
        reviewee_id: data.reviewed_user_id,
        product_id: data.product_id,
        rating: data.rating,
        comment: data.comment,
        created_at: new Date()
    });
}
```

**Lợi ích:**
- Insert logic tập trung tại `createReview()` 
- `create()` chỉ map fields, không duplicate DB logic
- Consistent return value (đều có `.returning('*')`)

**Checklist implementation:**
- [x] Refactor `create()` gọi `createReview()`
- [x] Refactor `updateByReviewerAndProduct()` gọi `updateReview()`
- [x] Test tạo review qua cả 2 hàm

---

## TỔNG HỢP THAY ĐỔI ĐÃ THỰC HIỆN

| # | File | Hành động | Nguyên lý |
|---|------|-----------|-----------|
| 1 | `src/utils/db.js` | Sửa `post`→`port`, dùng `process.env` | DIP + Bug Fix |
| 2 | `src/utils/fileHelper.js` | **Tạo mới** — chuyển `moveUploadedFiles` từ invoice model | SRP |
| 3 | `src/models/product.model.js` | Trích xuất 7 helpers (`bidCountSubquery`, `maskedBidderName`, `addWatchlistJoin`, `isFavoriteSelect`, `addActiveFilter`, `normalizeKeywords`, `buildKeywordWhereClause`, `applySort` + `SORT_OPTIONS`), đổi tên `findByProductId2`, thay `BASE_QUERY` bằng `createTopQuery()` | DRY, OCP, KISS |
| 4 | `src/models/invoice.model.js` | Gộp create/get/has Invoice functions thành hàm chung, import `fileHelper` | DRY, SRP |
| 5 | `src/models/order.model.js` | Gộp `findByIdWithDetails`/`findByProductIdWithDetails` thành `findOrderWithDetails` | DRY |
| 6 | `src/models/review.model.js` | `create()` gọi lại `createReview()`, `updateByReviewerAndProduct()` gọi lại `updateReview()` | DRY |
| 7 | `src/models/autoBidding.model.js` | Trích xuất `bidCountSubquery()` dùng chung | DRY |
| 8 | `src/models/productComment.model.js` | Xóa `getRepliesByCommentId` (dead code, không được sử dụng) | YAGNI |
| 9 | `src/models/systemSetting.model.js` | Xóa `editNewProductLimitMinutes` (dead code, không được sử dụng) | YAGNI |

> **Ghi chú:** Tất cả hàm export cũ đều được giữ lại (hoặc tạo alias) để đảm bảo **backward-compatible** — các route hiện tại không cần sửa.
