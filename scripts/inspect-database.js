const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://byidgbgvnrfhujprzzge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE'
);

async function inspectDatabase() {
  console.log('===============================================');
  console.log('   SUPABASE DATABASE INSPECTION');
  console.log('===============================================\n');

  // 1. Check nlc_accounts
  console.log('TABLE: nlc_accounts');
  console.log('---------------------------------------------\n');
  const { data: accounts, error: accError } = await supabase
    .from('nlc_accounts')
    .select('email, account_role, subscription_plan, subscription_status')
    .order('created_at', { ascending: false });

  if (accError) {
    console.log('Error:', accError.message);
  } else {
    console.log('Total accounts:', accounts.length);
    accounts.forEach(acc => {
      console.log(`  - ${acc.email}`);
      console.log(`    Role: ${acc.account_role}`);
      console.log(`    Plan: ${acc.subscription_plan || 'N/A'}`);
      console.log(`    Status: ${acc.subscription_status || 'N/A'}`);
    });
  }

  // 2. Check nlc_subscription_plans
  console.log('\n\nTABLE: nlc_subscription_plans');
  console.log('---------------------------------------------\n');
  const { data: plans, error: plansError } = await supabase
    .from('nlc_subscription_plans')
    .select('*')
    .order('price', { ascending: true });

  if (plansError) {
    console.log('Error:', plansError.message);
    console.log('Hint: Table might not exist yet');
  } else {
    console.log('Total plans:', plans.length);
    plans.forEach(plan => {
      console.log(`  - ${plan.display_name} (${plan.plan_name})`);
      console.log(`    Price: ${plan.price.toLocaleString()} VND`);
      console.log(`    Duration: ${plan.duration_days} days`);
      console.log(`    Active: ${plan.is_active ? 'YES' : 'NO'}`);
    });
  }

  // 3. Check nlc_user_subscriptions
  console.log('\n\nTABLE: nlc_user_subscriptions');
  console.log('---------------------------------------------\n');
  const { data: subs, error: subsError } = await supabase
    .from('nlc_user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (subsError) {
    console.log('Error:', subsError.message);
  } else {
    console.log('Total subscriptions:', subs.length);
    if (subs.length === 0) {
      console.log('  No subscriptions found');
    } else {
      subs.forEach(sub => {
        console.log(`  - User ID: ${sub.user_id.substring(0, 8)}...`);
        console.log(`    Plan ID: ${sub.plan_id.substring(0, 8)}...`);
        console.log(`    Status: ${sub.status}`);
        console.log(`    Expires: ${sub.expires_at || 'Never'}`);
      });
    }
  }

  // 4. Check nlc_subscription_payments
  console.log('\n\nTABLE: nlc_subscription_payments');
  console.log('---------------------------------------------\n');
  const { data: payments, error: paymentsError } = await supabase
    .from('nlc_subscription_payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (paymentsError) {
    console.log('Error:', paymentsError.message);
  } else {
    console.log('Total payments (showing 5):', payments.length);
    if (payments.length === 0) {
      console.log('  No payments found');
    } else {
      payments.forEach(payment => {
        console.log(`  - ID: ${payment.id.substring(0, 8)}...`);
        console.log(`    Amount: ${payment.amount} ${payment.currency}`);
        console.log(`    Status: ${payment.payment_status}`);
        console.log(`    Method: ${payment.payment_method}`);
      });
    }
  }

  // 5. Check nlc_payment_methods
  console.log('\n\nTABLE: nlc_payment_methods');
  console.log('---------------------------------------------\n');
  const { data: methods, error: methodsError } = await supabase
    .from('nlc_payment_methods')
    .select('*')
    .order('created_at', { ascending: true });

  if (methodsError) {
    console.log('Error:', methodsError.message);
  } else {
    console.log('Total payment methods:', methods.length);
    methods.forEach(method => {
      console.log(`  - ${method.method_name}`);
      console.log(`    Type: ${method.method_type || 'N/A'}`);
      console.log(`    Provider: ${method.provider_name || 'N/A'}`);
      console.log(`    Account: ${method.account_number || 'N/A'}`);
      console.log(`    Active: ${method.is_active ? 'YES' : 'NO'}`);
    });
  }

  console.log('\n===============================================');
  console.log('   INSPECTION COMPLETE');
  console.log('===============================================');
}

inspectDatabase();
