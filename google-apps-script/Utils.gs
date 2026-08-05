/**
 * Utils.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Helper utilities for formatting, CORS, hashing, HMAC SHA-256 JWT, formula escaping, Excel/CSV conversion
 */

/**
 * Get configured secret key from Script Properties or fallback
 */
function getSecretKey() {
  var key = PropertiesService.getScriptProperties().getProperty("JWT_SECRET");
  if (key && key.trim()) return key;
  return CONFIG.SECRET_KEY;
}

/**
 * Prevent Google Sheets Formula Injection Attacks
 * Escapes leading =, +, -, @, \t, \r characters
 */
function escapeFormula(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") {
    var trimmed = val.trim();
    if (/^[=+\-@\t\r]/.test(trimmed)) {
      return "'" + val; // Prepend single quote to force literal string
    }
  }
  return val;
}

/**
 * Format Standard Success Response
 */
function responseSuccess(data, message, total, page, pages, code) {
  var statusCode = code || 200;
  var payload = {
    success: true,
    message: message || "Operation completed successfully.",
    data: data || [],
    total: typeof total === "number" ? total : (Array.isArray(data) ? data.length : 1),
    page: page || 1,
    pages: pages || 1,
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Format Standard Error Response
 */
function responseError(message, code, details) {
  var statusCode = code || 500;
  var payload = {
    success: false,
    message: message || "Internal Server Error",
    code: statusCode,
    details: details || null,
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Generate UUID for primary keys
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * Hash string using SHA-256
 */
function hashSHA256(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(input));
  var txtHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byte = rawHash[i];
    if (byte < 0) byte += 256;
    var byteStr = byte.toString(16);
    if (byteStr.length == 1) byteStr = '0' + byteStr;
    txtHash += byteStr;
  }
  return txtHash;
}

/**
 * Compute HMAC SHA-256 Signature using Google Apps Script Utilities
 */
function computeHmacSha256(data, secret) {
  var signature = Utilities.computeHmacSha256Signature(data, secret);
  return base64UrlEncodeBytes(signature);
}

/**
 * Base64URL Encode string
 */
function base64UrlEncode(str) {
  return Utilities.base64EncodeWebSafe(str).replace(/=+$/, '');
}

/**
 * Base64URL Encode byte array
 */
function base64UrlEncodeBytes(bytes) {
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

/**
 * Base64URL Decode to string
 */
function base64UrlDecode(str) {
  var padding = '='.repeat((4 - str.length % 4) % 4);
  var base64 = (str + padding).replace(/\-/g, '+').replace(/_/g, '/');
  return Utilities.newBlob(Utilities.base64Decode(base64)).getDataAsString();
}

/**
 * Create Real HMAC SHA-256 JWT Token
 */
function generateJWT(payload) {
  var header = { alg: "HS256", typ: "JWT" };
  var exp = new Date().getTime() + (CONFIG.JWT_EXPIRATION_HOURS * 3600 * 1000);
  payload.exp = exp;
  
  var encodedHeader = base64UrlEncode(JSON.stringify(header));
  var encodedPayload = base64UrlEncode(JSON.stringify(payload));
  var message = encodedHeader + "." + encodedPayload;
  var signature = computeHmacSha256(message, getSecretKey());
  
  return message + "." + signature;
}

/**
 * Verify HMAC SHA-256 JWT Token
 */
function verifyJWT(token) {
  if (!token) return null;
  var parts = token.split(".");
  if (parts.length !== 3) return null;
  
  var message = parts[0] + "." + parts[1];
  var expectedSig = computeHmacSha256(message, getSecretKey());
  if (parts[2] !== expectedSig) return null;
  
  try {
    var payload = JSON.parse(base64UrlDecode(parts[1]));
    if (payload.exp && new Date().getTime() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}
