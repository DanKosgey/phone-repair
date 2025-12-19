/**
 * Simple test script to verify network utilities
 */

async function testNetworkUtils() {
  console.log('Testing network utilities...');
  
  try {
    // Import and test network connectivity check
    const { checkNetworkConnectivity } = await import('./utils/networkUtils');
    
    console.log('Checking network connectivity...');
    const isConnected = await checkNetworkConnectivity();
    console.log('Network connected:', isConnected);
    
    if (isConnected) {
      console.log('✓ Network connectivity check passed');
    } else {
      console.log('⚠ Network connectivity check failed - no internet access');
    }
    
    console.log('Test completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testNetworkUtils();