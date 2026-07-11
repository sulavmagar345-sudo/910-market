import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface DashboardSummary {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  totalVisitors: number;
  visitorsGrowth: number;
}

interface ExtendedSummary {
  pendingOrders: number;
  pendingOrdersChange: number;
  todayRevenue: number;
  todayRevenueGrowth: number;
  newCustomersToday: number;
  newCustomersGrowth: number;
  lowStockProducts: number;
  lowStockChange: number;
}

interface RecentActivity {
  id: string;
  type: string;
  icon: string;
  user: string;
  action: string;
  detail?: string;
  amount?: string;
  time: string;
  link?: string;
}

export function generateDashboardReport(
  summary: DashboardSummary,
  extendedSummary: ExtendedSummary,
  recentActivity: RecentActivity[]
) {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header with logo/title
  doc.setFillColor(20, 61, 49); // deep-forest color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('9/10 Market', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Dashboard Report', 20, 32);
  
  // Date on the right
  doc.setFontSize(10);
  const dateText = format(new Date(), 'MMMM dd, yyyy HH:mm');
  doc.text(dateText, pageWidth - 20, 32, { align: 'right' });
  
  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Summary', 20, yPos);
  yPos += 10;

  // KPI Table
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value', 'Growth']],
    body: [
      ['Total Revenue', `$${summary.totalRevenue.toLocaleString()}`, `${summary.revenueGrowth > 0 ? '+' : ''}${summary.revenueGrowth}%`],
      ['Total Orders', summary.totalOrders.toString(), `${summary.ordersGrowth > 0 ? '+' : ''}${summary.ordersGrowth}%`],
      ['Active Customers', summary.totalCustomers.toString(), `${summary.customersGrowth > 0 ? '+' : ''}${summary.customersGrowth}%`],
      ['Conversion Rate', `${summary.conversionRate}%`, `${summary.conversionGrowth > 0 ? '+' : ''}${summary.conversionGrowth}%`],
      ['Average Order Value', `$${summary.averageOrderValue.toLocaleString()}`, `${summary.aovGrowth > 0 ? '+' : ''}${summary.aovGrowth}%`],
      ['Total Visitors', summary.totalVisitors.toString(), `${summary.visitorsGrowth > 0 ? '+' : ''}${summary.visitorsGrowth}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [20, 61, 49], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Additional Metrics
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Operations', 20, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Count', 'Change']],
    body: [
      ['Pending Orders', extendedSummary.pendingOrders.toString(), `${extendedSummary.pendingOrdersChange > 0 ? '+' : ''}${extendedSummary.pendingOrdersChange}%`],
      ['Low Stock Products', extendedSummary.lowStockProducts.toString(), `${extendedSummary.lowStockChange > 0 ? '+' : ''}${extendedSummary.lowStockChange}%`],
      ['New Customers Today', extendedSummary.newCustomersToday.toString(), `${extendedSummary.newCustomersGrowth > 0 ? '+' : ''}${extendedSummary.newCustomersGrowth}%`],
      ['Today Revenue', `$${extendedSummary.todayRevenue.toLocaleString()}`, `${extendedSummary.todayRevenueGrowth > 0 ? '+' : ''}${extendedSummary.todayRevenueGrowth}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [20, 61, 49], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Recent Activity
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Recent Activity', 20, yPos);
  yPos += 10;

  const activityData = recentActivity.slice(0, 10).map((activity) => [
    activity.time,
    activity.user,
    activity.action,
    activity.amount || '-',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'User', 'Action', 'Amount']],
    body: activityData,
    theme: 'striped',
    headStyles: { fillColor: [20, 61, 49], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 30 },
    },
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      '© 2024 9/10 Market - Confidential',
      20,
      pageHeight - 10
    );
  }

  // Save the PDF
  const filename = `9-10-Market-Report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(filename);
}
