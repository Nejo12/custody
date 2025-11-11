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
 * Netlify Scheduled Function for Court Reminders
 *
 * This function is triggered by Netlify's cron scheduler every hour.
 * It calls the internal API endpoint to process and send pending court reminders.
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

  try {
    // Call the internal API endpoint with authentication
    const apiUrl = `${appUrl}/api/reminders/send`;

    // eslint-disable-next-line no-console
    console.log("Calling API endpoint:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    // Parse the response
    const data: SendRemindersResponse = await response.json();

    // Check if the API call was successful
    if (!response.ok) {
      console.error("API call failed:", response.status, data);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          success: false,
          error: data.error || "Failed to send reminders",
        }),
      };
    }

    // Log success details
    // eslint-disable-next-line no-console
    console.log("Reminders processed successfully:", {
      sent: data.sent || 0,
      failed: data.failed || 0,
      total: (data.sent || 0) + (data.failed || 0),
    });

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: data.message,
        sent: data.sent || 0,
        failed: data.failed || 0,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    // Handle any errors during the API call
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
