const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](.*\/types)['"]/g, 'import type { $1 } from \'$2\'');
  
  if (file.endsWith('constants/index.ts') || file.includes('constants\\\\index.ts')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](\.\.\/types)['"]/g, 'import type { $1 } from \'$2\'');
  }

  fs.writeFileSync(file, content);
}

const filesToFix = [
  'src/admin/components/orders/OrdersTable.tsx',
  'src/admin/components/products/ProductsTable.tsx',
  'src/admin/constants/index.ts',
  'src/admin/data/mock-customers.ts',
  'src/admin/data/mock-dashboard.ts',
  'src/admin/data/mock-inventory.ts',
  'src/admin/data/mock-orders.ts',
  'src/admin/data/mock-products.ts',
  'src/admin/stores/customers.store.ts',
  'src/admin/stores/dashboard.store.ts',
  'src/admin/stores/inventory.store.ts',
  'src/admin/stores/orders.store.ts',
  'src/admin/stores/products.store.ts'
];

filesToFix.forEach(f => {
  if (fs.existsSync(f)) {
    fixFile(f);
  }
});
console.log('Fixed imports');
