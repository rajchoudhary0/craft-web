// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  category?: string;
  tags?: string[];
  materials?: string[];
  dimensions?: string;
  careInstructions?: string[];
  story?: string;
  inStock?: boolean;
  quantity?: number;
  type?: string;
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  slug?: string;
}

// Testimonial types
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  productPurchased: string;
  date: string;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Mock Products Data
export const products: Product[] = [
  {
    id: '1',
    name: 'Woven Terracotta Basket',
    description: 'Hand-woven basket using traditional techniques, perfect for storage or as a decorative piece.',
    price: 89,
    originalPrice: 120,
    images: [
      'https://images.unsplash.com/photo-1622398925373-3f6c69566956?w=800',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
    ],
    category: 'Home Decor',
    tags: ['best-seller', 'handmade'],
    materials: ['Natural rattan', 'Cotton cord', 'Vegetable dye'],
    dimensions: '30cm x 25cm x 20cm',
    careInstructions: ['Dust with soft cloth', 'Keep away from moisture', 'Store in dry place'],
    story: 'Each basket is lovingly crafted over three days by artisans in our mountain studio, using techniques passed down through generations.',
    inStock: true,
    quantity: 15,
  },
  {
    id: '2',
    name: 'Ceramic Moon Vase',
    description: 'Elegant hand-thrown ceramic vase with a unique crescent moon design and matte sage glaze.',
    price: 145,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    ],
    category: 'Ceramics',
    tags: ['new', 'limited-edition', 'handmade'],
    materials: ['Stoneware clay', 'Lead-free glaze'],
    dimensions: '25cm height x 15cm diameter',
    careInstructions: ['Hand wash only', 'Not microwave safe', 'Handle with care'],
    story: 'Inspired by moonlit nights in the countryside, each vase carries subtle imperfections that make it uniquely yours.',
    inStock: true,
    quantity: 8,
  },
  {
    id: '3',
    name: 'Macramé Wall Hanging',
    description: 'Bohemian-style macramé wall hanging with intricate knot patterns and natural cotton fringe.',
    price: 125,
    images: [
      'https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?w=800',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    ],
    category: 'Textiles',
    tags: ['best-seller', 'handmade'],
    materials: ['100% organic cotton rope', 'Natural wood dowel'],
    dimensions: '60cm width x 90cm length',
    careInstructions: ['Shake gently to remove dust', 'Spot clean only', 'Avoid direct sunlight'],
    story: 'Created during quiet morning hours, this piece brings the calm energy of our studio into your home.',
    inStock: true,
    quantity: 12,
  },
  {
    id: '4',
    name: 'Hand-poured Soy Candles',
    description: 'Set of three artisan soy candles with notes of lavender, cedar, and vanilla.',
    price: 68,
    images: [
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800',
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800',
    ],
    category: 'Home Fragrance',
    tags: ['new', 'handmade'],
    materials: ['100% soy wax', 'Cotton wick', 'Essential oils'],
    dimensions: 'Each: 8cm height x 7cm diameter',
    careInstructions: ['Trim wick before each use', 'Burn for max 4 hours', 'Keep away from drafts'],
    story: 'Our signature scent collection, formulated over months of experimentation to capture the essence of a cozy home.',
    inStock: true,
    quantity: 25,
  },
  {
    id: '5',
    name: 'Linen Table Runner',
    description: 'Naturally dyed linen table runner with hand-stitched edges and subtle botanical print.',
    price: 78,
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800',
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800',
    ],
    category: 'Textiles',
    tags: ['limited-edition', 'handmade'],
    materials: ['100% European linen', 'Plant-based dye'],
    dimensions: '180cm x 40cm',
    careInstructions: ['Machine wash cold', 'Tumble dry low', 'Iron while damp'],
    story: 'Each runner is dyed using botanicals from our garden, creating one-of-a-kind color variations.',
    inStock: true,
    quantity: 6,
  },
  {
    id: '6',
    name: 'Wooden Serving Board',
    description: 'Artisan-crafted walnut serving board with live edge detail and food-safe finish.',
    price: 110,
    originalPrice: 135,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    ],
    category: 'Kitchen',
    tags: ['best-seller', 'handmade'],
    materials: ['American black walnut', 'Food-safe mineral oil'],
    dimensions: '45cm x 25cm x 2cm',
    careInstructions: ['Hand wash and dry immediately', 'Oil monthly', 'Never soak or dishwash'],
    story: 'Salvaged from a fallen tree near our workshop, each board tells the story of over 80 years of growth.',
    inStock: true,
    quantity: 10,
  },
  {
    id: '7',
    name: 'Hand-knit Wool Throw',
    description: 'Chunky hand-knit throw blanket in warm neutral tones, perfect for cozy evenings.',
    price: 195,
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
      'https://images.unsplash.com/photo-1536859355448-76f92ebdc33d?w=800',
    ],
    category: 'Textiles',
    tags: ['limited-edition', 'handmade'],
    materials: ['100% merino wool', 'Naturally dyed'],
    dimensions: '150cm x 180cm',
    careInstructions: ['Dry clean recommended', 'Store with cedar', 'Avoid direct heat'],
    story: 'Knit during long winter evenings, each throw takes over 40 hours to complete by hand.',
    inStock: true,
    quantity: 4,
  },
  {
    id: '8',
    name: 'Botanical Print Set',
    description: 'Set of four hand-pressed botanical prints on handmade cotton paper.',
    price: 85,
    images: [
      'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800',
      'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800',
    ],
    category: 'Art',
    tags: ['new', 'handmade'],
    materials: ['Handmade cotton paper', 'Archival pigment', 'Pressed botanicals'],
    dimensions: 'Each: 20cm x 25cm',
    careInstructions: ['Frame behind glass', 'Avoid direct sunlight', 'Handle with clean hands'],
    story: 'Featuring plants foraged from local meadows, each print preserves the fleeting beauty of nature.',
    inStock: true,
    quantity: 20,
  },
];

// Mock Testimonials Data
export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    location: 'Portland, Oregon',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    rating: 5,
    review: "The attention to detail is extraordinary. My woven basket arrived beautifully packaged and the craftsmanship exceeded my expectations. You can truly feel the love that went into making it.",
    productPurchased: 'Woven Terracotta Basket',
    date: '2024-01-15',
  },
  {
    id: '2',
    name: 'James Chen',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 5,
    review: "I've been searching for the perfect centerpiece vase for months. This ceramic moon vase is absolutely stunning - the glaze color is even more beautiful in person.",
    productPurchased: 'Ceramic Moon Vase',
    date: '2024-01-10',
  },
  {
    id: '3',
    name: 'Emma Roberts',
    location: 'Austin, Texas',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    rating: 5,
    review: "The macramé wall hanging transformed my living room. The quality of the cotton and the intricate knotwork shows real artistry. Worth every penny!",
    productPurchased: 'Macramé Wall Hanging',
    date: '2024-01-08',
  },
  {
    id: '4',
    name: 'Michael Thompson',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 5,
    review: "Bought the serving board as a gift - it was a huge hit! The live edge detail and the warmth of the walnut wood make it a true conversation piece.",
    productPurchased: 'Wooden Serving Board',
    date: '2024-01-05',
  },
  {
    id: '5',
    name: 'Olivia Parker',
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    rating: 5,
    review: "These candles smell absolutely divine. The lavender scent is so calming and the burn time is impressive. Already ordered a second set!",
    productPurchased: 'Hand-poured Soy Candles',
    date: '2024-01-02',
  },
  {
    id: '6',
    name: 'David Kim',
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 5,
    review: "The linen table runner elevated our dining room instantly. The natural dye creates such unique subtle colors - truly one of a kind.",
    productPurchased: 'Linen Table Runner',
    date: '2023-12-28',
  },
];

// Categories
export const categories = [
  'All',
  'Home Decor',
  'Ceramics',
  'Textiles',
  'Home Fragrance',
  'Kitchen',
  'Art',
];

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  if (category === 'All') return products;
  return products.filter(p => p.category === category);
}

// Helper function to get featured products
export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.tags?.includes('best-seller')).slice(0, 4);
}

// Helper function to get new arrivals
export function getNewArrivals(): Product[] {
  return products.filter(p => p.tags?.includes('new'));
}

// Helper function to format price in INR
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

