// Simple test to check feature toggle settings
console.log('Checking feature toggle settings...');

// This would normally be run in the browser console
// For now, let's just show what the expected structure should be:

const defaultFeatureSettings = {
  enableSecondHandProducts: true,
  enableTracking: true,
  enableShop: true
};

console.log('Default feature settings:', defaultFeatureSettings);

// To test in browser, you would run:
// console.log(localStorage.getItem('featureSettings'));

// To set a feature to false, you would run:
// localStorage.setItem('featureSettings', JSON.stringify({enableSecondHandProducts: true, enableTracking: true, enableShop: false}));

console.log('To test feature toggle:');
console.log('1. Open browser dev tools');
console.log('2. Go to Application/Storage tab');
console.log('3. Find localStorage for this site');
console.log('4. Modify the featureSettings item to disable features');