# 🍽️ FoodRescue - Food Sharing Platform

A simple Next.js application that connects food vendors with NGOs and shelters to share surplus food and reduce waste.

## 🚀 Quick Start (For Demo)

### Prerequisites
- Node.js (v18 or later)
- MySQL Server
- npm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start MySQL** (make sure MySQL is running on your system)

3. **Create database**
   ```bash
   mysql -u root -p -e "CREATE DATABASE foodrescue;"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Initialize the database with sample data**
   - Open your browser and go to: `http://localhost:3000/api/setup`
   - This will create tables and sample users

### 🎯 Demo Accounts

After running the setup endpoint, you can login with these accounts:

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

Create a `.env.local` file with your database settings:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=foodrescue
DB_PORT=3306
JWT_SECRET=your-secret-key
```

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
