const fs = require('fs');

const files = [
  'src/admin/pages/categories/CategoriesPage.tsx',
  'src/admin/pages/brands/BrandsPage.tsx',
  'src/admin/pages/reviews/ReviewsPage.tsx',
  'src/admin/pages/coupons/CouponsPage.tsx',
  'src/admin/pages/delivery/DeliveryPage.tsx',
  'src/admin/pages/analytics/AnalyticsPage.tsx',
  'src/admin/pages/reports/ReportsPage.tsx',
  'src/admin/components/dashboard/ActivityFeed.tsx',
  'src/admin/components/dashboard/RevenueChart.tsx',
  'src/admin/components/layout/Breadcrumbs.tsx',
  'src/admin/components/layout/Sidebar.tsx',
  'src/admin/components/layout/TopBar.tsx',
  'src/admin/components/orders/OrdersTable.tsx',
  'src/admin/components/products/ProductForm.tsx',
  'src/admin/components/products/ProductsTable.tsx',
  'src/admin/layouts/AdminLayout.tsx',
  'src/admin/pages/dashboard/DashboardPage.tsx',
  'src/admin/pages/orders/OrderDetailPage.tsx',
  'src/admin/pages/products/ProductFormPage.tsx',
  'src/admin/pages/settings/SettingsPage.tsx',
  'src/admin/routes/index.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Remove unused React imports
    content = content.replace(/import React from 'react';\r?\n/g, '');
    content = content.replace(/import React,\s*\{([^}]+)\}\s*from\s*'react';/g, 'import {$1} from \'react\';');
    content = content.replace(/import\s*\{([^}]+)\}\s*from\s*'react';/g, (match, p1) => {
      const parts = p1.split(',').map(x => x.trim()).filter(x => x !== 'React');
      if (parts.length === 0) return '';
      return `import { ${parts.join(', ')} } from 'react';`;
    });
    
    // Specifically remove User unused from TopBar.tsx
    if (file.endsWith('TopBar.tsx')) {
      content = content.replace(/import\s*\{\s*Bell,\s*Search,\s*User\s*\}\s*from\s*'lucide-react';/g, "import { Bell, Search } from 'lucide-react';");
    }

    fs.writeFileSync(file, content);
  }
});

console.log('Fixed unused React imports');
