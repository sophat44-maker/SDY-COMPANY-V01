/**
 * User.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * User Account CRUD & Role Permission Management
 */

var UserService = {
  getUsers: function(params) {
    var result = Database.findMany(CONFIG.SHEETS.USERS, {
      page: parseInt(params.page || 1, 10),
      limit: parseInt(params.limit || 50, 10),
      search: params.q || ""
    });
    return responseSuccess(result.items, "Users list loaded.", result.total, result.page, result.pages);
  },

  createUser: function(payload) {
    var errors = Validation.validateUser(payload);
    if (errors.length > 0) return responseError("Validation Error: " + errors.join(", "), 422);

    var clean = Validation.sanitizePayload(payload);
    clean.PasswordHash = hashSHA256(payload.Password || "sdy2026password");
    var created = Database.create(CONFIG.SHEETS.USERS, clean);
    return responseSuccess([created], "User account created.", 1, 1, 1, 201);
  },

  updateUser: function(id, payload) {
    var clean = Validation.sanitizePayload(payload);
    if (payload.Password) {
      clean.PasswordHash = hashSHA256(payload.Password);
    }
    var updated = Database.update(CONFIG.SHEETS.USERS, id, clean);
    if (!updated) return responseError("User not found.", 404);
    return responseSuccess([updated], "User updated successfully.");
  },

  deleteUser: function(id) {
    var ok = Database.softDelete(CONFIG.SHEETS.USERS, id);
    if (!ok) return responseError("User not found.", 404);
    return responseSuccess([], "User disabled.");
  }
};
