/**
 * Category.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Specialized logic for Categories manager
 */

var CategoryService = {
  getCategories: function(params) {
    var result = Database.findMany(CONFIG.SHEETS.CATEGORIES, {
      page: parseInt(params.page || 1, 10),
      limit: parseInt(params.limit || 100, 10),
      search: params.q || ""
    });
    return responseSuccess(result.items, "Categories loaded.", result.total, result.page, result.pages);
  },

  createCategory: function(payload) {
    if (!payload.Name && !payload.CategoryName) {
      return responseError("Category Name is required.", 422);
    }
    var clean = Validation.sanitizePayload(payload);
    var created = Database.create(CONFIG.SHEETS.CATEGORIES, clean);
    return responseSuccess([created], "Category created.", 1, 1, 1, 201);
  },

  updateCategory: function(id, payload) {
    var updated = Database.update(CONFIG.SHEETS.CATEGORIES, id, Validation.sanitizePayload(payload));
    if (!updated) return responseError("Category not found.", 404);
    return responseSuccess([updated], "Category updated.");
  },

  deleteCategory: function(id) {
    var ok = Database.softDelete(CONFIG.SHEETS.CATEGORIES, id);
    if (!ok) return responseError("Category not found.", 404);
    return responseSuccess([], "Category deleted.");
  }
};
