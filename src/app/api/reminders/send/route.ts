import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { resend } from "@/lib/email";

/**
 * Send pending court reminders
 * This endpoint should be called by a cron job or scheduled task
 * Checks for reminders due to be sent and sends email notifications
 */
export async function POST(req: NextRequest) {
  // Verify this is an internal request (from cron job)
  // In production, add authentication/authorization here
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.REMINDERS_CRON_SECRET;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find all pending reminders due within the next hour
    const { data: reminders, error: fetchError } = await supabase
      .from("court_reminders")
      .select("*")
      .eq("status", "pending")
      .gte("reminder_date", now.toISOString())
      .lte("reminder_date", oneHourFromNow.toISOString());

    if (fetchError) {
      console.error("Error fetching reminders:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch reminders",
        },
        { status: 500 }
      );
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No reminders to send",
        count: 0,
      });
    }

    // Send reminders
    const results: Array<{ id: number; success: boolean; error?: string }> = [];

    for (const reminder of reminders) {
      try {
        // Send reminder email
        if (!resend) {
          results.push({
            id: reminder.id,
            success: false,
            error: "Email service not configured",
          });
          continue;
        }

        const { error: emailError } = await resend.emails.send({
          from: "Custody Clarity <reminders@custodyclarity.com>",
          to: reminder.email,
          subject: `Reminder: ${reminder.summary}`,
          html: generateReminderEmailHTML(reminder),
        });

        if (emailError) {
          // Mark as failed
          await supabase
            .from("court_reminders")
            .update({
              status: "failed",
            })
            .eq("id", reminder.id);

          results.push({
            id: reminder.id,
            success: false,
            error: emailError.message,
          });
        } else {
          // Mark as sent
          await supabase
            .from("court_reminders")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", reminder.id);

          results.push({
            id: reminder.id,
            success: true,
          });
        }
      } catch (error) {
        // Mark as failed
        await supabase
          .from("court_reminders")
          .update({
            status: "failed",
          })
          .eq("id", reminder.id);

        results.push({
          id: reminder.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Processed ${reminders.length} reminders`,
      sent: successCount,
      failed: failureCount,
      results,
    });
  } catch (error) {
    console.error("Error in send reminders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML email template for court reminder
 */
function generateReminderEmailHTML(reminder: {
  summary: string;
  description?: string | null;
  reminder_date: string;
}): string {
  const reminderDate = new Date(reminder.reminder_date);
  const formattedDate = reminderDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Court Filing Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Court Filing Reminder</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea; margin-top: 0;">${reminder.summary}</h2>

    <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>📅 Scheduled Date:</strong> ${formattedDate}</p>
      ${reminder.description ? `<p style="margin: 10px 0 0 0;">${reminder.description}</p>` : ""}
    </div>

    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>💡 Don't forget:</strong> Make sure you have all necessary documents prepared and ready for your court filing.
    </div>

    <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 5px;">
      <h3 style="color: #667eea; margin-top: 0;">Need Help?</h3>
      <ul style="list-style: none; padding: 0;">
        <li>📧 Email: support@custodyclarity.com</li>
        <li>🌐 Visit: <a href="https://custodyclarity.com" style="color: #667eea;">custodyclarity.com</a></li>
        <li>📚 FAQ: <a href="https://custodyclarity.com/faq" style="color: #667eea;">View common questions</a></li>
      </ul>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center;">
      This is an automated reminder from Custody Clarity.<br>
      You scheduled this reminder to help you stay on track with your court filing.
    </p>

    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
      © ${new Date().getFullYear()} Custody Clarity. All rights reserved.
    </p>
  </div>
</body>
</html>
  `.trim();
}
