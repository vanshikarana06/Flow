# Google Apps Script Outbound Email Gateway Specification

## 1. Overview
FLOW acts as a **Trust-First Agentic Personal Productivity OS**. To guarantee deliverability, eliminate SMTP credential storage in the cloud, and avoid complex OAuth refresh maintenance for user mailboxes, outbound email execution is delegated to a dedicated Google Apps Script Web App running within the user's Google Workspace/Gmail context.

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│ FLOW Agent  │ ───►  │ FLOW Trust  │ ───►  │  Execution   │
│ (Plan/Draft)│       │  Approval   │       │    Layer     │
└─────────────┘       └─────────────┘       └──────┬───────┘
                                                   │ Signed POST Request
                                                   ▼
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│  Recipient  │ ◄───  │    Gmail    │ ◄───  │ Google Apps  │
│             │       │   Service   │       │Script Web App│
└─────────────┘       └─────────────┘       └──────────────┘
```

---

## 2. Google Apps Script Production Code (`Code.gs`)

```javascript
/**
 * ==============================================================================
 * FLOW OUTBOUND EMAIL GATEWAY — GOOGLE APPS SCRIPT WEB APPLICATION
 * ==============================================================================
 * 
 * Version: 1.0.0 (Production-Ready)
 * Architecture: FLOW Trust Layer -> Google Apps Script -> GmailApp -> Recipient
 */

function doGet(e) {
  return createJsonResponse({
    status: "ONLINE",
    service: "FLOW Outbound Email Gateway",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    provider: "gmail"
  }, 200);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  
  if (!lock.tryLock(15000)) {
    return createJsonResponse({
      success: false,
      error: "Gateway busy: Could not obtain execution lock"
    }, 429);
  }

  try {
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

    // Idempotency cache check (prevents duplicate delivery)
    const cache = CacheService.getScriptCache();
    const cachedResponse = cache.get("idemp_" + idempotencyKey);
    if (cachedResponse) {
      const parsedCached = JSON.parse(cachedResponse);
      parsedCached.replayed = true;
      return createJsonResponse(parsedCached, 200);
    }

    let recipientTo = payload.to;
    if (Array.isArray(recipientTo)) {
      recipientTo = recipientTo.join(", ");
    }

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

    // Atomic Send & Message ID Capture
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

    try {
      cache.put("idemp_" + idempotencyKey, JSON.stringify(responseData), 21600);
    } catch (cacheErr) {
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

function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
```

---

## 3. Step-by-Step Deployment Instructions

1. **Open Google Apps Script**:
   - Go to [script.google.com](https://script.google.com).
   - Click **New project** (e.g., name it `FLOW Outbound Email Gateway`).
2. **Paste Code**:
   - Delete default code in `Code.gs` and paste the script above.
   - Click **Save (Ctrl+S / Cmd+S)**.
3. **Configure Script Properties (Secret Key)**:
   - Click the gear icon (**Project Settings**) in the left sidebar.
   - Scroll down to **Script Properties** and click **Edit script properties**.
   - Click **Add script property**:
     - **Property**: `FLOW_SHARED_SECRET`
     - **Value**: (Generate a strong 32+ character random secret, e.g. `flow_sec_9f83a2c4e1b5d6...`)
   - Click **Save script properties**.
4. **Deploy as Web App**:
   - Click the blue **Deploy** button (top right) $\rightarrow$ **New deployment**.
   - Click the gear icon beside "Select type" $\rightarrow$ choose **Web app**.
   - Set configuration:
     - **Description**: `FLOW Email Gateway v1.0`
     - **Execute as**: **Me (`your-email@gmail.com`)** *(Crucial: allows sending via your mailbox)*
     - **Who has access**: **Anyone** *(Crucial: allows FLOW backend server to reach it)*
   - Click **Deploy**.
   - Authorize Google Permissions when prompted (Click *Advanced* $\rightarrow$ *Go to FLOW Outbound Email Gateway (unsafe)* $\rightarrow$ *Allow*).
   - Copy the generated **Web App URL** (e.g. `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## 4. Required FLOW Environment Variables (`backend/.env`)

Add or update the following variables in your `backend/.env` file:

```env
# Outbound Email Gateway (Google Apps Script)
APPSCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbx.../exec
APPSCRIPT_SECRET_KEY=flow_sec_9f83a2c4e1b5d6...
```

---

## 5. Testing Instructions

### A. Testing Health Check (GET)
```bash
curl -L -X GET "https://script.google.com/macros/s/AKfycbx.../exec"
```
**Expected Response:**
```json
{
  "status": "ONLINE",
  "service": "FLOW Outbound Email Gateway",
  "version": "1.0.0",
  "timestamp": "2026-10-31T02:10:00.000Z",
  "provider": "gmail"
}
```

### B. Testing Email Dispatch (POST)
```bash
curl -L -X POST "https://script.google.com/macros/s/AKfycbx.../exec" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "flow_sec_9f83a2c4e1b5d6...",
    "draft_id": "c0a80101-789a-4bc3-90ef-123456789abc",
    "approval_id": "d1b90202-890b-5cd4-a1fa-234567890def",
    "idempotency_key": "idemp_test_001",
    "to": "test-recipient@example.com",
    "subject": "Verification from FLOW Gateway",
    "body": "This is a verified test dispatch from FLOW Trust OS."
  }'
```
**Expected Response:**
```json
{
  "success": true,
  "gmail_message_id": "18e2a1b3c4d5e6f7",
  "gmail_thread_id": "18e2a1b3c4d5e6f7",
  "draft_id": "c0a80101-789a-4bc3-90ef-123456789abc",
  "approval_id": "d1b90202-890b-5cd4-a1fa-234567890def",
  "idempotency_key": "idemp_test_001",
  "timestamp": "2026-10-31T02:10:05.123Z",
  "provider": "gmail"
}
```

### C. Testing Idempotency Protection
Repeat the exact same `curl` command immediately.
**Expected Response:**
```json
{
  "success": true,
  "gmail_message_id": "18e2a1b3c4d5e6f7",
  "gmail_thread_id": "18e2a1b3c4d5e6f7",
  "draft_id": "c0a80101-789a-4bc3-90ef-123456789abc",
  "approval_id": "d1b90202-890b-5cd4-a1fa-234567890def",
  "idempotency_key": "idemp_test_001",
  "timestamp": "2026-10-31T02:10:05.123Z",
  "provider": "gmail",
  "replayed": true
}
```
*No duplicate email is sent; the previous delivery receipt is returned from cache.*
