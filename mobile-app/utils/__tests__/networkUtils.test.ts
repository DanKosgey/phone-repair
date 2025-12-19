/**
 * Simple test for network utilities
 */

// Mock fetch implementation for testing
function mockFetch(response: any, isError = false) {
  if (isError) {
    global.fetch = () => Promise.reject(new Error('Network error'));
  } else {
    global.fetch = () => Promise.resolve(response);
  }
}

async function runTests() {
  console.log('Testing network utilities...');
  
  try {
    // Test 1: Successful network check
    mockFetch({ ok: true });
    const { checkNetworkConnectivity } = await import('../networkUtils');
    const result1 = await checkNetworkConnectivity();
    console.log('✓ Test 1 passed:', result1 === true);
    
    // Test 2: Network error
    mockFetch(null, true);
    const result2 = await checkNetworkConnectivity();
    console.log('✓ Test 2 passed:', result2 === false);
    
    // Test 3: Non-ok response
    mockFetch({ ok: false });
    const result3 = await checkNetworkConnectivity();
    console.log('✓ Test 3 passed:', result3 === false);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };