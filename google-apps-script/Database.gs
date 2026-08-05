/**
 * Database.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Core Google Sheets Database ORM layer supporting CRUD, soft deletes, bulk operations, 
 * pagination, filtering, searching, and caching.
 */

var Database = {
  /**
   * Get Sheet by Name with auto-initialization of headers if missing
   */
  getSheet: function(sheetName) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Initialize default headers for the entity
      var headers = ["Id", "Name", "Category", "Status", "CreatedAt", "UpdatedAt", "IsDeleted"];
      sheet.appendRow(headers);
    }
    return sheet;
  },

  /**
   * Read all records from a sheet with filtering, searching, sorting, pagination & soft-delete filter
   */
  findMany: function(sheetName, options) {
    options = options || {};
    var page = options.page || 1;
    var limit = options.limit || CONFIG.DEFAULT_PAGE_SIZE;
    var includeDeleted = options.includeDeleted || false;
    var search = options.search ? options.search.toLowerCase() : "";
    var filter = options.filter || {};
    var sortBy = options.sortBy || "CreatedAt";
    var sortOrder = options.sortOrder === "ASC" ? 1 : -1;

    var sheet = Database.getSheet(sheetName);
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { items: [], total: 0, page: page, pages: 1 };
    }

    var headers = data[0];
    var rows = data.slice(1);
    var records = [];

    rows.forEach(function(row, rowIndex) {
      var record = { _rowIndex: rowIndex + 2 };
      headers.forEach(function(header, colIndex) {
        record[header] = row[colIndex];
      });

      // Filter soft-deleted items unless requested
      var isDeleted = String(record.IsDeleted).toLowerCase() === "true";
      if (!includeDeleted && isDeleted) return;

      // Apply exact/field filter
      var matchesFilter = true;
      for (var fKey in filter) {
        if (filter[fKey] !== undefined && String(record[fKey]).toLowerCase() !== String(filter[fKey]).toLowerCase()) {
          matchesFilter = false;
          break;
        }
      }
      if (!matchesFilter) return;

      // Apply fuzzy search across all text fields
      if (search) {
        var rowText = Object.values(record).join(" ").toLowerCase();
        if (rowText.indexOf(search) === -1) return;
      }

      records.push(record);
    });

    // Sorting
    records.sort(function(a, b) {
      var valA = a[sortBy] || "";
      var valB = b[sortBy] || "";
      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    var total = records.length;
    var totalPages = Math.ceil(total / limit) || 1;
    var startIndex = (page - 1) * limit;
    var paginatedItems = records.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total: total,
      page: page,
      pages: totalPages
    };
  },

  /**
   * Find Record by Primary Key (Id)
   */
  findById: function(sheetName, id) {
    var result = Database.findMany(sheetName, { includeDeleted: true, limit: 10000 });
    var found = result.items.filter(function(item) {
      return String(item.Id) === String(id);
    });
    return found.length > 0 ? found[0] : null;
  },

  /**
   * Insert New Record (POST)
   */
  create: function(sheetName, payload) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      var sheet = Database.getSheet(sheetName);
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      var now = new Date().toISOString();
      payload.Id = payload.Id || generateUUID();
      payload.CreatedAt = payload.CreatedAt || now;
      payload.UpdatedAt = now;
      payload.IsDeleted = false;

      var newRow = headers.map(function(header) {
        var val = payload[header] !== undefined ? payload[header] : "";
        return escapeFormula(val);
      });

      sheet.appendRow(newRow);
      Database.logAudit("CREATE", sheetName, payload.Id, payload);
      
      // Invalidate script cache for sheet
      try { CacheService.getScriptCache().remove(sheetName + "_cache"); } catch (e) {}

      return payload;
    } finally {
      try { lock.releaseLock(); } catch (e) {}
    }
  },

  /**
   * Update Existing Record (PUT/PATCH)
   */
  update: function(sheetName, id, payload) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      var existing = Database.findById(sheetName, id);
      if (!existing) return null;

      var sheet = Database.getSheet(sheetName);
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      payload.UpdatedAt = new Date().toISOString();
      var merged = Object.assign({}, existing, payload);

      var updatedRow = headers.map(function(header) {
        var val = merged[header] !== undefined ? merged[header] : "";
        return escapeFormula(val);
      });

      sheet.getRange(existing._rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      Database.logAudit("UPDATE", sheetName, id, payload);

      // Invalidate script cache for sheet
      try { CacheService.getScriptCache().remove(sheetName + "_cache"); } catch (e) {}

      return merged;
    } finally {
      try { lock.releaseLock(); } catch (e) {}
    }
  },

  /**
   * Soft Delete Record
   */
  softDelete: function(sheetName, id) {
    return Database.update(sheetName, id, { IsDeleted: true });
  },

  /**
   * Restore Soft Deleted Record
   */
  restore: function(sheetName, id) {
    return Database.update(sheetName, id, { IsDeleted: false });
  },

  /**
   * Permanent Hard Delete Record
   */
  hardDelete: function(sheetName, id) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      var existing = Database.findById(sheetName, id);
      if (!existing) return false;

      var sheet = Database.getSheet(sheetName);
      sheet.deleteRow(existing._rowIndex);
      Database.logAudit("HARD_DELETE", sheetName, id, {});
      
      // Invalidate script cache for sheet
      try { CacheService.getScriptCache().remove(sheetName + "_cache"); } catch (e) {}

      return true;
    } finally {
      try { lock.releaseLock(); } catch (e) {}
    }
  },

  /**
   * Audit Logging to AuditLogs sheet
   */
  logAudit: function(action, entity, entityId, payload) {
    try {
      var sheet = Database.getSheet(CONFIG.SHEETS.AUDIT_LOGS);
      sheet.appendRow([
        generateUUID(),
        action,
        entity,
        entityId,
        JSON.stringify(payload),
        new Date().toISOString()
      ]);
    } catch (e) {
      // Ignore logger errors
    }
  }
};
