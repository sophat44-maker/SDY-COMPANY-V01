/**
 * Code.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Entry Point for Google Apps Script Web App Deployment (doGet & doPost)
 *
 * Deployment Instructions:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Copy all .gs files into the project
 * 3. Click Deploy -> New Deployment -> Web App
 * 4. Execute as: "Me", Who has access: "Anyone"
 * 5. Copy the generated Web App URL and paste it into SDY Admin Settings > Google Apps Script URL
 */

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  return handleApiRequest(e);
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  return handleApiRequest(e);
}

/**
 * One-time Database Setup & Initialization Script
 */
function setupDatabase() {
  var ss = getSpreadsheet();
  for (var key in CONFIG.SHEETS) {
    var sheetName = CONFIG.SHEETS[key];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (["Homepage_CMS", "Services_Page", "About_Us", "Testimonials"].indexOf(sheetName) !== -1) {
        sheet.appendRow(["Id", "Content", "UpdatedAt"]);
      } else {
        sheet.appendRow(["Id", "Name", "Category", "Status", "CreatedAt", "UpdatedAt", "IsDeleted"]);
      }
    }
  }
  Logger.log("SDY Enterprise Database Initialized Successfully!");
}
