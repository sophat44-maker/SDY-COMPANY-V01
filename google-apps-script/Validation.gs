/**
 * Validation.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Input sanitization, XSS prevention, schema validation and security filters
 */

var Validation = {
  /**
   * Sanitize text against XSS
   */
  sanitizeText: function(input) {
    if (typeof input !== "string") return input;
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  /**
   * Validate Email format
   */
  isEmail: function(email) {
    var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  },

  /**
   * Validate Product Schema
   */
  validateProduct: function(data) {
    var errors = [];
    if (!data.Name && !data.Title) errors.push("Product Name/Title is required.");
    if (data.Price !== undefined && isNaN(Number(data.Price))) errors.push("Price must be a valid number.");
    return errors;
  },

  /**
   * Validate User Schema
   */
  validateUser: function(data) {
    var errors = [];
    if (!data.Email || !Validation.isEmail(data.Email)) errors.push("Valid Email address is required.");
    if (!data.Name) errors.push("User Name is required.");
    return errors;
  },

  /**
   * Sanitize entire payload object recursively
   */
  sanitizePayload: function(obj) {
    if (!obj || typeof obj !== "object") return obj;
    var sanitized = Array.isArray(obj) ? [] : {};
    for (var key in obj) {
      if (typeof obj[key] === "string") {
        sanitized[key] = Validation.sanitizeText(obj[key]);
      } else if (typeof obj[key] === "object") {
        sanitized[key] = Validation.sanitizePayload(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
};
