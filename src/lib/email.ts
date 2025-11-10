import { Resend } from "resend";

// Resend API key is optional - gracefully handle if not set
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendPDFEmailParams {
  to: string;
  documentType: string;
  pdfBuffer: Buffer;
  fileName: string;
  tier: string;
}

/**
 * Send PDF document via email
 */
export async function sendPDFEmail({
  to,
  documentType,
  pdfBuffer,
  fileName,
  tier,
}: SendPDFEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return {
      success: false,
      error: "Email service not configured. Please add RESEND_API_KEY to environment variables.",
    };
  }

  try {
    const { error } = await resend.emails.send({
      from: "Custody Clarity <documents@custodyclarity.com>",
      to: [to],
      subject: `Your ${documentType} Document from Custody Clarity`,
      html: generateEmailHTML(documentType, tier),
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate email HTML template
 */
function generateEmailHTML(documentType: string, tier: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${documentType} Document</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Custody Clarity</h1>
    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">Your document is ready</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea; margin-top: 0;">Thank you for your purchase!</h2>

    <p>Your <strong>${documentType}</strong> document (${tier} tier) has been generated and is attached to this email.</p>

    <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #667eea;">What's Next?</h3>
      <ol style="padding-left: 20px;">
        <li>Review the attached PDF carefully</li>
        <li>Fill in any remaining personal details</li>
        <li>Print and sign the document if required</li>
        <li>Submit to the appropriate authority (see document for details)</li>
      </ol>
    </div>

    ${
      tier === "attorney"
        ? `
    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>⚖️ Legal Notice:</strong> This document provides general information only and is not legal advice.
      We recommend consulting with a qualified family law attorney for your specific situation.
    </div>
    `
        : ""
    }

    <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 5px;">
      <h3 style="color: #667eea; margin-top: 0;">Need Help?</h3>
      <ul style="list-style: none; padding: 0;">
        <li>📧 Email: support@custodyclarity.com</li>
        <li>🌐 Visit: <a href="https://custodyclarity.com" style="color: #667eea;">custodyclarity.com</a></li>
        <li>📚 FAQ: <a href="https://custodyclarity.com/faq" style="color: #667eea;">View common questions</a></li>
      </ul>
      ${tier === "attorney" ? `<p><strong>Priority Support:</strong> We'll respond within 24 hours.</p>` : ""}
      ${tier === "professional" ? `<p><strong>Email Support:</strong> We'll respond within 48 hours.</p>` : ""}
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center;">
      This email was sent because you purchased a document from Custody Clarity.<br>
      Having issues? Reply to this email and we'll help you out.
    </p>

    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
      © ${new Date().getFullYear()} Custody Clarity. All rights reserved.<br>
      Helping families understand custody rights in Germany.
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send order confirmation email (without PDF)
 */
export async function sendOrderConfirmation({
  to,
  orderId,
  amount,
  tier,
}: {
  to: string;
  orderId: string;
  amount: number;
  tier: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: "Custody Clarity <orders@custodyclarity.com>",
      to: [to],
      subject: "Order Confirmation - Custody Clarity",
      html: `
        <h1>Thank you for your order!</h1>
        <p>Order ID: ${orderId}</p>
        <p>Amount: €${(amount / 100).toFixed(2)}</p>
        <p>Tier: ${tier}</p>
        <p>Your document is being generated and will be sent to you shortly.</p>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
