import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

/**
 * Response from the send reminders API endpoint
 */
interface SendRemindersResponse {
  success: boolean;
  message: string;
  count?: number;
  sent?: number;
  failed?: number;
  results?: Array<{
    id: number;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}

/**
 * Netlify Scheduled Function for Reminders
 *
 * This function is triggered by Netlify's cron scheduler every hour.
 * It calls the internal API endpoints to process and send pending reminders
 * for both court reminders and planning reminders.
 *
 * Schedule: Every hour at minute 0 (configured in netlify.toml)
 *
 * @param event - Netlify function event object
 * @param context - Netlify function context object
 * @returns Handler response with status and details
 */
const handler: Handler = async (
  _event: HandlerEvent,
  _context: HandlerContext
): Promise<HandlerResponse> => {
  // Log the execution for debugging
  // eslint-disable-next-line no-console
  console.log("Scheduled function triggered:", new Date().toISOString());

  // Get the application URL from environment
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "https://custodyclarity.com";

  // Get the cron secret from environment
  const cronSecret = process.env.REMINDERS_CRON_SECRET;

  // Validate that the secret is configured
  if (!cronSecret) {
    console.error("REMINDERS_CRON_SECRET is not configured");
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Cron secret not configured",
      }),
    };
  }

  const results: {
    courtReminders: SendRemindersResponse | null;
    planningReminders: SendRemindersResponse | null;
    errors: string[];
  } = {
    courtReminders: null,
    planningReminders: null,
    errors: [],
  };

  try {
    // Call court reminders endpoint
    const courtApiUrl = `${appUrl}/api/reminders/send`;
    // eslint-disable-next-line no-console
    console.log("Calling court reminders API endpoint:", courtApiUrl);

    try {
      const courtResponse = await fetch(courtApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
      });

      const courtData: SendRemindersResponse = await courtResponse.json();

      if (!courtResponse.ok) {
        results.errors.push(`Court reminders: ${courtData.error || "Failed to send reminders"}`);
      } else {
        results.courtReminders = courtData;
        // eslint-disable-next-line no-console
        console.log("Court reminders processed:", {
          sent: courtData.sent || 0,
          failed: courtData.failed || 0,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`Court reminders: ${errorMessage}`);
      console.error("Error calling court reminders API:", errorMessage);
    }

    // Call planning reminders endpoint
    const planningApiUrl = `${appUrl}/api/planning/reminders/send`;
    // eslint-disable-next-line no-console
    console.log("Calling planning reminders API endpoint:", planningApiUrl);

    try {
      const planningResponse = await fetch(planningApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
      });

      const planningData: SendRemindersResponse = await planningResponse.json();

      if (!planningResponse.ok) {
        results.errors.push(
          `Planning reminders: ${planningData.error || "Failed to send reminders"}`
        );
      } else {
        results.planningReminders = planningData;
        // eslint-disable-next-line no-console
        console.log("Planning reminders processed:", {
          sent: planningData.sent || 0,
          failed: planningData.failed || 0,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`Planning reminders: ${errorMessage}`);
      console.error("Error calling planning reminders API:", errorMessage);
    }

    // Calculate totals
    const totalSent = (results.courtReminders?.sent || 0) + (results.planningReminders?.sent || 0);
    const totalFailed =
      (results.courtReminders?.failed || 0) + (results.planningReminders?.failed || 0);

    // Return combined results
    return {
      statusCode: results.errors.length > 0 ? 207 : 200, // 207 = Multi-Status (partial success)
      body: JSON.stringify({
        success: results.errors.length === 0,
        message: `Processed reminders: ${totalSent} sent, ${totalFailed} failed`,
        courtReminders: {
          sent: results.courtReminders?.sent || 0,
          failed: results.courtReminders?.failed || 0,
        },
        planningReminders: {
          sent: results.planningReminders?.sent || 0,
          failed: results.planningReminders?.failed || 0,
        },
        total: {
          sent: totalSent,
          failed: totalFailed,
        },
        errors: results.errors.length > 0 ? results.errors : undefined,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    // Handle any unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    console.error("Error in scheduled function:", errorMessage);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

export { handler };
