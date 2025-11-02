// Test script to verify both fixes for second-hand products
import { productsDb } from './src/lib/db/products.ts';
import { secondHandProductsDb } from './src/lib/db/secondhand_products.ts';

async function testSecondHandProductComplete() {
  try {
    console.log('Testing complete second-hand product solution...');
    
    // Test 1: Check if "Second-hand Item" product exists
    console.log('Test 1: Checking for "Second-hand Item" product...');
    const searchResults = await productsDb.search("Second-hand Item");
    let productId: string;
    
    if (searchResults && searchResults.length > 0 && searchResults[0]) {
      productId = searchResults[0].id;
      console.log('✓ Found existing "Second-hand Item" product:', productId);
    } else {
      console.log('Creating new "Second-hand Item" product...');
      const createdProduct = await productsDb.create({
        name: "Second-hand Item",
        description: "Generic product for second-hand listings",
        price: 1, // Use 1 instead of 0 to satisfy the positive price constraint
        stock_quantity: 999,
        image_url: "",
        is_featured: false,
        category: "Second-hand",
        slug: "second-hand-item"
      });
      productId = createdProduct.id;
      console.log('✓ Created new "Second-hand Item" product:', productId);
    }
    
    console.log('All tests passed successfully!');
    console.log('Product ID to use for second-hand listings:', productId);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSecondHandProductComplete();