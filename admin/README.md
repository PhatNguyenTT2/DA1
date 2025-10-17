# Mini Store - Admin Dashboard

Hệ thống quản trị cửa hàng với React + Vite, kết nối với backend Node.js/Express và MongoDB.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Phiên bản](#phiên-bản)
- [Roadmap](#roadmap)

## 🎯 Tổng quan

Admin Dashboard cho hệ thống Mini Store, cung cấp giao diện quản lý sản phẩm, đơn hàng, danh mục và các chức năng quản trị khác.

### Trạng thái dự án

- **Backend**: ✅ Hoàn thành và sẵn sàng
- **Database**: ✅ MongoDB đã được cấu hình và sẵn sàng
- **Frontend**: 🚧 Đang phát triển (Version 0.2.0)

## ✨ Tính năng

### ✅ Đã hoàn thành (v0.2.0)

#### 🔐 Authentication
- [x] Đăng nhập/Đăng ký
- [x] Protected routes với authentication
- [x] Token-based authentication

#### 📊 Dashboard
- [x] Tổng quan thống kê
- [x] Biểu đồ doanh thu (Sales Chart)
- [x] Hiển thị số liệu tổng hợp

#### 🛍️ Quản lý Sản phẩm (Products)
- [x] Danh sách sản phẩm với pagination (10 items/page)
- [x] Sắp xếp theo ID, Name, Price, Stock
- [x] Hiển thị giá theo định dạng USD
- [x] Color-coded stock status (đỏ: hết hàng, vàng: < 10, xanh: đủ hàng)
- [x] Actions dropdown (Edit/Delete) với fixed positioning
- [x] Tích hợp API backend để fetch dữ liệu
- [x] Responsive design với horizontal scroll

#### 📦 Quản lý Đơn hàng (Orders)
- [x] Danh sách đơn hàng với pagination
- [x] Sắp xếp theo Order Number, Customer Name, Date, Total
- [x] Thay đổi Order Status (Pending, Processing, Shipping, Delivered, Cancelled)
- [x] Thay đổi Payment Status (Pending, Paid, Failed, Refunded)
- [x] Status badges với color coding
- [x] Dropdown menus với fixed positioning (không bị overflow)
- [x] Actions dropdown (Edit/Delete)
- [x] Tích hợp API backend

#### 🏷️ Quản lý Danh mục (Categories)
- [x] Danh sách categories với pagination (10 items/page)
- [x] Sắp xếp theo ID, Name, Product Count
- [x] Actions dropdown (Edit/Delete) với fixed positioning
- [x] Tích hợp API backend
- [x] Add Category functionality

#### 🎨 UI/UX Components
- [x] Header với navigation
- [x] Sidebar menu
- [x] Footer
- [x] Breadcrumb navigation
- [x] Layout system
- [x] Consistent design system với Tailwind CSS
- [x] Dropdown menus với portal-like rendering
- [x] Fixed positioning cho dropdowns (không bị giới hạn bởi overflow containers)

#### 🔧 Technical Features
- [x] Client-side pagination
- [x] Sort functionality với visual indicators
- [x] Click-outside detection cho dropdowns
- [x] Event handling với getBoundingClientRect()
- [x] Responsive table design
- [x] API service layer (authService, productService, orderService, categoryService)

### 🚧 Đang phát triển (v0.3.0 - Upcoming)

#### 📝 CRUD Operations
- [ ] Form thêm sản phẩm mới
- [ ] Form chỉnh sửa sản phẩm
- [ ] Xóa sản phẩm với confirmation
- [ ] Form thêm/sửa đơn hàng
- [ ] Form thêm/sửa danh mục

#### 🖼️ Image Management
- [ ] Upload hình ảnh sản phẩm
- [ ] Image preview
- [ ] Multiple images per product
- [ ] Image gallery

#### 🔍 Search & Filter
- [ ] Tìm kiếm sản phẩm theo tên, SKU
- [ ] Lọc sản phẩm theo category, price range, stock
- [ ] Tìm kiếm đơn hàng theo order number, customer name
- [ ] Lọc đơn hàng theo status, date range

#### 📊 Advanced Features
- [ ] Bulk actions (select multiple items)
- [ ] Export data (CSV, Excel)
- [ ] Product variants (size, color, etc.)
- [ ] Inventory management
- [ ] Stock alerts

### 📅 Roadmap (v0.4.0+)

#### 👥 User Management
- [ ] Danh sách users/customers
- [ ] Quản lý roles và permissions
- [ ] User profile management

#### 📈 Analytics & Reports
- [ ] Báo cáo doanh thu chi tiết
- [ ] Báo cáo sản phẩm bán chạy
- [ ] Báo cáo tồn kho
- [ ] Export reports

#### 🔔 Notifications
- [ ] Real-time notifications
- [ ] Order status updates
- [ ] Low stock alerts
- [ ] Email notifications

#### ⚙️ Settings
- [ ] Store settings
- [ ] Payment settings
- [ ] Shipping settings
- [ ] Tax configuration

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client

### Backend (Đã sẵn sàng)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Dev Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📦 Cài đặt

### Yêu cầu
- Node.js >= 16.x
- npm hoặc yarn
- MongoDB instance (đã được cấu hình)

### Frontend Setup

```bash
# Clone repository
git clone <repository-url>
cd admin

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
# - MONGODB_URI
# - JWT_SECRET
# - PORT

# Run backend server
npm start
```

### Environment Variables

Tạo file `.env` trong thư mục admin với:

```env
VITE_API_URL=http://localhost:3001/api
```

Tạo file `.env` trong thư mục backend với:

```env
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
PORT=3001
```

## 📁 Cấu trúc dự án

```
admin/
├── src/
│   ├── components/          # React components
│   │   ├── CategoryList/    # Category management
│   │   ├── OrderList/       # Order management
│   │   ├── ProductList/     # Product listing
│   │   ├── Header/          # Header component
│   │   ├── Sidebar/         # Sidebar navigation
│   │   ├── Footer/          # Footer component
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Orders.jsx
│   │   ├── Categories.jsx
│   │   └── LoginSignup.jsx
│   ├── services/            # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   └── categoryService.js
│   ├── utils/               # Utility functions
│   └── data/                # Mock data (deprecated)
├── public/                  # Static assets
└── ...

backend/
├── controllers/             # Route controllers
├── models/                  # Mongoose models
├── utils/                   # Utilities (auth, middleware)
└── ...
```

## 🎨 Design System

- **Font**: Poppins (Google Fonts)
- **Colors**: 
  - Primary: Emerald (#10b981)
  - Status: Yellow (#fbbf24), Blue (#3b82f6), Purple (#8b5cf6), Green (#10b981), Red (#ef4444)
- **Spacing**: Tailwind spacing scale
- **Components**: Consistent styling across all modules

## 🐛 Known Issues

- ~~Dropdown menus bị cắt bởi table overflow~~ ✅ Đã fix (v0.2.0)
- ~~Product count không khớp giữa client và server~~ ✅ Đã fix (v0.2.0)
- ~~Dropdown position khi scroll~~ ✅ Đã fix với fixed positioning (v0.2.0)

## 📝 Changelog

### Version 0.2.0 (Current)
- ✅ Hoàn thành tích hợp backend API
- ✅ Implement pagination cho tất cả list views
- ✅ Fix dropdown positioning với portal-like rendering
- ✅ Standardize UI/UX across all modules
- ✅ Add USD currency formatting
- ✅ Improve dropdown menus (Order Status, Payment Status, Actions)

### Version 0.1.0
- ✅ Initial project setup
- ✅ Basic component structure
- ✅ Mock data implementation
- ✅ Authentication flow
- ✅ Dashboard layout

## 👥 Contributing

Dự án đang trong giai đoạn phát triển. Vui lòng liên hệ để biết thêm thông tin về việc đóng góp.

## 📄 License

Private project - All rights reserved

## 📞 Contact

- Repository: [mini-store](https://github.com/PhatNguyenTT2/mini-store)
- Branch: main

---

**Last Updated**: October 9, 2025  
**Version**: 0.2.0  
**Status**: 🚧 In Development
