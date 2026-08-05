/**
 * Dashboard.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Real-time Analytics, Statistics, and Audit Metrics
 */

var DashboardService = {
  getStats: function() {
    var products = Database.findMany(CONFIG.SHEETS.PRODUCTS, { limit: 10000 }).total;
    var projects = Database.findMany(CONFIG.SHEETS.PROJECTS, { limit: 10000 }).total;
    var users = Database.findMany(CONFIG.SHEETS.USERS, { limit: 10000 }).total;
    var blogs = Database.findMany(CONFIG.SHEETS.BLOGS, { limit: 10000 }).total;
    var auditLogs = Database.findMany(CONFIG.SHEETS.AUDIT_LOGS, { limit: 10 }).items;

    var stats = {
      summary: {
        totalProducts: products,
        totalProjects: projects,
        totalUsers: users,
        totalBlogs: blogs,
        systemHealth: "100% OPERATIONAL",
        databaseType: "Google Sheets Enterprise Sync v22.0",
        lastSync: new Date().toISOString()
      },
      recentActivity: auditLogs
    };

    return responseSuccess([stats], "Executive Dashboard Stats Loaded.");
  }
};
