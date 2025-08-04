# 🍽️ Annadaan - Food Sharing Platform

A Next.js application that connects food vendors with NGOs and shelters to share surplus food and reduce waste.

## ✨ Features

- **Multi-role Authentication**: Separate dashboards for vendors, NGOs, and administrators
- **Food Listing Management**: Vendors can create and manage food offerings
- **Pickup Request System**: NGOs can browse and request available food
- **Admin Panel**: Complete oversight with user verification and content moderation
- **Document Verification**: Secure verification system for user accounts
- **Real-time Updates**: Live activity feeds and notifications
- **Mobile-friendly**: Responsive design for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later)
- MySQL Server (v8.0 or later)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FoodRescue.git
   cd FoodRescue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=foodrescue
   DB_PORT=3306
   JWT_SECRET=your-secure-jwt-secret
   ```

4. **Create database**
   ```bash
   mysql -u root -p -e "CREATE DATABASE foodrescue;"
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Initialize the database**
   - Visit: `http://localhost:3000/api/setup`
   - This creates tables and sample accounts

### 🎯 Demo Accounts

After database initialization:

- **Admin**: `admin@foodrescue.com` / `admin123`
- **Vendor**: `vendor@demo.com` / `admin123`
- **NGO**: `ngo@demo.com` / `admin123`

### 📱 Features

#### For Vendors (Restaurants, Bakeries, etc.)
- Create food listings with quantity, pickup times
- Manage available food items
- View pickup requests

#### For NGOs/Shelters
- Browse available food listings
- Request pickups for needed quantities
- View listing details and vendor information

#### For Admins
- Overview dashboard with statistics
- Monitor all listings and pickup requests
- Platform management

### 🛠️ Configuration

Environment variables (`.env.local`):

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=foodrescue
DB_PORT=3306

# Security
JWT_SECRET=your-secure-jwt-secret-key

# Optional: Database connection settings
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
```

## 🚀 Production Deployment

### Environment Setup
1. Set up a production MySQL database
2. Configure environment variables:
   ```env
   DB_HOST=your-production-db-host
   DB_USER=your-production-db-user
   DB_PASSWORD=your-secure-db-password
   DB_NAME=foodrescue_production
   JWT_SECRET=your-very-secure-jwt-secret
   ```

### Deployment Options

#### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

#### Docker
```bash
# Build the application
npm run build

# Create production image
docker build -t foodrescue .

# Run with environment variables
docker run -p 3000:3000 --env-file .env.production foodrescue
```

#### Traditional Server
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database Migration
For production, run the setup endpoint once:
```
https://yourdomain.com/api/setup
```

**Important**: Disable or secure the setup endpoint in production!

### 📁 Project Structure

```
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout
├── login/page.tsx          # Login page
├── register/page.tsx       # Registration page
├── dashboard/
│   ├── admin/page.tsx      # Admin dashboard
│   ├── vendor/page.tsx     # Vendor dashboard
│   └── ngo/page.tsx        # NGO dashboard
└── api/
    ├── auth/               # Authentication endpoints
    ├── listings/           # Food listings API
    ├── pickup-requests/    # Pickup requests API
    └── setup/              # Database initialization

lib/
├── database.ts             # Database utilities
└── auth.ts                # Authentication utilities

types/
└── index.ts               # TypeScript types
```

### 🗄️ Database Schema

The application uses MySQL with the following main tables:
- `users` - User accounts (vendors, NGOs, admins)
- `vendor_profiles` - Vendor business information
- `ngo_profiles` - NGO organization information
- `food_listings` - Available food items
- `pickup_requests` - Pickup requests from NGOs

### 🔧 Troubleshooting

1. **Database connection issues**: Ensure MySQL is running and credentials are correct
2. **Build errors**: Run `npm install` to ensure all dependencies are installed
3. **Authentication issues**: Check JWT_SECRET in environment variables

### 📝 Notes

This is a simplified MVP version designed for quick demonstration. For production use, you would want to add:
- Better error handling
- Input validation
- Rate limiting
- Email verification
- Real-time notifications
- Geographic search/filtering
- Image uploads
- Community impact gallery
- Advanced admin features

## 🌟 Getting Started

1. Clone the repository
2. Run `npm install`
3. Set up your MySQL database
4. Create `.env.local` with your database credentials
5. Run `npm run dev`
6. Visit `http://localhost:3000/api/setup` to initialize
7. Start using the platform!

---

Built with Next.js, TypeScript, MySQL, and Tailwind CSS.
