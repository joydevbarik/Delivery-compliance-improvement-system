import nodemailer from 'nodemailer';

/**
 * Sends a sales order confirmation and delivery compliance report email to the logged-in operator.
 * Supports real SMTP transport if configured in environment variables, otherwise logs the formatted email details.
 * 
 * @param {string} userEmail - Recipient email address
 * @param {string} userName - Name of the operator
 * @param {object} order - Mongoose Order document or object
 * @param {object} compliance - Mongoose DeliveryCompliance document or object
 */
export const sendOrderConfirmationEmail = async (userEmail, userName, order, compliance) => {
  if (!userEmail) {
    console.warn(`⚠️ No registered email for user "${userName}". Order confirmation email could not be sent.`);
    return { success: false, message: 'No email address registered for user' };
  }

  try {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;
    let transporter;

    if (hasSmtpConfig) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for others
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // JSON transport for local testing (returns the message details without requiring network SMTP)
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }

    const deliveryDate = compliance.expectedDeliveryDate
      ? new Date(compliance.expectedDeliveryDate).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'long', year: 'numeric'
        })
      : 'N/A';

    const isFullyComplied = compliance.status === 'Fully Complied';
    const statusColor = isFullyComplied ? '#10b981' : '#ef4444';

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Tata Steel Orders" <orders@tatasteel.com>',
      to: userEmail,
      subject: `Order Confirmation & Compliance Audit: ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 20px; border-radius: 6px 6px 0 0; color: #ffffff; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">TATA STEEL</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">Delivery Compliance Management System</p>
          </div>
          
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #1e293b;">Dear <strong>${userName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
              We are pleased to confirm that the customer sales order has been registered successfully. The automatic compliance audit engine has processed this order instantly.
            </p>
            
            <div style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <div style="background-color: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 14px; color: #1e293b;">Order Details</h3>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold; width: 40%;">Order ID</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${order.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Customer ID</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${order.customerId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Product Code</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${order.productCode}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; color: #64748b; font-weight: bold;">Demand Quantity</td>
                  <td style="padding: 10px 15px; color: #2563eb; font-weight: bold;">${order.demandQuantity} Metric Tons</td>
                </tr>
              </table>
            </div>

            <div style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <div style="background-color: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 14px; color: #1e293b;">Compliance Audit Report</h3>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold; width: 40%;">Status</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: ${statusColor}; font-weight: bold;">${compliance.status}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Yard Availability</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${compliance.availableQuantity} Tons</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Complied Quantity</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #10b981; font-weight: bold;">${compliance.compliedQty} Tons</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Shortage/Delay Qty</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; color: #ef4444; font-weight: bold;">${compliance.delayQty} Tons</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; color: #64748b; font-weight: bold;">Expected Delivery</td>
                  <td style="padding: 10px 15px; color: #2563eb; font-weight: bold;">${deliveryDate}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 11px; color: #475569; margin-top: 15px;">
              <strong>Plant Guideline Note:</strong><br/>
              ${isFullyComplied 
                ? '• Full stock available. Delivery scheduled within 2 business days of order registration.'
                : '• Partial stock available. Delivery delayed by up to 5 business days pending material resupply.'}
            </div>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px;">
            <p>© 2026 Tata Steel Limited. All rights reserved.</p>
            <p>This is an automated system confirmation email. Please do not reply directly to this message.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (hasSmtpConfig) {
      console.log(`✉️ Real Email sent successfully: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('\n=================== ✉️ SYSTEM EMAIL SIMULATOR ===================');
      console.log(`TO: ${mailOptions.to} (${userName})`);
      console.log(`FROM: ${mailOptions.from}`);
      console.log(`SUBJECT: ${mailOptions.subject}`);
      console.log('HTML CONTENT PREVIEW:');
      console.log(`  - Order: ${order.orderId} for Customer ${order.customerId}`);
      console.log(`  - Product: ${order.productCode}, Demand Quantity: ${order.demandQuantity} Tons`);
      console.log(`  - Compliance Audit: ${compliance.status}`);
      console.log(`  - Expected Delivery Date: ${deliveryDate}`);
      console.log('=================================================================\n');
      return { success: true, mock: true };
    }
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    return { success: false, error: error.message };
  }
};
