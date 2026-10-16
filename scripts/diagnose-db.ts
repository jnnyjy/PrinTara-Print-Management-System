/**
 * Diagnostic script to test database insert and check for triggers
 * Run with: npx tsx scripts/diagnose-db.ts
 */

import { createAdminClient } from '../lib/supabase/admin'

async function diagnose() {
  console.log('🔍 Starting database diagnostics...\n')
  
  const supabase = createAdminClient()
  
  // Test 1: Check current PENDING requests
  console.log('📊 Test 1: Counting PENDING requests...')
  const { data: pendingCount, error: countError } = await supabase
    .from('job_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')
  
  if (countError) {
    console.error('❌ Count failed:', countError)
  } else {
    console.log('✅ Current PENDING requests:', pendingCount)
  }
  
  // Test 2: Insert a test record
  console.log('\n📝 Test 2: Inserting test record...')
  const testId = crypto.randomUUID()
  const testCode = `PRT-9999`
  
  const { data: insertData, error: insertError } = await supabase
    .from('job_requests')
    .insert({
      id: testId,
      quantity: 1,
      paper_size: 'A4',
      color_mode: 'color',
      notes: 'DIAGNOSTIC TEST - SAFE TO DELETE',
      order_code: testCode,
      status: 'PENDING',
    })
    .select()
  
  if (insertError) {
    console.error('❌ Insert failed:', insertError)
    return
  }
  console.log('✅ Insert succeeded:', insertData)
  
  // Test 3: Immediate verification (like submit action does)
  console.log('\n🔎 Test 3: Immediate verification query...')
  await new Promise(resolve => setTimeout(resolve, 100)) // tiny delay
  
  const { data: verifyData, error: verifyError } = await supabase
    .from('job_requests')
    .select('id, order_code, status, created_at')
    .eq('id', testId)
    .single()
  
  if (verifyError) {
    console.error('❌ VERIFICATION FAILED - RECORD NOT FOUND!')
    console.error('Error:', verifyError)
    console.log('\n🚨 This indicates a database trigger might be deleting the record!')
  } else {
    console.log('✅ Verification succeeded:', verifyData)
  }
  
  // Test 4: Wait 1 second and check again
  console.log('\n⏱️  Test 4: Waiting 1 second and checking again...')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const { data: delayedCheck, error: delayedError } = await supabase
    .from('job_requests')
    .select('id, order_code, status, created_at')
    .eq('id', testId)
    .single()
  
  if (delayedError) {
    console.error('❌ Record still not found after 1 second')
    console.log('🚨 CONCLUSION: Database trigger is likely deleting PENDING records')
  } else {
    console.log('✅ Record still exists:', delayedCheck)
  }
  
  // Test 5: Manual trigger check instruction
  console.log('\n🔧 Test 5: Check for triggers manually...')
  console.log('⚠️  Go to Supabase Dashboard → Database → Triggers')
  console.log('⚠️  Look for any triggers on the "job_requests" table')
  console.log('⚠️  Particularly check for AFTER INSERT or BEFORE INSERT triggers')
  
  // Cleanup: Delete test record if it exists
  console.log('\n🧹 Cleanup: Deleting test record...')
  const { error: deleteError } = await supabase
    .from('job_requests')
    .delete()
    .eq('id', testId)
  
  if (deleteError) {
    console.log('⚠️  Could not delete test record:', deleteError)
  } else {
    console.log('✅ Test record deleted')
  }
  
  console.log('\n✨ Diagnostics complete!')
}

diagnose().catch(console.error)
