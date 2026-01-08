# The Vybe Store 🧶

A premium, handcrafted e-commerce functionality built with Next.js, Tailwind CSS, and Framer Motion. This project features a unique "handcrafted" aesthetic with custom animations, textures, and fluid interactions.

![The Vybe Store Preview](./public/preview.png)

## 🌟 Features

### Customer Experience
- **Handcrafted Aesthetic**: Custom paper textures, rough edges, and organic animations.
- **Interactive UI**: Custom cursor, fluid transitions, and staggered animations.
- **Shop Functionality**:
  - Filter by Category (Sticky navigation)
  - Sort by Price, Date, and Popularity
  - Quick View and Zoom Modal
  - Wishlist Management
  - Shopping Cart with Slide-over
- **Support Pages**: Fully styled static pages for Shipping, Returns, FAQ, and Privacy.

### Admin Dashboard (`/admin`)
- **Dashboard Overview**: Key metrics and activity.
- **Product Management**:
  - Create, Edit, Delete products.
  - **Image Manager**: Add/Remove via URL, set primary image.
  - Sortable Tables (Stock, Price, Name).
- **Order Management**:
  - Update Order Status (Pending -> Delivered).
  - Export Orders to CSV.
- **Customer Insights**:
  - View top customers.
  - Export Customer data to CSV.

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context (Cart & Wishlist)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository** (if not already local):
   ```bash
   git clone https://github.com/yourusername/the-vybe-store.git
   cd the-vybe-store
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Vercel (Recommended)

The easiest way to deploy is using the Vercel Platform.

1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and sign up/login.
3. Click **"Add New Project"** and select your GitHub repository.
4. Vercel will detect Next.js automatically. Click **"Deploy"**.

### Admin Access
Visit `/admin` to access the dashboard. 
*Note: In this demo version, auth is client-side mock.*

## 🎨 Credits
Designed and Developed by [Your Name/AI Assistant].
Images courtesy of Unsplash.
