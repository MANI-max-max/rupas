import { Product, DirectOrder, AdSpendRecord, AdBanner } from '../types';

export const ExportService = {
  /**
   * Generates and downloads a clean CSV file (Excel-ready)
   */
  exportToCSV(filename: string, rows: (string | number)[][]): void {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportProductsCSV(products: Product[]): void {
    const headers = [
      'Product ID',
      'Title',
      'Platform',
      'Category',
      'Original Price (INR)',
      'Deal Price (INR)',
      'Discount (%)',
      'Coupon Code',
      'Clicks Count',
      'Cart Count',
      'Purchase Count',
      'Rating',
      'In Stock',
      'Affiliate URL',
      'Created Date'
    ];

    const rows = products.map(p => [
      p.id,
      p.title,
      p.platform.toUpperCase(),
      p.category,
      p.originalPrice,
      p.dealPrice,
      `${p.discountPercentage}%`,
      p.couponCode || 'N/A',
      p.clicksCount,
      p.cartCount,
      p.purchaseCount,
      p.rating,
      p.inStock ? 'YES' : 'NO',
      p.affiliateUrl,
      p.createdAt
    ]);

    this.exportToCSV('dealhub_products_catalog', [headers, ...rows]);
  },

  exportOrdersCSV(orders: DirectOrder[]): void {
    const headers = [
      'Order ID',
      'Customer Name',
      'Phone',
      'Email',
      'City',
      'Items Count',
      'Total Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Tracking Number',
      'Courier Name',
      'Order Date'
    ];

    const rows = orders.map(o => [
      o.id,
      o.customerName,
      o.phone,
      o.email,
      o.city,
      o.items.reduce((acc, i) => acc + i.quantity, 0),
      o.totalAmount,
      o.paymentMethod.toUpperCase(),
      o.paymentStatus.toUpperCase(),
      o.orderStatus.toUpperCase(),
      o.trackingNumber,
      o.courierName || 'N/A',
      o.createdAt
    ]);

    this.exportToCSV('dealhub_orders_report', [headers, ...rows]);
  },

  exportAdSpendCSV(spends: AdSpendRecord[]): void {
    const headers = [
      'Record ID',
      'Ad Platform',
      'Campaign Name',
      'Amount Spent (INR)',
      'Clicks Generated',
      'Conversions',
      'Revenue Generated (INR)',
      'ROAS (x)',
      'Campaign Date',
      'Notes'
    ];

    const rows = spends.map(s => {
      const roas = s.amountSpent > 0 ? (s.revenueGenerated / s.amountSpent).toFixed(2) : '0.00';
      return [
        s.id,
        s.platform.toUpperCase(),
        s.campaignName,
        s.amountSpent,
        s.clicksGenerated,
        s.conversions,
        s.revenueGenerated,
        `${roas}x`,
        s.date,
        s.notes || ''
      ];
    });

    this.exportToCSV('dealhub_ad_spend_analytics', [headers, ...rows]);
  },

  /**
   * Opens a pristine print-ready report in a dedicated printable view or window
   */
  exportToPDF(
    title: string,
    summaryStats: { label: string; value: string }[],
    tableHeaders: string[],
    tableRows: (string | number)[][]
  ): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download or print the PDF report.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - Rupas.Shop Executive Report</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            padding: 24px;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .tagline {
            font-size: 12px;
            color: #64748b;
          }
          .date {
            font-size: 12px;
            color: #64748b;
            text-align: right;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 28px;
          }
          .stat-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            background: #f8fafc;
          }
          .stat-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          .stat-value {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
            font-variant-numeric: tabular-nums;
          }
          h2 {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 24px;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 600;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            color: #1e293b;
            font-variant-numeric: tabular-nums;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .footer {
            margin-top: 40px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Rupas.Shop · Executive Report</div>
            <div class="tagline">Affiliate Marketing, Ad Spend & Sales Analytics</div>
          </div>
          <div class="date">
            Generated: ${new Date().toLocaleString()}<br>
            Format: Verified PDF Export
          </div>
        </div>

        <div class="stats-grid">
          ${summaryStats.map(s => `
            <div class="stat-card">
              <div class="stat-label">${s.label}</div>
              <div class="stat-value">${s.value}</div>
            </div>
          `).join('')}
        </div>

        <h2>${title}</h2>
        <table>
          <thead>
            <tr>
              ${tableHeaders.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Rupas.Shop Affiliate & E-Commerce Control Center · Confidential & Proprietary Report
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
};
