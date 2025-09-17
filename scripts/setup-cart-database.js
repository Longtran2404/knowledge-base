#!/usr/bin/env node

/**
 * Setup Cart Database Schema
 * Chạy script này để setup database cho chức năng giỏ hàng
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCartDatabase() {
  console.log('🛒 Setting up Cart Database Schema...');
  console.log('=====================================');

  try {
    // Read cart schema
    const cartSchemaPath = path.join(__dirname, '..', 'database', 'cart-schema.sql');
    const cartSchema = fs.readFileSync(cartSchemaPath, 'utf8');

    console.log('📄 Executing cart schema...');
    
    // Execute cart schema
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: cartSchema 
    });

    if (error) {
      console.error('❌ Error executing cart schema:', error);
      return;
    }

    console.log('✅ Cart schema executed successfully!');

    // Test cart functions
    console.log('\n🧪 Testing cart functions...');
    
    // Test get_cart_total function
    const { data: totalData, error: totalError } = await supabase
      .rpc('get_cart_total', { user_uuid: '00000000-0000-0000-0000-000000000000' });
    
    if (totalError) {
      console.error('❌ Error testing get_cart_total:', totalError);
    } else {
      console.log('✅ get_cart_total function working:', totalData);
    }

    // Test get_cart_count function
    const { data: countData, error: countError } = await supabase
      .rpc('get_cart_count', { user_uuid: '00000000-0000-0000-0000-000000000000' });
    
    if (countError) {
      console.error('❌ Error testing get_cart_count:', countError);
    } else {
      console.log('✅ get_cart_count function working:', countData);
    }

    // Check if tables exist
    console.log('\n📊 Checking tables...');
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (productsError) {
      console.error('❌ Products table not accessible:', productsError);
    } else {
      console.log('✅ Products table accessible');
    }

    const { data: cartItems, error: cartItemsError } = await supabase
      .from('cart_items')
      .select('count')
      .limit(1);

    if (cartItemsError) {
      console.error('❌ Cart_items table not accessible:', cartItemsError);
    } else {
      console.log('✅ Cart_items table accessible');
    }

    console.log('\n🎉 Cart database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the cart functionality in your app');
    console.log('2. Add some products to test with');
    console.log('3. Test adding items to cart');
    console.log('4. Test cart persistence across sessions');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run setup
setupCartDatabase();
