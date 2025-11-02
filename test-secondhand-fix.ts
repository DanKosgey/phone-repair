import { productsDb } from './src/lib/db/products.ts';

async function testSecondHandProductCreation() {
  try {
    console.log('Testing second-hand product creation...');
    
    // First, let's check if we have any "Second-hand Item" products
    const searchResults = await productsDb.search("Second-hand Item");
    console.log('Existing "Second-hand Item" products:', searchResults);
    
    // If no "Second-hand Item" product exists, create one
    if (searchResults && searchResults.length > 0 && searchResults[0]) {
      console.log('Using existing "Second-hand Item" product:', searchResults[0].id);
    } else {
      console.log('Creating new "Second-hand Item" product...');
      const createdProduct = await productsDb.create({
        name: "Second-hand Item",
        description: "Generic product for second-hand listings",
        price: 0,
        stock_quantity: 999,
        image_url: "",
        is_featured: false,
        category: "Second-hand",
        slug: "second-hand-item"
      });
      console.log('Created new "Second-hand Item" product:', createdProduct.id);
    }
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSecondHandProductCreation();