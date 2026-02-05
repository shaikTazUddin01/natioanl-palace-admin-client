import { TSaleRow } from "../types";

export const generateInvoiceNo = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SAL-${y}${m}${day}-${rand}`;
};



export const openInvoice = (row: TSaleRow) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Invoice ${row.invoiceNo}</title>
      <style>
        /* Simplified styles for clarity */
        body { font-family: Arial, sans-serif; padding: 30px; background: #f5f6fa; }
        .invoice { max-width: 800px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table th, table td { padding: 10px; border: 1px solid #e5e7eb; text-align: left; }
        .summary { display: flex; justify-content: flex-end; margin-top: 20px; }
        .summary table { width: 300px; }
        .status { padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #fff; }
        .paid { background: #22c55e; }
        .due { background: #ef4444; }
        .print-btn { text-align: center; margin-top: 20px; }
        .print-btn button { background: #390dff; color: #fff; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; }
        @media print { .print-btn { display: none; } }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="company">
            <h2>National Palace</h2>
            <p>Dhaka, Bangladesh</p>
            <p>Phone: 01XXXXXXXXX</p>
          </div>
          <div class="invoice-info">
            <p><strong>Invoice:</strong> ${row.invoiceNo}</p>
            <p><strong>Date:</strong> ${row.date}</p>
            <span class="status ${row.dueAmount > 0 ? "due" : "paid"}">
              ${row.dueAmount > 0 ? "DUE" : "PAID"}
            </span>
          </div>
        </div>
        <div class="section bill-to">
          <h4>Bill To</h4>
          <p><strong>${row.customerName}</strong></p>
        </div>
        <div class="section">
          <h4>Product Details</h4>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
            <tbody>
              <tr>
                <td>${row.productName}</td>
                <td>${row.quantity}</td>
                <td>৳ ${row.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="summary">
          <table>
            <tr><td>Total</td><td>৳ ${row.totalAmount.toLocaleString()}</td></tr>
            <tr><td>Paid</td><td>৳ ${row.paidAmount.toLocaleString()}</td></tr>
            <tr><td>Due</td><td>৳ ${row.dueAmount.toLocaleString()}</td></tr>
          </table>
        </div>
        <div class="footer">Thank you for your business 🙏</div>
        <div class="print-btn"><button onclick="window.print()">Print Invoice</button></div>
      </div>
    </body>
  </html>`;
  
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
};
