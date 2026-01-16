import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_data, // { user_id, items, total_amount, shipping_address, coupon_id, gift_card_id }
    } = body;

    // 1. Verify Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Razorpay not configured' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // 2. Create order in database using service role (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Call checkout_order RPC
    const { data: orderResult, error: orderError } = await supabase.rpc(
      'checkout_order',
      {
        p_user_id: order_data.user_id,
        p_items: order_data.items,
        p_total_amount: order_data.total_amount,
        p_shipping_address: order_data.shipping_address,
        p_coupon_id: order_data.coupon_id || null,
        p_gift_card_id: order_data.gift_card_id || null,
      }
    );

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message || 'Failed to create order' },
        { status: 500 }
      );
    }

    // 4. Update order with Razorpay payment details
    const orderId = orderResult?.order_id;
    if (orderId) {
      await supabase
        .from('orders')
        .update({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status: 'confirmed', // Payment successful
        })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      generated_cards: orderResult?.generated_cards || [],
      message: 'Payment verified and order created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
