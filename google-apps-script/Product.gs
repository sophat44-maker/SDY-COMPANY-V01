/**
 * Product.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Specialized logic for Products table operations (CRUD, search, filter, bulk insert/update/delete)
 */

var ProductService = {
  /**
   * Get Products Catalog with Pagination, Category Filter, and Search
   */
  getProducts: function(params) {
    var filter = {};
    if (params.category) filter.Category = params.category;
    if (params.status) filter.Status = params.status;

    var result = Database.findMany(CONFIG.SHEETS.PRODUCTS, {
      page: parseInt(params.page || 1, 10),
      limit: parseInt(params.limit || CONFIG.DEFAULT_PAGE_SIZE, 10),
      search: params.q || params.search || "",
      filter: filter,
      sortBy: params.sortBy || "CreatedAt",
      sortOrder: params.sortOrder || "DESC"
    });

    return responseSuccess(result.items, "Products retrieved successfully.", result.total, result.page, result.pages);
  },

  /**
   * Get Product by ID
   */
  getProductById: function(id) {
    var product = Database.findById(CONFIG.SHEETS.PRODUCTS, id);
    if (!product) {
      return responseError("Product not found.", 404);
    }
    return responseSuccess([product], "Product details retrieved.");
  },

  /**
   * Create Product
   */
  createProduct: function(payload) {
    var errors = Validation.validateProduct(payload);
    if (errors.length > 0) {
      return responseError("Validation Error: " + errors.join("; "), 422);
    }

    var cleanPayload = Validation.sanitizePayload(payload);
    var created = Database.create(CONFIG.SHEETS.PRODUCTS, cleanPayload);
    return responseSuccess([created], "Product created successfully.", 1, 1, 1, 201);
  },

  /**
   * Update Product
   */
  updateProduct: function(id, payload) {
    var cleanPayload = Validation.sanitizePayload(payload);
    var updated = Database.update(CONFIG.SHEETS.PRODUCTS, id, cleanPayload);
    if (!updated) {
      return responseError("Product not found for update.", 404);
    }
    return responseSuccess([updated], "Product updated successfully.");
  },

  /**
   * Soft Delete Product
   */
  deleteProduct: function(id) {
    var deleted = Database.softDelete(CONFIG.SHEETS.PRODUCTS, id);
    if (!deleted) {
      return responseError("Product not found or already deleted.", 404);
    }
    return responseSuccess([], "Product moved to recycle bin (soft deleted).");
  },

  /**
   * Bulk Insert Products
   */
  bulkInsertProducts: function(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return responseError("Invalid items array for bulk insert.", 400);
    }
    var createdItems = [];
    items.forEach(function(item) {
      var created = Database.create(CONFIG.SHEETS.PRODUCTS, Validation.sanitizePayload(item));
      createdItems.push(created);
    });
    return responseSuccess(createdItems, createdItems.length + " products imported successfully.");
  }
};
