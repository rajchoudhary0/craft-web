import { Product, Testimonial, products, testimonials } from './data';

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: string;
  createdAt: string;
}

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ART-001',
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah@email.com',
    items: [
      { productId: '1', productName: 'Woven Terracotta Basket', quantity: 2, price: 89 },
      { productId: '3', productName: 'Macramé Wall Hanging', quantity: 1, price: 125 },
    ],
    total: 303,
    status: 'pending',
    paymentStatus: 'paid',
    shippingAddress: '123 Maple St, Portland, OR 97201',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    orderNumber: 'ART-002',
    customerName: 'James Chen',
    customerEmail: 'james@email.com',
    items: [
      { productId: '2', productName: 'Ceramic Moon Vase', quantity: 1, price: 145 },
    ],
    total: 145,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: '456 Oak Ave, San Francisco, CA 94102',
    createdAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    orderNumber: 'ART-003',
    customerName: 'Emma Roberts',
    customerEmail: 'emma@email.com',
    items: [
      { productId: '6', productName: 'Wooden Serving Board', quantity: 1, price: 110 },
      { productId: '4', productName: 'Hand-poured Soy Candles', quantity: 2, price: 68 },
    ],
    total: 246,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: '789 Pine Blvd, Austin, TX 78701',
    createdAt: '2024-01-12T09:15:00Z',
  },
  {
    id: '4',
    orderNumber: 'ART-004',
    customerName: 'Michael Thompson',
    customerEmail: 'michael@email.com',
    items: [
      { productId: '7', productName: 'Hand-knit Wool Throw', quantity: 1, price: 195 },
    ],
    total: 195,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: '321 Cedar Rd, Seattle, WA 98101',
    createdAt: '2024-01-08T14:20:00Z',
  },
  {
    id: '5',
    orderNumber: 'ART-005',
    customerName: 'Olivia Parker',
    customerEmail: 'olivia@email.com',
    items: [
      { productId: '5', productName: 'Linen Table Runner', quantity: 1, price: 78 },
      { productId: '8', productName: 'Botanical Print Set', quantity: 1, price: 85 },
    ],
    total: 163,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '654 Birch Way, Denver, CO 80202',
    createdAt: '2024-01-16T11:00:00Z',
  },
];

// Dashboard stats
export function getDashboardStats() {
  const totalOrders = mockOrders.length;
  const revenue = mockOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const lowStockProducts = products.filter(p => p.quantity < 10).length;
  const totalProducts = products.length;

  return {
    totalOrders,
    revenue,
    pendingOrders,
    lowStockProducts,
    totalProducts,
  };
}

// Sales data for charts
export function getSalesData() {
  return [
    { name: 'Mon', sales: 420 },
    { name: 'Tue', sales: 380 },
    { name: 'Wed', sales: 520 },
    { name: 'Thu', sales: 450 },
    { name: 'Fri', sales: 680 },
    { name: 'Sat', sales: 820 },
    { name: 'Sun', sales: 560 },
  ];
}

// Category performance
export function getCategoryData() {
  return [
    { name: 'Home Decor', value: 35 },
    { name: 'Ceramics', value: 25 },
    { name: 'Textiles', value: 20 },
    { name: 'Kitchen', value: 12 },
    { name: 'Art', value: 8 },
  ];
}

// Best sellers
export function getBestSellers() {
  return products
    .filter(p => p.tags.includes('best-seller'))
    .slice(0, 5)
    .map(p => ({ name: p.name, sales: Math.floor(Math.random() * 50) + 20 }));
}

// Recent orders
export function getRecentOrders() {
  return mockOrders.slice(0, 5);
}

// Get order by ID
export function getOrderById(id: string) {
  return mockOrders.find(o => o.id === id);
}

// Format date
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get status color
export function getStatusColor(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'bg-gold/20 text-gold-dark';
    case 'processing':
      return 'bg-blue-100 text-blue-700';
    case 'shipped':
      return 'bg-sage/20 text-sage-dark';
    case 'delivered':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-clay/20 text-text-dark';
  }
}

export function getPaymentStatusColor(status: Order['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-gold/20 text-gold-dark';
    case 'refunded':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-clay/20 text-text-dark';
  }
}
