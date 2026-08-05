/**
 * Administrative Operations & Content Management Services
 * 
 * Secure Admin Console with multi-table CRUD, role sessions, automatic logging,
 * email alerts, and analytical aggregations for the Real-Time Sheets Dashboard.
 */

/**
 * Validates session token server-side before execution of sensitive actions.
 * Extends session validity by 30 mins upon successful request validation.
 */
function verifySession(sessionToken) {
  if (!sessionToken || sessionToken === "") return false;
  try {
    var props = PropertiesService.getScriptProperties();
    var sessionData = props.getProperty("session_" + sessionToken);
    if (!sessionData) return false;
    
    var parts = sessionData.split("_");
    var expiry = parseInt(parts[0], 10);
    
    if (new Date().getTime() > expiry) {
      props.deleteProperty("session_" + sessionToken); // Clean up stale property
      return false;
    }
    
    // Extend session expiry
    var newExpiry = new Date().getTime() + (30 * 60 * 1000);
    props.setProperty("session_" + sessionToken, newExpiry + "_admin");
    return true;
  } catch (e) {
    Logger.log("Session verification exception: " + e.toString());
    return false;
  }
}

/**
 * Verifies admin credentials and creates a secure session property.
 * Default password is 'admin123' if not yet defined in Script Properties.
 */
function adminLogin(password) {
  try {
    var props = PropertiesService.getScriptProperties();
    var storedPassword = props.getProperty("admin_password");
    if (!storedPassword || storedPassword === "") {
      storedPassword = "admin123";
      props.setProperty("admin_password", storedPassword);
    }
    
    if (password === storedPassword) {
      var token = Utilities.getUuid();
      var expiry = new Date().getTime() + (30 * 60 * 1000); // 30 mins expiration
      props.setProperty("session_" + token, expiry + "_admin");
      
      logActivity("LOGIN_SUCCESS", "Administrator console accessed", "admin");
      return { status: "success", token: token, message: "Authorization granted. Welcome back!" };
    } else {
      logActivity("LOGIN_FAILURE", "Unauthorized login attempt with incorrect credentials", "visitor");
      return { status: "error", message: "Invalid administrator password. Access denied." };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Explicitly terminates an active admin session.
 */
function adminLogout(sessionToken) {
  try {
    if (sessionToken) {
      var props = PropertiesService.getScriptProperties();
      props.deleteProperty("session_" + sessionToken);
      logActivity("LOGOUT", "Admin session invalidated", "admin");
    }
    return { status: "success", message: "Logged out. Session cleared." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Changes the admin password securely in ScriptProperties.
 */
function changeAdminPassword(sessionToken, oldPassword, newPassword) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Invalid session." };
  }
  try {
    var props = PropertiesService.getScriptProperties();
    var storedPassword = props.getProperty("admin_password") || "admin123";
    
    if (oldPassword !== storedPassword) {
      return { status: "error", message: "Current password does not match database record." };
    }
    
    if (!newPassword || newPassword.trim().length < 4) {
      return { status: "error", message: "New password must be at least 4 characters long." };
    }
    
    props.setProperty("admin_password", newPassword.trim());
    logActivity("PASSWORD_CHANGE", "Admin access credentials updated", "admin");
    return { status: "success", message: "Admin password changed successfully." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Flat key-value dictionary extraction from the CompanyInfo worksheet.
 */
function getCompanyInfo() {
  try {
    var rawInfo = readTable("CompanyInfo");
    var info = {};
    
    for (var key in DEFAULT_COMPANY_INFO) {
      info[key] = DEFAULT_COMPANY_INFO[key];
    }
    
    if (rawInfo && rawInfo.length > 0) {
      rawInfo.forEach(function(row) {
        if (row.Key && row.Key !== "") {
          info[row.Key] = row.Value;
        }
      });
    }
    
    return info;
  } catch (e) {
    Logger.log("Error loading company info: " + e.toString());
    return DEFAULT_COMPANY_INFO;
  }
}

/**
 * Flat key-value updates written back into the CompanyInfo worksheet.
 */
function updateCompanyInfo(sessionToken, companyInfoObject) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Unauthorized: Invalid or expired session." };
  }
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("CompanyInfo");
    if (!sheet) {
      initDatabase();
      sheet = ss.getSheetByName("CompanyInfo");
    }
    
    sheet.clearContents();
    sheet.appendRow(["Key", "Value"]);
    
    for (var key in companyInfoObject) {
      sheet.appendRow([key, sanitizeInput(String(companyInfoObject[key]))]);
    }
    
    var headerRange = sheet.getRange(1, 1, 1, 2);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#E0F2FE");
    
    clearSheetCache("CompanyInfo");
    logActivity("UPDATE_SETTINGS", "Updated company profile attributes", "admin");
    return { status: "success", message: "Company profile updated successfully!" };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Fetches the entire administrative datasets, aggregations, and charts metrics.
 * Gated completely by secure token authentication.
 */
function getAdminData(sessionToken) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Unauthorized. Please log in first." };
  }
  
  try {
    var inquiries = readTable("ContactMessages");
    var products = readTable("Products");
    var projects = readTable("Projects");
    var blogs = readTable("Blog");
    var quotations = readTable("Quotations");
    var logs = readTable("ActivityLogs");
    var companyInfo = getCompanyInfo();
    var categories = readTable("Categories");
    var translations = readTable("Translations");
    var files = readTable("Files");
    
    // Process Analytics & Aggregations
    var analytics = calculateAnalytics(inquiries, products, projects, quotations);
    
    return {
      status: "success",
      inquiries: inquiries.reverse(), // Newest logs first
      quotations: quotations.reverse(),
      products: products,
      projects: projects,
      blogs: blogs,
      logs: logs.reverse().slice(0, 100), // Max 100 recent entries for dashboard
      companyInfo: companyInfo,
      analytics: analytics,
      productsCount: products.length,
      projectsCount: projects.length,
      quotationsCount: quotations.length,
      categories: categories,
      translations: translations,
      files: files
    };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Aggregates database columns for real-time charts on the Admin Console.
 */
function calculateAnalytics(inquiries, products, projects, quotations) {
  var metrics = {
    totalLeads: inquiries.length,
    pendingLeads: 0,
    contactedLeads: 0,
    completedLeads: 0,
    totalQuotationValue: quotations.length,
    productCategoryDistribution: {},
    projectCategoryDistribution: {},
    monthlyLeadTrends: { "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0 }
  };
  
  // Calculate Inquiry Statuses
  inquiries.forEach(function(inq) {
    var status = inq.status || "Pending";
    if (status === "Pending") metrics.pendingLeads++;
    else if (status === "Contacted") metrics.contactedLeads++;
    else if (status === "Completed") metrics.completedLeads++;
    
    // Process Date trends (format usually "M/D/YYYY, h:mm:ss AM/PM")
    try {
      if (inq.date) {
        var dateStr = String(inq.date);
        var monthIdx = dateStr.indexOf("/");
        if (monthIdx !== -1) {
          var monthNum = parseInt(dateStr.substring(0, monthIdx), 10);
          var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          if (monthNum >= 1 && monthNum <= 12) {
            metrics.monthlyLeadTrends[months[monthNum - 1]]++;
          }
        }
      }
    } catch(err) {}
  });
  
  // Products categories
  products.forEach(function(prod) {
    var cat = prod.category || "General";
    metrics.productCategoryDistribution[cat] = (metrics.productCategoryDistribution[cat] || 0) + 1;
  });
  
  // Projects categories
  projects.forEach(function(proj) {
    var cat = proj.category || "General";
    metrics.projectCategoryDistribution[cat] = (metrics.projectCategoryDistribution[cat] || 0) + 1;
  });
  
  return metrics;
}

/**
 * Multi-tab Inquiry logs controller
 */
function updateMessageStatus(sessionToken, targetId, newStatus) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Access denied." };
  }
  try {
    var updated = updateRow("ContactMessages", "id", targetId, { "status": newStatus });
    if (updated) {
      logActivity("INQUIRY_STATUS_CHANGE", "Modified status of inquiry " + targetId + " to " + newStatus, "admin");
      return { status: "success", message: "Inquiry status updated successfully." };
    }
    return { status: "error", message: "Inquiry ID not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function deleteMessage(sessionToken, targetId) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Access denied." };
  }
  try {
    var deleted = deleteRow("ContactMessages", "id", targetId);
    if (deleted) {
      logActivity("INQUIRY_DELETE", "Deleted inquiry record " + targetId, "admin");
      return { status: "success", message: "Inquiry deleted permanently." };
    }
    return { status: "error", message: "Inquiry ID not found in database." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * ==================== PRODUCTS CRUD ====================
 */
function saveProduct(sessionToken, productObj) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var isNew = !productObj.id || productObj.id === "";
    
    // Sanitize input texts
    var payload = {
      id: isNew ? generateSequentialID("Products", "PRD") : productObj.id,
      name: sanitizeInput(productObj.name),
      category: sanitizeInput(productObj.category),
      image: productObj.image,
      gallery: Array.isArray(productObj.gallery) ? productObj.gallery.join(",") : productObj.gallery,
      description: sanitizeInput(productObj.description),
      specification: sanitizeInput(productObj.specification || ""),
      material: sanitizeInput(productObj.material || ""),
      size: sanitizeInput(productObj.size || ""),
      pdfUrl: productObj.pdfUrl || "#"
    };
    
    var success = false;
    if (isNew) {
      success = writeRow("Products", payload);
      logActivity("PRODUCT_CREATE", "Created new catalog product: " + payload.name + " (" + payload.id + ")", "admin");
    } else {
      success = updateRow("Products", "id", payload.id, payload);
      logActivity("PRODUCT_UPDATE", "Updated product attributes for: " + payload.name + " (" + payload.id + ")", "admin");
    }
    
    if (success) {
      return { status: "success", message: "Product record saved successfully!", id: payload.id };
    } else {
      return { status: "error", message: "Spreadsheet transaction failed." };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function removeProduct(sessionToken, productId) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    // 1. Cascading cleanup of related files in "Files" sheet and on Drive
    try {
      var filesRows = readTable("Files");
      filesRows.forEach(function(row) {
        var refId = row.referenceId || row.ReferenceID || row.referenceID || "";
        if (String(refId) === String(productId)) {
          deleteRow("Files", "id", row.id);
          var fileId = row.fileId || row.FileID || "";
          if (fileId) {
            try { DriveApp.getFileById(fileId).setTrashed(true); } catch(err) {}
          }
        }
      });
    } catch(err) {
      Logger.log("Cascade Files clean skipped: " + err.toString());
    }

    // 2. Cascading cleanup of related gallery entries in "Gallery" sheet and on Drive
    try {
      var galleryRows = readTable("Gallery");
      galleryRows.forEach(function(row) {
        var refId = row.referenceId || row.ReferenceID || row.referenceID || row.productId || "";
        if (String(refId) === String(productId)) {
          deleteRow("Gallery", "id", row.id);
          var fileId = row.googleDriveFileId || row.FileID || row.fileId || "";
          if (fileId) {
            try { DriveApp.getFileById(fileId).setTrashed(true); } catch(err) {}
          }
        }
      });
    } catch(err) {
      Logger.log("Cascade Gallery clean skipped: " + err.toString());
    }

    // 3. Delete the product itself
    var success = deleteRow("Products", "id", productId);
    if (success) {
      logActivity("PRODUCT_DELETE", "Deleted product ID: " + productId + " and performed cascading asset cleanup", "admin");
      return { status: "success", message: "Product and related assets removed from database catalog." };
    }
    return { status: "error", message: "Product ID not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * ==================== PROJECTS CRUD ====================
 */
function saveProject(sessionToken, projectObj) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var isNew = !projectObj.id || projectObj.id === "";
    
    var payload = {
      id: isNew ? generateSequentialID("Projects", "PRJ") : projectObj.id,
      title: sanitizeInput(projectObj.title),
      category: sanitizeInput(projectObj.category),
      coverImage: projectObj.coverImage,
      gallery: Array.isArray(projectObj.gallery) ? projectObj.gallery.join(",") : projectObj.gallery,
      location: sanitizeInput(projectObj.location || ""),
      area: sanitizeInput(projectObj.area || ""),
      completionYear: sanitizeInput(projectObj.completionYear || ""),
      description: sanitizeInput(projectObj.description),
      constructionType: sanitizeInput(projectObj.constructionType || "")
    };
    
    var success = false;
    if (isNew) {
      success = writeRow("Projects", payload);
      logActivity("PROJECT_CREATE", "Created project showcase entry: " + payload.title + " (" + payload.id + ")", "admin");
    } else {
      success = updateRow("Projects", "id", payload.id, payload);
      logActivity("PROJECT_UPDATE", "Updated showcase project: " + payload.title + " (" + payload.id + ")", "admin");
    }
    
    if (success) {
      return { status: "success", message: "Project details saved successfully!", id: payload.id };
    } else {
      return { status: "error", message: "Spreadsheet transaction failed." };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function removeProject(sessionToken, projectId) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    // 1. Cascading cleanup of related files in "Files" sheet and on Drive
    try {
      var filesRows = readTable("Files");
      filesRows.forEach(function(row) {
        var refId = row.referenceId || row.ReferenceID || row.referenceID || "";
        if (String(refId) === String(projectId)) {
          deleteRow("Files", "id", row.id);
          var fileId = row.fileId || row.FileID || "";
          if (fileId) {
            try { DriveApp.getFileById(fileId).setTrashed(true); } catch(err) {}
          }
        }
      });
    } catch(err) {
      Logger.log("Cascade Files clean skipped: " + err.toString());
    }

    // 2. Cascading cleanup of related gallery entries in "Gallery" sheet and on Drive
    try {
      var galleryRows = readTable("Gallery");
      galleryRows.forEach(function(row) {
        var refId = row.referenceId || row.ReferenceID || row.referenceID || row.projectId || "";
        if (String(refId) === String(projectId)) {
          deleteRow("Gallery", "id", row.id);
          var fileId = row.googleDriveFileId || row.FileID || row.fileId || "";
          if (fileId) {
            try { DriveApp.getFileById(fileId).setTrashed(true); } catch(err) {}
          }
        }
      });
    } catch(err) {
      Logger.log("Cascade Gallery clean skipped: " + err.toString());
    }

    // 3. Delete the project itself
    var success = deleteRow("Projects", "id", projectId);
    if (success) {
      logActivity("PROJECT_DELETE", "Deleted project ID: " + projectId + " and performed cascading asset cleanup", "admin");
      return { status: "success", message: "Project and related assets removed from active showcases." };
    }
    return { status: "error", message: "Project ID not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * ==================== BLOGS CRUD ====================
 */
function saveBlog(sessionToken, blogObj) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var isNew = !blogObj.id || blogObj.id === "";
    var dateStr = blogObj.date || new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    
    var payload = {
      id: isNew ? generateSequentialID("Blog", "BLOG") : blogObj.id,
      title: sanitizeInput(blogObj.title),
      excerpt: sanitizeInput(blogObj.excerpt || ""),
      content: sanitizeInput(blogObj.content),
      date: dateStr,
      category: sanitizeInput(blogObj.category || "General Insights"),
      image: blogObj.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
      author: sanitizeInput(blogObj.author || "Corporate Administrator")
    };
    
    var success = false;
    if (isNew) {
      success = writeRow("Blog", payload);
      logActivity("BLOG_CREATE", "Published new technical article: " + payload.title + " (" + payload.id + ")", "admin");
    } else {
      success = updateRow("Blog", "id", payload.id, payload);
      logActivity("BLOG_UPDATE", "Edited published article: " + payload.title + " (" + payload.id + ")", "admin");
    }
    
    if (success) {
      return { status: "success", message: "Blog article saved successfully!", id: payload.id };
    } else {
      return { status: "error", message: "Spreadsheet transaction failed." };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function removeBlog(sessionToken, blogId) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    // Cascading clean of any related files row linked to this blog
    try {
      var filesRows = readTable("Files");
      filesRows.forEach(function(row) {
        var refId = row.referenceId || row.ReferenceID || row.referenceID || "";
        if (String(refId) === String(blogId)) {
          deleteRow("Files", "id", row.id);
          var fileId = row.fileId || row.FileID || "";
          if (fileId) {
            try { DriveApp.getFileById(fileId).setTrashed(true); } catch(err) {}
          }
        }
      });
    } catch(err) {}

    var success = deleteRow("Blog", "id", blogId);
    if (success) {
      logActivity("BLOG_DELETE", "Deleted blog post ID: " + blogId, "admin");
      return { status: "success", message: "Blog article deleted successfully." };
    }
    return { status: "error", message: "Blog ID not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * ==================== GOOGLE DRIVE ASSET UPLOAD ====================
 * Captures visitor/admin image uploads as base64, stores them in Drive folder 'SDY_Assets',
 * sets permissions to Public-view, updates "Files" and "Gallery" tables with sequential IDs.
 */
function uploadFileToDrive(sessionToken, base64Data, filename, referenceId) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Access denied. Login required." };
  }
  try {
    var folderName = "SDY_Assets";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    var contentType = base64Data.substring(base64Data.indexOf(":") + 1, base64Data.indexOf(";"));
    var base64Content = base64Data.substring(base64Data.indexOf(",") + 1);
    var decoded = Utilities.base64Decode(base64Content);
    var blob = Utilities.newBlob(decoded, contentType, filename);
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var fileId = file.getId();
    var cdnUrl = getGoogleDriveImageLink(fileId);
    var isPdf = contentType.toLowerCase().indexOf("pdf") !== -1;
    var refVal = referenceId || "";
    
    // Save record to "Files" table
    var fileRecordId = generateSequentialID("Files", "FILE");
    var filePayload = {
      "id": fileRecordId,
      "fileId": fileId,
      "FileID": fileId,
      "imageUrl": isPdf ? "" : cdnUrl,
      "ImageURL": isPdf ? "" : cdnUrl,
      "pdfUrl": isPdf ? cdnUrl : "",
      "PDFURL": isPdf ? cdnUrl : "",
      "referenceId": refVal,
      "ReferenceID": refVal
    };
    writeRow("Files", filePayload);
    
    // If we have a referenceId and it's an image, register inside "Gallery" too
    if (refVal && !isPdf) {
      var galleryId = generateSequentialID("Gallery", "GAL");
      var galleryPayload = {
        "id": galleryId,
        "title": filename,
        "category": "Project Asset",
        "googleDriveFileId": fileId,
        "imageLink": cdnUrl,
        "referenceId": refVal,
        "ReferenceID": refVal,
        "FileID": fileId,
        "ImageURL": cdnUrl
      };
      writeRow("Gallery", galleryPayload);
    }
    
    logActivity("DRIVE_UPLOAD", "Uploaded file " + filename + " to Drive (ID: " + fileId + ", Row: " + fileRecordId + ", Ref: " + refVal + ")", "admin");
    return { status: "success", fileId: fileId, url: cdnUrl, message: "Asset successfully uploaded to Google Drive!" };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * ==================== BACKUP & RESTORE MODULE ====================
 */
function exportDatabaseAsJSON(sessionToken) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Access denied." };
  }
  try {
    var backup = {
      timestamp: new Date().toISOString(),
      CompanyInfo: readTable("CompanyInfo"),
      Products: readTable("Products"),
      Projects: readTable("Projects"),
      Gallery: readTable("Gallery"),
      Team: readTable("Team"),
      Blog: readTable("Blog"),
      ContactMessages: readTable("ContactMessages"),
      Settings: readTable("Settings"),
      Quotations: readTable("Quotations"),
      Categories: readTable("Categories"),
      Translations: readTable("Translations"),
      Files: readTable("Files")
    };
    
    logActivity("DATABASE_BACKUP", "Full database JSON export requested", "admin");
    return { status: "success", data: JSON.stringify(backup, null, 2), message: "Database tables compiled successfully!" };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function importDatabaseFromJSON(sessionToken, jsonString) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Access denied." };
  }
  
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // 10s write protection during restore
    
    var backup = JSON.parse(jsonString);
    var ss = getSpreadsheet();
    
    var tables = ["CompanyInfo", "Products", "Projects", "Gallery", "Team", "Blog", "ContactMessages", "Settings", "Quotations", "Categories", "Translations", "Files"];
    
    tables.forEach(function(tbl) {
      if (!backup[tbl]) return; // Skip if table data missing in backup
      
      var sheet = ss.getSheetByName(tbl);
      if (!sheet) {
        sheet = ss.insertSheet(tbl);
      }
      
      sheet.clearContents();
      
      var rows = backup[tbl];
      if (rows.length === 0) {
        // If empty, just restore headers from active DB
        return;
      }
      
      // Reconstruct sheet headers and rows
      var headers = Object.keys(rows[0]);
      sheet.appendRow(headers);
      
      rows.forEach(function(rowObj) {
        var rowArr = [];
        headers.forEach(function(h) {
          rowArr.push(rowObj[h] !== undefined ? rowObj[h] : "");
        });
        sheet.appendRow(rowArr);
      });
      
      // Styling and cache cleanup
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#E0F2FE");
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
      clearSheetCache(tbl);
    });
    
    logActivity("DATABASE_RESTORE", "Full database rollback triggered via JSON import file", "admin");
    return { status: "success", message: "Database restore completed. All sheets rolled back successfully!" };
  } catch (e) {
    return { status: "error", message: "Restore failure: " + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * ==================== ENTERPRISE INBOUND QUOTATION SYSTEM ====================
 */
function submitVisitorQuotation(quotationForm) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Quotations");
    if (!sheet) {
      initDatabase();
      sheet = ss.getSheetByName("Quotations");
    }
    
    var quoteId = generateSequentialID("Quotations", "QTE");
    var timestampStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" });
    
    var payload = {
      "id": quoteId,
      "date": timestampStr,
      "clientName": quotationForm.name || "Individual Estimator",
      "clientEmail": quotationForm.email || "",
      "clientPhone": quotationForm.phone || "",
      "company": quotationForm.company || "N/A",
      "items": quotationForm.selectedProducts || "General Contracting",
      "notes": quotationForm.notes || "",
      "status": "Pending"
    };
    
    writeRow("Quotations", payload);
    
    // Email alert triggers for quotations
    try {
      sendQuotationEmailNotification(payload);
    } catch(err) {
      Logger.log("Quotation email notify failed: " + err.toString());
    }
    
    return { status: "success", id: quoteId, message: "Your specification selection has been logged! Code: " + quoteId + ". Our estimators will email your PDF proposal." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function updateQuotationStatus(sessionToken, targetId, newStatus) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Access denied." };
  }
  try {
    var success = updateRow("Quotations", "id", targetId, { "status": newStatus });
    if (success) {
      logActivity("QUOTATION_STATUS", "Modified quotation status of " + targetId + " to " + newStatus, "admin");
      return { status: "success", message: "Quotation status saved." };
    }
    return { status: "error", message: "Quotation ID not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function removeQuotationRecord(sessionToken, quoteId) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Access denied." };
  }
  try {
    var success = deleteRow("Quotations", "id", quoteId);
    if (success) {
      logActivity("QUOTATION_DELETE", "Deleted quotation ID: " + quoteId, "admin");
      return { status: "success", message: "Quotation record removed permanently." };
    }
    return { status: "error", message: "Quotation ID not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Sends a premium HTML email alert for incoming client specification quotes.
 */
function sendQuotationEmailNotification(quoteData) {
  var companyInfo = getCompanyInfo();
  var recipient = Session.getActiveUser().getEmail();
  if (!recipient || recipient === "") return;
  
  var subject = "📊 [NEW SPECIFICATION QUOTE] " + quoteData.clientName + " - " + quoteData.id;
  
  var htmlBody = 
    "<div style='font-family:Inter, Arial, sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #E4E4E7; border-radius:16px; color:#18181B;'>" +
      "<div style='background-color:#0A4DA3; padding:20px; border-radius:12px; text-align:center; color:#FFFFFF;'>" +
        "<h2 style='margin:0; font-size:20px; tracking-wider:0.05em;'>SDY COMPANY C&I</h2>" +
        "<p style='margin:4px 0 0 0; font-size:12px; color:#E0F2FE;'>Real-time Inbound Project Quote Request</p>" +
      "</div>" +
      
      "<h3 style='font-size:16px; margin-top:24px; border-bottom:1px solid #F4F4F5; padding-bottom:8px;'>Quote Information Summary</h3>" +
      "<table style='width:100%; font-size:13px; line-height:1.6; border-collapse:collapse;'>" +
        "<tr><td style='font-weight:bold; width:130px; py:6px;'>Quote ID:</td><td>" + quoteData.id + "</td></tr>" +
        "<tr><td style='font-weight:bold; py:6px;'>Timestamp:</td><td>" + quoteData.date + "</td></tr>" +
        "<tr><td style='font-weight:bold; py:6px;'>Client Name:</td><td>" + quoteData.clientName + "</td></tr>" +
        "<tr><td style='font-weight:bold; py:6px;'>Company:</td><td>" + quoteData.company + "</td></tr>" +
        "<tr><td style='font-weight:bold; py:6px;'>Phone Number:</td><td>" + quoteData.clientPhone + "</td></tr>" +
        "<tr><td style='font-weight:bold; py:6px;'>Email:</td><td>" + quoteData.clientEmail + "</td></tr>" +
      "</table>" +
      
      "<h3 style='font-size:16px; margin-top:24px; border-bottom:1px solid #F4F4F5; padding-bottom:8px;'>Specified System Selection</h3>" +
      "<div style='background-color:#F7F9FC; padding:16px; border-radius:12px; font-size:13px; line-height:1.6; border-left:4px solid #1E88E5;'>" +
        "<strong>Product Line Items / Subsystems Requested:</strong><br/>" +
        "<span style='color:#0A4DA3; font-weight:bold;'>" + quoteData.items + "</span>" +
      "</div>" +
      
      "<h3 style='font-size:16px; margin-top:24px; border-bottom:1px solid #F4F4F5; padding-bottom:8px;'>Client Technical Notes</h3>" +
      "<p style='font-size:13px; line-height:1.5; font-style:italic; background-color:#FAFAFA; padding:12px; border-radius:8px; border:1px solid #E4E4E7;'>" + 
        (quoteData.notes || "No special constraints requested.") + 
      "</p>" +
      
      "<div style='margin-top:32px; text-align:center;'>" +
        "<a href='" + getSpreadsheet().getUrl() + "' style='background-color:#0A4DA3; color:#FFFFFF; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:13px; font-weight:bold; display:inline-block;'>Open Admin Spreadsheet</a>" +
      "</div>" +
      
      "<p style='font-size:10px; color:#A1A1AA; text-align:center; margin-top:40px;'>This is an automated operational notification generated secure-side by SDY C&I Portal.</p>" +
    "</div>";
    
  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * ==================== CATEGORIES CRUD HANDLERS ====================
 */
function saveCategory(sessionToken, categoryObj) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var isNew = !categoryObj.id || categoryObj.id === "";
    
    var payload = {
      id: isNew ? generateSequentialID("Categories", "CAT") : categoryObj.id,
      name: sanitizeInput(categoryObj.name),
      type: sanitizeInput(categoryObj.type || "product") // 'product' or 'project'
    };
    
    var success = false;
    if (isNew) {
      success = writeRow("Categories", payload);
      logActivity("CATEGORY_CREATE", "Created new category: " + payload.name + " (" + payload.type + ")", "admin");
    } else {
      success = updateRow("Categories", "id", payload.id, payload);
      logActivity("CATEGORY_UPDATE", "Updated category: " + payload.name + " (" + payload.id + ")", "admin");
    }
    
    if (success) {
      return { status: "success", message: "Category saved successfully!", id: payload.id };
    } else {
      return { status: "error", message: "Spreadsheet transaction failed." };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function removeCategory(sessionToken, categoryId) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var success = deleteRow("Categories", "id", categoryId);
    if (success) {
      logActivity("CATEGORY_DELETE", "Deleted category ID: " + categoryId, "admin");
      return { status: "success", message: "Category removed successfully." };
    }
    return { status: "error", message: "Category ID not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * ==================== TRANSLATIONS CRUD HANDLERS ====================
 */
function saveTranslation(sessionToken, translationObj) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var key = translationObj.Key || translationObj.key;
    if (!key) {
      return { status: "error", message: "Key is required." };
    }
    
    var translations = readTable("Translations");
    var exists = false;
    for (var i = 0; i < translations.length; i++) {
      if (String(translations[i].Key).toLowerCase() === String(key).toLowerCase()) {
        exists = true;
        break;
      }
    }
    
    var payload = {
      "Key": key,
      "Khmer": translationObj.Khmer || translationObj.khmer || "",
      "English": translationObj.English || translationObj.english || "",
      "Korean": translationObj.Korean || translationObj.korean || ""
    };
    
    var success = false;
    if (!exists) {
      success = writeRow("Translations", payload);
      logActivity("TRANSLATION_CREATE", "Created translation key: " + key, "admin");
    } else {
      success = updateRow("Translations", "Key", key, payload);
      logActivity("TRANSLATION_UPDATE", "Updated translation key: " + key, "admin");
    }
    
    if (success) {
      return { status: "success", message: "Translation saved successfully!", key: key };
    } else {
      return { status: "error", message: "Spreadsheet transaction failed." };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function removeTranslation(sessionToken, translationKey) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var success = deleteRow("Translations", "Key", translationKey);
    if (success) {
      logActivity("TRANSLATION_DELETE", "Deleted translation key: " + translationKey, "admin");
      return { status: "success", message: "Translation key removed successfully." };
    }
    return { status: "error", message: "Translation key not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function autoCreateTranslation(key, defaultValue) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Translations");
    if (!sheet) {
      initDatabase();
      sheet = ss.getSheetByName("Translations");
    }
    
    // Prevent duplicate keys
    var translations = readTable("Translations");
    var exists = false;
    for (var i = 0; i < translations.length; i++) {
      if (String(translations[i].Key).toLowerCase() === String(key).toLowerCase()) {
        exists = true;
        break;
      }
    }
    
    if (!exists) {
      var payload = {
        "Key": key,
        "Khmer": "",
        "English": defaultValue || key,
        "Korean": ""
      };
      writeRow("Translations", payload);
      logActivity("AUTO_TRANSLATION_CREATE", "Automatically registered missing translation key: " + key, "System");
      return { status: "success", message: "Key created.", key: key };
    }
    return { status: "success", message: "Key already exists." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Generic CRUD: Save record in any of the 22 worksheets.
 */
function saveRecord(sessionToken, sheetName, idKey, record) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var isNew = !record[idKey] || record[idKey] === "";
    
    // Auto-generate ID if new and missing
    if (isNew) {
      record[idKey] = generateSequentialID(sheetName, sheetName.substring(0, 3).toUpperCase());
      record["Created"] = new Date().toISOString();
    }
    
    record["Updated"] = new Date().toISOString();
    
    var success = false;
    if (isNew) {
      success = writeRow(sheetName, record);
      logActivity("CREATE_RECORD", "Created record in " + sheetName + " (ID: " + record[idKey] + ")", "admin");
    } else {
      success = updateRow(sheetName, idKey, record[idKey], record);
      logActivity("UPDATE_RECORD", "Updated record in " + sheetName + " (ID: " + record[idKey] + ")", "admin");
    }
    
    if (success) {
      return { status: "success", message: "Record saved successfully inside " + sheetName, id: record[idKey] };
    } else {
      return { status: "error", message: "Transaction failed." };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Generic CRUD: Remove record from any worksheet.
 */
function removeRecord(sessionToken, sheetName, idKey, idValue) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  try {
    var success = deleteRow(sheetName, idKey, idValue);
    if (success) {
      logActivity("DELETE_RECORD", "Deleted record from " + sheetName + " (ID: " + idValue + ")", "admin");
      return { status: "success", message: "Record removed successfully from " + sheetName };
    }
    return { status: "error", message: "Record not found." };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Generic CRUD: Bulk Delete records.
 */
function bulkDeleteRecords(sessionToken, sheetName, idKey, idValues) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  if (!Array.isArray(idValues)) {
    return { status: "error", message: "idValues must be an array." };
  }
  try {
    var count = 0;
    idValues.forEach(function(val) {
      if (deleteRow(sheetName, idKey, val)) {
        count++;
      }
    });
    logActivity("BULK_DELETE", "Bulk deleted " + count + " records from " + sheetName, "admin");
    return { status: "success", message: "Successfully deleted " + count + " records from " + sheetName };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

/**
 * Generic CRUD: Bulk Update a field.
 */
function bulkUpdateRecords(sessionToken, sheetName, idKey, idValues, field, value) {
  if (!verifySession(sessionToken)) {
    return { status: "error", code: "UNAUTHORIZED", message: "Session expired." };
  }
  if (!Array.isArray(idValues)) {
    return { status: "error", message: "idValues must be an array." };
  }
  try {
    var count = 0;
    idValues.forEach(function(val) {
      var updateObj = {};
      updateObj[field] = value;
      updateObj["Updated"] = new Date().toISOString();
      if (updateRow(sheetName, idKey, val, updateObj)) {
        count++;
      }
    });
    logActivity("BULK_UPDATE", "Bulk updated " + count + " records in " + sheetName, "admin");
    return { status: "success", message: "Successfully updated " + count + " records in " + sheetName };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}
