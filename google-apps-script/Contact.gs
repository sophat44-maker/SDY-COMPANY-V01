/**
 * Contact Form Submissions Handlers
 */

/**
 * Saves a visitor contact message to the sheet ContactMessages.
 * Automatically appends the timestamp, inquiry ID, and sets the default status to 'Pending'.
 */
function saveContactMessage(messageForm) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("ContactMessages");
    if (!sheet) {
      initDatabase();
      sheet = ss.getSheetByName("ContactMessages");
    }
    
    var inquiryId = "inq_" + generateUUID();
    var timestampStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" });
    
    var dataRow = {
      "id": inquiryId,
      "date": timestampStr,
      "name": messageForm.name || "",
      "email": messageForm.email || "",
      "phone": messageForm.phone || "",
      "company": messageForm.company || "N/A",
      "subject": messageForm.subject || "General Inquiry",
      "message": messageForm.message || "",
      "status": "New"
    };
    
    writeRow("ContactMessages", dataRow);
    
    // Optionally trigger slack / email alert if desired
    try {
      sendInboundNotificationEmail(dataRow);
    } catch(err) {
      Logger.log("Email notification skipped: " + err.toString());
    }
    
    return {
      "status": "success",
      "id": inquiryId,
      "message": "Thank you! Your engineering inquiry has been received. Our team will contact you shortly."
    };
  } catch (error) {
    Logger.log("Error saving contact message: " + error.toString());
    return {
      "status": "error",
      "message": "Database write error: " + error.toString()
    };
  }
}

/**
 * Sends a premium HTML email alert to the site administrator when a new message is saved.
 */
function sendInboundNotificationEmail(dataRow) {
  var companyName = DEFAULT_COMPANY_INFO.CompanyName;
  var recipient = Session.getActiveUser().getEmail();
  
  if (!recipient || recipient === "") {
    return;
  }
  
  var subject = "⚠️ [NEW PORTAL INQUIRY] " + dataRow.name + " - " + dataRow.subject;
  
  var htmlBody = 
    "<div style='font-family:Inter, Arial, sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #E4E4E7; border-radius:16px; color:#18181B;'>" +
      "<div style='background-color:#101828; padding:20px; border-radius:12px; text-align:center; color:#FFFFFF;'>" +
        "<h2 style='margin:0; font-size:20px; tracking-wider:0.05em;'>" + companyName + " C&I</h2>" +
        "<p style='margin:4px 0 0 0; font-size:12px; color:#94A3B8;'>Real-time Inbound Contact Submission</p>" +
      "</div>" +
      
      "<h3 style='font-size:16px; margin-top:24px; border-bottom:1px solid #F4F4F5; padding-bottom:8px;'>Lead Details Summary</h3>" +
      "<table style='width:100%; font-size:13px; line-height:1.6; border-collapse:collapse;'>" +
        "<tr><td style='font-weight:bold; width:130px; padding:6px 0;'>Inquiry ID:</td><td>" + dataRow.id + "</td></tr>" +
        "<tr><td style='font-weight:bold; padding:6px 0;'>Timestamp:</td><td>" + dataRow.date + "</td></tr>" +
        "<tr><td style='font-weight:bold; padding:6px 0;'>Client Name:</td><td>" + dataRow.name + "</td></tr>" +
        "<tr><td style='font-weight:bold; padding:6px 0;'>Company:</td><td>" + dataRow.company + "</td></tr>" +
        "<tr><td style='font-weight:bold; padding:6px 0;'>Phone Number:</td><td>" + dataRow.phone + "</td></tr>" +
        "<tr><td style='font-weight:bold; padding:6px 0;'>Email Address:</td><td>" + dataRow.email + "</td></tr>" +
        "<tr><td style='font-weight:bold; padding:6px 0;'>Subject Area:</td><td><span style='color:#1E88E5; font-weight:bold;'>" + dataRow.subject + "</span></td></tr>" +
      "</table>" +
      
      "<h3 style='font-size:16px; margin-top:24px; border-bottom:1px solid #F4F4F5; padding-bottom:8px;'>Message Content</h3>" +
      "<p style='font-size:13px; line-height:1.5; font-style:italic; background-color:#F8FAFC; padding:16px; border-radius:12px; border:1px solid #E2E8F0;'>" + 
        "\"" + dataRow.message + "\"" + 
      "</p>" +
      
      "<div style='margin-top:32px; text-align:center;'>" +
        "<a href='" + getSpreadsheet().getUrl() + "' style='background-color:#1E88E5; color:#FFFFFF; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:13px; font-weight:bold; display:inline-block;'>Access Admin Console Spreadsheet</a>" +
      "</div>" +
      
      "<p style='font-size:10px; color:#A1A1AA; text-align:center; margin-top:40px;'>This is an automated operational notification generated secure-side by " + companyName + " Web App.</p>" +
    "</div>";
             
  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: htmlBody
  });
}
