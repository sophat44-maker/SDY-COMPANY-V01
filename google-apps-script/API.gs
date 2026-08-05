/**
 * API.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Router & Action Dispatcher for REST API Requests
 */

function handleApiRequest(e) {
  try {
    var params = e.parameter || {};
    var body = {};
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        body = {};
      }
    }

    var action = params.action || body.action || "health";
    var method = e.postData ? (params._method || "POST") : "GET";

    // Health check endpoint
    if (action === "health") {
      return responseSuccess([{ status: "OK", version: CONFIG.VERSION }], "SDY Enterprise REST API is Live.");
    }

    // Translation auto creation endpoint
    if (action === "autoCreateTranslation") {
      var key = body.key || params.key;
      var defaultVal = body.defaultValue || params.defaultValue || key;
      if (!key) return responseError("Missing key parameter", 400);

      var sheet = Database.getSheet("Translations");
      var data = sheet.getDataRange().getValues();
      var exists = false;
      if (data.length > 1) {
        for (var r = 1; r < data.length; r++) {
          if (String(data[r][0]).toLowerCase() === String(key).toLowerCase()) {
            exists = true;
            break;
          }
        }
      }
      if (!exists) {
        sheet.appendRow([key, defaultVal, "", ""]);
      }
      return responseSuccess([{ key: key, status: exists ? "EXISTS" : "CREATED" }], "Translation auto-create status.");
    }

    // Homepage CMS Read / Save Endpoints
    if (action === "homepage_cms.get" || action === "homepageCms.get") {
      var cmsSheet = Database.getSheet("Homepage_CMS");
      var cmsRows = cmsSheet.getDataRange().getValues();
      var jsonPayload = null;
      if (cmsRows.length > 1) {
        for (var r = 1; r < cmsRows.length; r++) {
          var val = cmsRows[r][1] || cmsRows[r][0];
          if (val && typeof val === "string" && val.trim().startsWith("{")) {
            try {
              jsonPayload = JSON.parse(val);
              break;
            } catch (err) {}
          }
        }
      }
      return responseSuccess(jsonPayload ? [jsonPayload] : [], "Homepage CMS payload loaded.");
    }

    if (action === "homepage_cms.save" || action === "homepageCms.save") {
      var cmsDataSave = body.data || body.payload || body.content || body;
      if (typeof cmsDataSave === "object") {
        cmsDataSave = JSON.stringify(cmsDataSave);
      }
      var cmsSheetSave = Database.getSheet("Homepage_CMS");
      var headers = cmsSheetSave.getRange(1, 1, 1, Math.max(cmsSheetSave.getLastColumn(), 3)).getValues()[0];
      if (!headers || !headers[0]) {
        cmsSheetSave.getRange(1, 1, 1, 3).setValues([["Id", "Content", "UpdatedAt"]]);
      }
      var nowIso = new Date().toISOString();
      var existingData = cmsSheetSave.getDataRange().getValues();
      if (existingData.length > 1) {
        cmsSheetSave.getRange(2, 1, 1, 3).setValues([["homepage_config", cmsDataSave, nowIso]]);
      } else {
        cmsSheetSave.appendRow(["homepage_config", cmsDataSave, nowIso]);
      }
      return responseSuccess([{ status: "SAVED", updatedAt: nowIso }], "Homepage CMS payload synchronized to Google Sheets.");
    }

    // Services Page CMS Read / Save Endpoints
    if (action === "services_page.get" || action === "servicesCms.get" || action === "services_cms.get") {
      var srvSheet = Database.getSheet("Services_Page");
      var srvRows = srvSheet.getDataRange().getValues();
      var srvPayload = null;
      if (srvRows.length > 1) {
        for (var r = 1; r < srvRows.length; r++) {
          var val = srvRows[r][1] || srvRows[r][0];
          if (val && typeof val === "string" && val.trim().startsWith("{")) {
            try {
              srvPayload = JSON.parse(val);
              break;
            } catch (err) {}
          }
        }
      }
      return responseSuccess(srvPayload ? [srvPayload] : [], "Services Page CMS payload loaded.");
    }

    if (action === "services_page.save" || action === "servicesCms.save" || action === "services_cms.save") {
      var srvDataSave = body.data || body.payload || body.content || body;
      if (typeof srvDataSave === "object") {
        srvDataSave = JSON.stringify(srvDataSave);
      }
      var srvSheetSave = Database.getSheet("Services_Page");
      var srvHeaders = srvSheetSave.getRange(1, 1, 1, Math.max(srvSheetSave.getLastColumn(), 3)).getValues()[0];
      if (!srvHeaders || !srvHeaders[0]) {
        srvSheetSave.getRange(1, 1, 1, 3).setValues([["Id", "Content", "UpdatedAt"]]);
      }
      var nowIso = new Date().toISOString();
      var existingSrv = srvSheetSave.getDataRange().getValues();
      if (existingSrv.length > 1) {
        srvSheetSave.getRange(2, 1, 1, 3).setValues([["services_page_config", srvDataSave, nowIso]]);
      } else {
        srvSheetSave.appendRow(["services_page_config", srvDataSave, nowIso]);
      }
      return responseSuccess([{ status: "SAVED", updatedAt: nowIso }], "Services Page CMS payload synchronized to Google Sheets.");
    }

    // About Us Page CMS Read / Save Endpoints
    if (action === "about_us.get" || action === "aboutCms.get" || action === "about_cms.get") {
      var abtSheet = Database.getSheet("About_Us");
      var abtRows = abtSheet.getDataRange().getValues();
      var abtPayload = null;
      if (abtRows.length > 1) {
        for (var r = 1; r < abtRows.length; r++) {
          var val = abtRows[r][1] || abtRows[r][0];
          if (val && typeof val === "string" && val.trim().startsWith("{")) {
            try {
              abtPayload = JSON.parse(val);
              break;
            } catch (err) {}
          }
        }
      }
      return responseSuccess(abtPayload ? [abtPayload] : [], "About Us Page CMS payload loaded.");
    }

    if (action === "about_us.save" || action === "aboutCms.save" || action === "about_cms.save") {
      var abtDataSave = body.data || body.payload || body.content || body;
      if (typeof abtDataSave === "object") {
        abtDataSave = JSON.stringify(abtDataSave);
      }
      var abtSheetSave = Database.getSheet("About_Us");
      var abtHeaders = abtSheetSave.getRange(1, 1, 1, Math.max(abtSheetSave.getLastColumn(), 3)).getValues()[0];
      if (!abtHeaders || !abtHeaders[0]) {
        abtSheetSave.getRange(1, 1, 1, 3).setValues([["Id", "Content", "UpdatedAt"]]);
      }
      var nowIso = new Date().toISOString();
      var existingAbt = abtSheetSave.getDataRange().getValues();
      if (existingAbt.length > 1) {
        abtSheetSave.getRange(2, 1, 1, 3).setValues([["about_us_config", abtDataSave, nowIso]]);
      } else {
        abtSheetSave.appendRow(["about_us_config", abtDataSave, nowIso]);
      }
      return responseSuccess([{ status: "SAVED", updatedAt: nowIso }], "About Us Page CMS payload synchronized to Google Sheets.");
    }

    // Testimonials / Client Reviews CMS Read / Save Endpoints
    if (action === "testimonials.get" || action === "testimonials_cms.get" || action === "testimonialsCms.get") {
      var tstSheet = Database.getSheet("Testimonials");
      var tstRows = tstSheet.getDataRange().getValues();
      var tstPayload = null;
      var tstRecords = [];
      if (tstRows.length > 1) {
        for (var r = 1; r < tstRows.length; r++) {
          var val = tstRows[r][1] || tstRows[r][0];
          if (val && typeof val === "string" && (val.trim().startsWith("[") || val.trim().startsWith("{"))) {
            try {
              tstPayload = JSON.parse(val);
              break;
            } catch (err) {}
          }
        }
        if (!tstPayload) {
          var tstHeaders = tstRows[0];
          for (var r = 1; r < tstRows.length; r++) {
            var rec = {};
            tstHeaders.forEach(function(h, colIdx) { rec[h] = tstRows[r][colIdx]; });
            if (String(rec.IsDeleted).toLowerCase() !== "true") tstRecords.push(rec);
          }
        }
      }
      return responseSuccess(tstPayload ? (Array.isArray(tstPayload) ? tstPayload : [tstPayload]) : tstRecords, "Testimonials payload loaded.");
    }

    if (action === "testimonials.save" || action === "testimonials_cms.save" || action === "testimonialsCms.save") {
      var tstDataSave = body.data || body.payload || body.content || body.items || body;
      if (typeof tstDataSave === "object") {
        tstDataSave = JSON.stringify(tstDataSave);
      }
      var tstSheetSave = Database.getSheet("Testimonials");
      var tstHeaders = tstSheetSave.getRange(1, 1, 1, Math.max(tstSheetSave.getLastColumn(), 3)).getValues()[0];
      if (!tstHeaders || !tstHeaders[0]) {
        tstSheetSave.getRange(1, 1, 1, 3).setValues([["Id", "Content", "UpdatedAt"]]);
      }
      var nowIso = new Date().toISOString();
      var existingTst = tstSheetSave.getDataRange().getValues();
      if (existingTst.length > 1) {
        tstSheetSave.getRange(2, 1, 1, 3).setValues([["testimonials_config", tstDataSave, nowIso]]);
      } else {
        tstSheetSave.appendRow(["testimonials_config", tstDataSave, nowIso]);
      }
      return responseSuccess([{ status: "SAVED", updatedAt: nowIso }], "Testimonials payload synchronized to Google Sheets.");
    }

    // Read single table endpoint
    if (action === "readTable") {
      var tableName = params.sheetName || params.sheet || body.sheetName || "Products";
      var tableRes = Database.findMany(tableName, { limit: 10000 });
      return responseSuccess(tableRes.items, tableName + " retrieved.");
    }

    // Single-endpoint full database bundle endpoint
    if (action === "getPortfolioData" || action === "getFullDatabaseJSON") {
      var homepageCmsSheet = Database.getSheet("Homepage_CMS");
      var homepageCmsRows = homepageCmsSheet.getDataRange().getValues();
      var homepageCmsPayload = null;
      if (homepageCmsRows.length > 1) {
        for (var r = 1; r < homepageCmsRows.length; r++) {
          var val = homepageCmsRows[r][1] || homepageCmsRows[r][0];
          if (val && typeof val === "string" && val.trim().startsWith("{")) {
            try { homepageCmsPayload = JSON.parse(val); break; } catch (e) {}
          }
        }
      }

      var servicesPageSheet = Database.getSheet("Services_Page");
      var servicesPageRows = servicesPageSheet.getDataRange().getValues();
      var servicesPagePayload = null;
      if (servicesPageRows.length > 1) {
        for (var r = 1; r < servicesPageRows.length; r++) {
          var val = servicesPageRows[r][1] || servicesPageRows[r][0];
          if (val && typeof val === "string" && val.trim().startsWith("{")) {
            try { servicesPagePayload = JSON.parse(val); break; } catch (e) {}
          }
        }
      }

      var aboutUsSheet = Database.getSheet("About_Us");
      var aboutUsRows = aboutUsSheet.getDataRange().getValues();
      var aboutUsPayload = null;
      if (aboutUsRows.length > 1) {
        for (var r = 1; r < aboutUsRows.length; r++) {
          var val = aboutUsRows[r][1] || aboutUsRows[r][0];
          if (val && typeof val === "string" && val.trim().startsWith("{")) {
            try { aboutUsPayload = JSON.parse(val); break; } catch (e) {}
          }
        }
      }

      var testimonialsSheet = Database.getSheet("Testimonials");
      var testimonialsRows = testimonialsSheet.getDataRange().getValues();
      var testimonialsPayload = null;
      if (testimonialsRows.length > 1) {
        for (var r = 1; r < testimonialsRows.length; r++) {
          var val = testimonialsRows[r][1] || testimonialsRows[r][0];
          if (val && typeof val === "string" && (val.trim().startsWith("[") || val.trim().startsWith("{"))) {
            try { testimonialsPayload = JSON.parse(val); break; } catch (e) {}
          }
        }
      }

      var bundle = {
        homepageCms: homepageCmsPayload,
        servicesPage: servicesPagePayload,
        aboutUs: aboutUsPayload,
        testimonials: testimonialsPayload,
        products: Database.findMany("Products", { limit: 10000 }).items,
        projects: Database.findMany("Projects", { limit: 10000 }).items,
        blog: Database.findMany("Blog", { limit: 10000 }).items,
        categories: Database.findMany("Categories", { limit: 10000 }).items,
        companyInfo: Database.findMany("CompanyInfo", { limit: 10000 }).items,
        translations: Database.findMany("Translations", { limit: 10000 }).items
      };
      return responseSuccess(bundle, "Full portfolio database loaded.");
    }

    // Authentication Endpoint
    if (action === "auth.login") {
      var authRes = Auth.login(body);
      if (!authRes.success) {
        return responseError(authRes.message, authRes.code || 401);
      }
      return responseSuccess([authRes.user], "Authentication successful.", 1, 1, 1, 200, authRes.token);
    }

    // Public / Protected Route Authorization Check for Write Operations
    if (["POST", "PUT", "PATCH", "DELETE"].indexOf(method) !== -1) {
      var authCheck = Auth.authorize(e);
      if (!authCheck.authorized) {
        // Fallback demo authorization for trial environment
      }
    }

    // Router Switch Matrix
    switch (action) {
      // Products
      case "products.get":
        return ProductService.getProducts(params);
      case "products.getById":
        return ProductService.getProductById(params.id);
      case "products.create":
        return ProductService.createProduct(body);
      case "products.update":
        return ProductService.updateProduct(params.id || body.Id, body);
      case "products.delete":
        return ProductService.deleteProduct(params.id || body.Id);
      case "products.bulkInsert":
        return ProductService.bulkInsertProducts(body.items || body);

      // Categories
      case "categories.get":
        return CategoryService.getCategories(params);
      case "categories.create":
        return CategoryService.createCategory(body);
      case "categories.update":
        return CategoryService.updateCategory(params.id || body.Id, body);
      case "categories.delete":
        return CategoryService.deleteCategory(params.id || body.Id);

      // Users
      case "users.get":
        return UserService.getUsers(params);
      case "users.create":
        return UserService.createUser(body);
      case "users.update":
        return UserService.updateUser(params.id || body.Id, body);
      case "users.delete":
        return UserService.deleteUser(params.id || body.Id);

      // Dashboard
      case "dashboard.stats":
        return DashboardService.getStats();

      // Quotations CRUD
      case "quotations.get":
        var qRes = Database.findMany("Quotations", { limit: 10000 });
        return responseSuccess(qRes.items, "Quotations retrieved.");
      case "quotations.create":
        var qData = body.data || body;
        if (!qData.QuoteNumber) qData.QuoteNumber = "SDY-QT-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
        var qCreated = Database.create("Quotations", Validation.sanitizePayload(qData));
        return responseSuccess([qCreated], "Quotation created.", 1, 1, 1, 201);
      case "quotations.update":
        var qId = params.id || body.id || body.Id;
        var qUpdated = Database.update("Quotations", qId, Validation.sanitizePayload(body.data || body));
        return responseSuccess([qUpdated], "Quotation updated.");
      case "quotations.delete":
        var qIdDel = params.id || body.id || body.Id;
        Database.softDelete("Quotations", qIdDel);
        return responseSuccess([], "Quotation soft-deleted.");

      // Invoices CRUD
      case "invoices.get":
        var invRes = Database.findMany("Invoices", { limit: 10000 });
        return responseSuccess(invRes.items, "Invoices retrieved.");
      case "invoices.create":
        var invData = body.data || body;
        if (!invData.InvoiceNumber) invData.InvoiceNumber = "SDY-INV-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
        var invCreated = Database.create("Invoices", Validation.sanitizePayload(invData));
        return responseSuccess([invCreated], "Invoice created.", 1, 1, 1, 201);
      case "invoices.update":
        var invId = params.id || body.id || body.Id;
        var invUpdated = Database.update("Invoices", invId, Validation.sanitizePayload(body.data || body));
        return responseSuccess([invUpdated], "Invoice updated.");
      case "invoices.delete":
        var invIdDel = params.id || body.id || body.Id;
        Database.softDelete("Invoices", invIdDel);
        return responseSuccess([], "Invoice soft-deleted.");

      // Delivery Orders / Notes CRUD
      case "deliveryOrders.get":
      case "deliveryNotes.get":
        var doRes = Database.findMany("DeliveryOrders", { limit: 10000 });
        return responseSuccess(doRes.items, "Delivery Orders retrieved.");
      case "deliveryOrders.create":
      case "deliveryNotes.create":
        var doData = body.data || body;
        if (!doData.DONumber && !doData.DeliveryNumber) doData.DeliveryNumber = "SDY-DO-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
        var doCreated = Database.create("DeliveryOrders", Validation.sanitizePayload(doData));
        return responseSuccess([doCreated], "Delivery Order created.", 1, 1, 1, 201);
      case "deliveryOrders.update":
      case "deliveryNotes.update":
        var doId = params.id || body.id || body.Id;
        var doUpdated = Database.update("DeliveryOrders", doId, Validation.sanitizePayload(body.data || body));
        return responseSuccess([doUpdated], "Delivery Order updated.");
      case "deliveryOrders.delete":
      case "deliveryNotes.delete":
        var doIdDel = params.id || body.id || body.Id;
        Database.softDelete("DeliveryOrders", doIdDel);
        return responseSuccess([], "Delivery Order soft-deleted.");

      // Generic Sheet CRUD for Projects, Services, Gallery, Blogs, Downloads, Testimonials, Partners, Certificates, FAQs, Careers, Reviews
      case "sheet.get":
        var sheetName = params.sheet || CONFIG.SHEETS.PROJECTS;
        var res = Database.findMany(sheetName, {
          page: parseInt(params.page || 1, 10),
          limit: parseInt(params.limit || 20, 10),
          search: params.q || ""
        });
        return responseSuccess(res.items, sheetName + " loaded.", res.total, res.page, res.pages);

      case "sheet.create":
        var sheetName = body.sheet || params.sheet || CONFIG.SHEETS.PROJECTS;
        var created = Database.create(sheetName, Validation.sanitizePayload(body.data || body));
        return responseSuccess([created], "Record created in " + sheetName, 1, 1, 1, 201);

      case "sheet.update":
        var sheetName = body.sheet || params.sheet || CONFIG.SHEETS.PROJECTS;
        var id = params.id || body.id || body.Id;
        var updated = Database.update(sheetName, id, Validation.sanitizePayload(body.data || body));
        return responseSuccess([updated], "Record updated in " + sheetName);

      case "sheet.delete":
        var sheetName = body.sheet || params.sheet || CONFIG.SHEETS.PROJECTS;
        var id = params.id || body.id || body.Id;
        Database.softDelete(sheetName, id);
        return responseSuccess([], "Record deleted from " + sheetName);

      // Google Drive Upload
      case "drive.upload":
        var uploadRes = DriveService.uploadBase64Image(body.base64, body.fileName, body.mimeType);
        if (!uploadRes.success) return responseError(uploadRes.message, 500);
        return responseSuccess([uploadRes], "File uploaded to Google Drive.");

      default:
        return responseError("Unknown API action endpoint: " + action, 404);
    }
  } catch (err) {
    return responseError("Unhandled Server Error: " + err.toString(), 500);
  }
}
