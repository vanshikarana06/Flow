/**
 * ==============================================================================
 * FLOW OUTBOUND EMAIL GATEWAY — GOOGLE APPS SCRIPT WEB APPLICATION
 * ==============================================================================
 * 
 * Version: 1.0.0 (Production-Ready)
 * Architecture: FLOW Trust Layer -> Google Apps Script -> GmailApp -> Recipient
 * 
 * Capabilities:
 * - HMAC/Shared Secret Authentication
 * - Idempotency Lock via ScriptCache (Prevents duplicate sends)
 * - Atomic Draft -> Send via GmailApp (Guarantees Gmail Message ID capture)
 * - Structured JSON ContentService output
 */

/**
 * Health check endpoint for testing and uptime verification.
 */
function doGet(e) {
  const healthCheck = {
    status: "ONLINE",
    service: "FLOW Outbound Email Gateway",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    provider: "gmail"
  };
  return createJsonResponse(healthCheck, 200);
}

/**
 * Main Webhook Receiver handling authenticated email dispatches from FLOW.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  
  // 1. Acquire mutex lock (up to 15 seconds) to prevent race conditions
  if (!lock.tryLock(15000)) {
    return createJsonResponse({
      success: false,
      error: "Gateway busy: Could not obtain execution lock"
    }, 429);
  }

  try {
    // 2. Validate Request Content
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: "Missing request body: Payload must be JSON"
      }, 400);
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        success: false,
        error: "Invalid JSON format: " + parseErr.message
      }, 400);
    }

    // 3. Verify Shared Secret
    const scriptProperties = PropertiesService.getScriptProperties();
    const expectedSecret = scriptProperties.getProperty("FLOW_SHARED_SECRET");

    if (!expectedSecret) {
      return createJsonResponse({
        success: false,
        error: "Server configuration error: FLOW_SHARED_SECRET not set in Script Properties"
      }, 500);
    }

    const providedSecret = payload.secret || (e.parameter && e.parameter.secret);
    if (!providedSecret || providedSecret !== expectedSecret) {
      return createJsonResponse({
        success: false,
        error: "Unauthorized: Invalid or missing shared secret"
      }, 401);
    }

    // 4. Validate Required Fields
    const requiredFields = ["to", "subject", "body"];
    for (var i = 0; i < requiredFields.length; i++) {
      var field = requiredFields[i];
      if (!payload[field] || String(payload[field]).trim() === "") {
        return createJsonResponse({
          success: false,
          error: "Validation error: Missing required field '" + field + "'"
        }, 422);
      }
    }

    const idempotencyKey = payload.idempotency_key || payload.draft_id || "default_key";

    // 5. Check Idempotency Cache (Prevent duplicate execution)
    const cache = CacheService.getScriptCache();
    const cachedResponse = cache.get("idemp_" + idempotencyKey);
    if (cachedResponse) {
      const parsedCached = JSON.parse(cachedResponse);
      parsedCached.replayed = true;
      return createJsonResponse(parsedCached, 200);
    }

    // 6. Format Recipient(s)
    let recipientTo = payload.to;
    if (Array.isArray(recipientTo)) {
      recipientTo = recipientTo.join(", ");
    }

    // 7. Prepare Mail Options
    const mailOptions = {
      name: "FLOW Assistant"
    };

    if (payload.htmlBody || payload.body_html) {
      mailOptions.htmlBody = payload.htmlBody || payload.body_html;
    }
    if (payload.cc) {
      mailOptions.cc = Array.isArray(payload.cc) ? payload.cc.join(", ") : payload.cc;
    }
    if (payload.bcc) {
      mailOptions.bcc = Array.isArray(payload.bcc) ? payload.bcc.join(", ") : payload.bcc;
    }

    // 8. Atomic Send & Tracking ID Capture
    // Using createDraft().send() guarantees returning the GmailMessage object
    const draft = GmailApp.createDraft(
      recipientTo,
      payload.subject,
      payload.body,
      mailOptions
    );
    const sentMessage = draft.send();
    const gmailMessageId = sentMessage.getId();
    const gmailThreadId = sentMessage.getThread().getId();
    const executionTimestamp = new Date().toISOString();

    // 9. Construct Response
    const responseData = {
      success: true,
      gmail_message_id: gmailMessageId,
      gmail_thread_id: gmailThreadId,
      draft_id: payload.draft_id || null,
      approval_id: payload.approval_id || null,
      idempotency_key: idempotencyKey,
      timestamp: executionTimestamp,
      provider: "gmail"
    };

    // 10. Cache Success Response for Idempotency (6 hour TTL = 21600 seconds)
    try {
      cache.put("idemp_" + idempotencyKey, JSON.stringify(responseData), 21600);
    } catch (cacheErr) {
      // Non-fatal if cache put fails
      console.warn("Could not cache idempotency key: " + cacheErr.message);
    }

    return createJsonResponse(responseData, 200);

  } catch (err) {
    console.error("FLOW Email Gateway Execution Error: " + err.toString());
    return createJsonResponse({
      success: false,
      error: err.toString(),
      timestamp: new Date().toISOString()
    }, 500);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to serialize data as standard application/json ContentOutput.
 */
function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

