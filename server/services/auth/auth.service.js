"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Errors } = require("moleculer");

const {
  Account,
  User,
  Shop,
  userDb,
} = require("../user/user.db");

const {
  ACCOUNT_STATUS,
  ACCOUNT_TYPE,
} = require("../../utils/constants");

const JWT_SECRET = process.env.JWT_SECRET || "metamarket_local_secret_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function clientError(message, code = 400, type = "AUTH_ERROR", data = {}) {
  return new Errors.MoleculerClientError(message, code, type, data);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeBcryptHash(hash) {
  if (!hash) return hash;

  // PHP password_hash thường tạo prefix $2y$.
  // bcryptjs xử lý ổn hơn với $2a$/$2b$, nên đổi tạm khi compare.
  if (hash.startsWith("$2y$")) {
    return "$2a$" + hash.slice(4);
  }

  return hash;
}

function getBearerToken(ctx) {
  const authorization =
    ctx.meta?.authorization ||
    ctx.meta?.headers?.authorization ||
    ctx.params?.authorization ||
    "";

  if (!authorization) return "";

  return String(authorization).replace(/^Bearer\s+/i, "").trim();
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

module.exports = {
  name: "auth",

  actions: {
    async register(ctx) {
      const email = normalizeEmail(ctx.params.email);
      const password = String(ctx.params.password || "");
      const fullname = String(ctx.params.fullname || "").trim();
      const phone = ctx.params.phone ? String(ctx.params.phone).trim() : null;

      if (!email || !password || !fullname) {
        throw clientError("Email, password and fullname are required");
      }

      const existedAccount = await Account.findOne({
        where: { email },
      });

      if (existedAccount) {
        throw clientError("Email already exists", 409, "EMAIL_EXISTS");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const account = await Account.create({
        email,
        password: hashedPassword,
        type: ACCOUNT_TYPE.CUSTOMER,
        status: ACCOUNT_STATUS.ACTIVE,
      });

      const user = await User.create({
        accountId: account.accountId,
        fullname,
        phone,
      });

      const tokenPayload = {
        accountId: account.accountId,
        userId: user.userId,
        role: account.type,
        type: account.type,
        email: account.email,
        status: account.status,
      };

      const token = signToken(tokenPayload);

      return {
        success: true,
        token,
        account: {
          accountId: account.accountId,
          email: account.email,
          type: account.type,
          status: account.status,
        },
        user: {
          userId: user.userId,
          fullname: user.fullname,
          phone: user.phone,
        },
      };
    },

    async login(ctx) {
      const email = normalizeEmail(ctx.params.email);
      const password = String(ctx.params.password || "");

      if (!email || !password) {
        throw clientError("Email and password are required");
      }

      const account = await Account.findOne({
        where: { email },
      });

      if (!account) {
        throw clientError("Account not found", 404, "ACCOUNT_NOT_FOUND");
      }

      if (Number(account.status) === ACCOUNT_STATUS.WAITING_APPROVAL) {
        throw clientError("Account is waiting for approval", 403, "WAITING_APPROVAL");
      }

      if (Number(account.status) === ACCOUNT_STATUS.LOCKED) {
        throw clientError("Account is locked", 403, "ACCOUNT_LOCKED");
      }

      if (!account.password) {
        throw clientError("This account does not have local password", 400, "NO_LOCAL_PASSWORD");
      }

      const safeHash = normalizeBcryptHash(account.password);
      const isValidPassword = await bcrypt.compare(password, safeHash);

      if (!isValidPassword) {
        throw clientError("Invalid password", 401, "INVALID_PASSWORD");
      }

      let userId = null;
      let shopId = null;
      let profile = null;

      if (Number(account.type) === ACCOUNT_TYPE.CUSTOMER) {
        profile = await User.findOne({
          where: { accountId: account.accountId },
        });

        if (profile) {
          userId = profile.userId;
        }
      }

      if (Number(account.type) === ACCOUNT_TYPE.SHOP) {
        profile = await Shop.findOne({
          where: { accountId: account.accountId },
        });

        if (profile) {
          shopId = profile.shopId;
          userId = profile.shopId;
        }
      }

      const tokenPayload = {
        accountId: account.accountId,
        userId,
        shopId,
        role: account.type,
        type: account.type,
        email: account.email,
        status: account.status,
      };

      const token = signToken(tokenPayload);

      return {
        success: true,
        token,
        account: {
          accountId: account.accountId,
          email: account.email,
          type: account.type,
          status: account.status,
        },
        profile: profile ? profile.toJSON() : null,
        userId,
        shopId,
      };
    },

    async verifyToken(ctx) {
      const token = ctx.params.token || getBearerToken(ctx);

      if (!token) {
        throw clientError("Token is required", 400, "TOKEN_REQUIRED");
      }

      try {
        const payload = jwt.verify(token, JWT_SECRET);

        return {
          valid: true,
          payload,
        };
      } catch (err) {
        return {
          valid: false,
          message: err.message,
        };
      }
    },

    async me(ctx) {
      const token = ctx.params.token || getBearerToken(ctx);

      if (!token) {
        throw clientError("Token is required", 400, "TOKEN_REQUIRED");
      }

      let payload;

      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        throw clientError("Invalid token", 401, "INVALID_TOKEN", {
          message: err.message,
        });
      }

      const account = await Account.findOne({
        where: { accountId: payload.accountId },
      });

      if (!account) {
        throw clientError("Account not found", 404, "ACCOUNT_NOT_FOUND");
      }

      return {
        account: {
          accountId: account.accountId,
          email: account.email,
          type: account.type,
          status: account.status,
        },
        payload,
      };
    },
  },

  async started() {
    await userDb.sync();
    this.logger.info("Auth service started");
  },
};