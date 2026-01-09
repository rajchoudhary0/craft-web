// Supabase Database Types
// Auto-generated types for type-safety

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          role: 'customer' | 'admin'
          created_at: string
          gender: 'male' | 'female' | 'other' | null
          date_of_birth: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
          gender?: 'male' | 'female' | 'other' | null
          date_of_birth?: string | null
        }
        Update: {
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin'
          gender?: 'male' | 'female' | 'other' | null
          date_of_birth?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string | null
          description: string | null
          price: number
          original_price: number | null
          stock: number
          category_id: string | null
          is_featured: boolean
          is_new: boolean
          is_active: boolean
          rating: number
          reviews_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          description?: string | null
          price: number
          original_price?: number | null
          stock?: number
          category_id?: string | null
          is_featured?: boolean
          is_new?: boolean
          is_active?: boolean
        }
        Update: {
          name?: string
          slug?: string | null
          description?: string | null
          price?: number
          original_price?: number | null
          stock?: number
          category_id?: string | null
          is_featured?: boolean
          is_new?: boolean
          is_active?: boolean
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          sort_order?: number
        }
        Update: {
          image_url?: string
          sort_order?: number
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          name?: string
        }
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: never
      }
      carts: {
        Row: {
          id: string
          user_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
        }
        Update: never
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          payment_intent_id: string | null
          stripe_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          price_at_purchase: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          price_at_purchase: number
        }
        Update: never
      }
      shipping_addresses: {
        Row: {
          id: string
          order_id: string
          full_name: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          full_name: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          phone?: string | null
        }
        Update: never
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          title: string | null
          comment: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          title?: string | null
          comment?: string | null
          is_approved?: boolean
        }
        Update: {
          title?: string | null
          comment?: string | null
          is_approved?: boolean
        }
      }
      site_content: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
        }
        Update: {
          value?: Json
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          is_active?: boolean
        }
        Update: {
          is_active?: boolean
        }
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          full_name?: string
          phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string | null
          is_default?: boolean
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Cart = Database['public']['Tables']['carts']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type ShippingAddress = Database['public']['Tables']['shipping_addresses']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type SiteContent = Database['public']['Tables']['site_content']['Row']

// Extended types for joins
export type ProductWithImages = Product & {
  images: ProductImage[]
  category: Category | null
  tags: Tag[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product | null })[]
  shipping_address: ShippingAddress | null
}

export type CartItemWithProduct = CartItem & {
  product: Product & { images: ProductImage[] }
}
