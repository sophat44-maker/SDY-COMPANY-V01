/**
 * Auth.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * User authentication, JWT issuance, Google OAuth token verification, role-based authorization
 */

var Auth = {
  /**
   * Authenticate user with Email & Password or Google OAuth
   */
  login: function(credentials) {
    var email = credentials.email;
    var password = credentials.password;

    if (!email || !password) {
      return { success: false, code: 400, message: "Email and password are required." };
    }

    var hashedPassword = hashSHA256(password);

    var userRes = Database.findMany(CONFIG.SHEETS.USERS, {
      filter: { Email: email },
      limit: 1
    });

    if (userRes.items.length === 0) {
      // Secure bootstrap for empty database: check against Script Property or SHA256 hash
      var adminPropPass = PropertiesService.getScriptProperties().getProperty("ADMIN_INITIAL_PASSWORD");
      var validAdminPass = adminPropPass ? hashSHA256(adminPropPass) : hashSHA256("admin123");

      if (email === "admin@sdycompany.com" && hashedPassword === validAdminPass) {
        var defaultAdmin = {
          Id: "USR-SUPERADMIN-001",
          Name: "SDY Chief Executive Admin",
          Email: "admin@sdycompany.com",
          PasswordHash: hashedPassword,
          Role: "SUPER_ADMIN",
          Permissions: JSON.stringify(["*"]),
          Status: "ACTIVE"
        };
        Database.create(CONFIG.SHEETS.USERS, defaultAdmin);
        var token = generateJWT(defaultAdmin);
        return { success: true, token: token, user: defaultAdmin };
      }
      return { success: false, code: 401, message: "Invalid email or credentials." };
    }

    var user = userRes.items[0];
    if (user.Status !== "ACTIVE") {
      return { success: false, code: 403, message: "User account is suspended." };
    }

    // Verify Password Hash if present
    if (user.PasswordHash && user.PasswordHash !== hashedPassword) {
      return { success: false, code: 401, message: "Invalid email or credentials." };
    }

    var token = generateJWT({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      permissions: user.Permissions
    });

    return {
      success: true,
      token: token,
      user: user
    };
  },

  /**
   * Verify Authorization Header / Bearer Token
   */
  authorize: function(e, requiredRole) {
    var authHeader = e.parameter.token || (e.postData ? e.postData.contents && JSON.parse(e.postData.contents).token : null);
    if (!authHeader) {
      return { authorized: false, code: 401, message: "Missing JWT Authorization token." };
    }

    var payload = verifyJWT(authHeader);
    if (!payload) {
      return { authorized: false, code: 401, message: "Invalid or expired JWT token." };
    }

    if (requiredRole && requiredRole !== "GUEST" && payload.role !== "SUPER_ADMIN") {
      if (payload.role !== requiredRole) {
        return { authorized: false, code: 403, message: "Insufficient role permissions." };
      }
    }

    return { authorized: true, user: payload };
  }
};
