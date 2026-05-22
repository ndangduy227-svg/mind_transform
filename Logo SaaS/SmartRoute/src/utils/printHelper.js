import { branding } from './branding';

export const printCluster = (cluster, shipper) => {
    const printWindow = window.open('', '_blank');

    const ordersHtml = cluster.orders.map((order, index) => `
    <tr class="border-b">
      <td class="py-2 px-2">${index + 1}</td>
      <td class="py-2 px-2 font-bold">${order.name}</td>
      <td class="py-2 px-2">${order.phone}</td>
      <td class="py-2 px-2">${order.address}</td>
      <td class="py-2 px-2 text-right">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.cod)}</td>
      <td class="py-2 px-2 text-sm text-gray-500">${order.note || ''}</td>
    </tr>
  `).join('');

    const totalShipCost = cluster.baseCost + (cluster.extraCost || 0);
    const receivable = cluster.totalCOD - totalShipCost;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print - ${cluster.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px; color: #1a202c; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .logo { height: 50px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-card { background: #f7fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .label { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .value { font-weight: bold; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; background: #edf2f7; padding: 10px; font-size: 12px; text-transform: uppercase; color: #4a5568; }
        .footer { display: flex; justify-content: flex-end; margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
        .summary { text-align: right; }
        .summary-row { display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px; }
        .total { font-size: 20px; color: #2d3748; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          ${branding.smartRoute_full}
        </div>
        <div style="text-align: right;">
          <h1 style="margin: 0; font-size: 24px;">Delivery Manifest</h1>
          <p style="margin: 5px 0 0; color: #718096;">${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="label">Cluster Info</div>
          <div class="value" style="color: #5B67C9;">${cluster.name}</div>
          <div style="margin-top: 5px;">${cluster.orders.length} Orders • ${cluster.totalKm} km</div>
        </div>
        <div class="info-card">
          <div class="label">Shipper Details</div>
          <div class="value">${shipper ? shipper.name : 'Unassigned'}</div>
          <div style="margin-top: 5px;">${shipper ? `${shipper.phone} • ${shipper.license}` : 'Please assign a shipper'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th width="5%">#</th>
            <th width="20%">Customer</th>
            <th width="15%">Phone</th>
            <th width="30%">Address</th>
            <th width="15%" style="text-align: right;">COD</th>
            <th width="15%">Note</th>
          </tr>
        </thead>
        <tbody>
          ${ordersHtml}
        </tbody>
      </table>

      <div class="footer">
        <div class="summary">
          <div class="summary-row">
            <span style="color: #718096;">Total COD:</span>
            <span style="font-weight: bold;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cluster.totalCOD)}</span>
          </div>
          <div class="summary-row">
            <span style="color: #718096;">Shipping Cost:</span>
            <span style="font-weight: bold; color: #e53e3e;">-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalShipCost)}</span>
          </div>
          <div class="summary-row total">
            <span style="color: #718096;">Receivable:</span>
            <span style="font-weight: 800; color: #2DE1C2;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(receivable)}</span>
          </div>
        </div>
      </div>
      
      <script>
        window.onload = () => { window.print(); }
      </script>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();
};
