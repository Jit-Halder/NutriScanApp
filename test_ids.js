const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const ids = [
  'product-name', 'product-brand', 'result-barcode', 'product-image',
  'nutri-letter', 'nutri-desc', 'nutri-reason', 'nova-section', 'nova-number',
  'nova-desc', 'nova-reason', 'ingredients-section', 'ingredients-list',
  'additives-container', 'additives-list', 'nutri-energy', 'nutri-protein',
  'nutri-carbs', 'nutri-sugars', 'nutri-fat', 'nutri-satfat', 'nutri-fiber',
  'nutri-sodium', 'macro-sugar-card', 'macro-satfat-card', 'macro-sodium-card'
];
ids.forEach(id => {
  if (!html.includes('id="' + id + '"')) {
    console.log('Missing ID:', id);
  }
});
