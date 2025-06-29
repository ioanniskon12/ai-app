// pages/api/auth/[...nextauth].js - Fixed NextAuth configuration with standardized imports
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User"; // ✅ Fixed import path - standardized to @/models/
import { logger } from "@/lib/logger";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is required");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXTAUTH_URL environment variable is required in production"
  );
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        logger.debug("Credentials authorization attempt", {
          email: credentials?.email,
        });

        if (!credentials?.email || !credentials?.password) {
          logger.warn("Authorization failed: Missing credentials");
          throw new Error("Please enter both email and password");
        }

        try {
          await dbConnect();
          logger.debug("Database connected for authentication");

          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          }).select("+password");

          if (!user) {
            logger.warn("Authorization failed: User not found", {
              email: credentials.email,
            });
            throw new Error("No account found with this email address");
          }

          if (!user.password) {
            logger.warn("Authorization failed: No password set", {
              email: credentials.email,
            });
            throw new Error("Please use social login or reset your password");
          }

          // Check if account is locked
          if (user.isLocked) {
            logger.warn("Authorization failed: Account locked", {
              email: credentials.email,
            });
            throw new Error(
              "Account is temporarily locked due to too many failed login attempts"
            );
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            logger.warn("Authorization failed: Invalid password", {
              email: credentials.email,
            });

            // Update login attempts
            await user.updateLoginAttempts(false);

            throw new Error("Invalid password");
          }

          // Update login attempts and last login on success
          await user.updateLoginAttempts(true);

          logger.auth("User logged in successfully", user._id.toString(), {
            email: user.email,
            method: "credentials",
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || "user",
          };
        } catch (error) {
          logger.error("Authorization error", error, {
            email: credentials.email,
            method: "credentials",
          });
          throw error;
        }
      },
    }),

    // Only include OAuth providers if environment variables are set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),

    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      logger.debug("JWT callback triggered", {
        email: token.email,
        provider: account?.provider,
      });

      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.name = user.name;
        token.image = user.image;
      }

      // Handle OAuth sign in
      if (account?.provider && account.provider !== "credentials") {
        try {
          await dbConnect();

          let dbUser = await User.findOne({
            email: token.email?.toLowerCase(),
          });

          if (!dbUser) {
            // Generate a secure random password for OAuth users
            const randomPassword = await bcrypt.hash(
              Math.random().toString(36).slice(-8) + Date.now().toString(36),
              10
            );

            // Create user with all required fields
            dbUser = await User.create({
              email: token.email.toLowerCase(),
              name: token.name || token.email.split("@")[0],
              password: randomPassword, // Required field, but won't be used for OAuth
              image: token.picture || token.image,
              role: "user",
              emailVerified: true,
              lastLogin: new Date(),
              createdAt: new Date(),
              // Set OAuth account info
              socialAccounts: {
                [account.provider]: {
                  id: account.providerAccountId,
                  email: token.email,
                },
              },
              metadata: {
                source: "oauth",
                referrer: account.provider,
              },
            });

            logger.auth("OAuth user created", dbUser._id.toString(), {
              email: dbUser.email,
              provider: account.provider,
            });
          } else {
            // Update existing user info
            dbUser.name = token.name || dbUser.name;
            dbUser.image = token.picture || token.image || dbUser.image;
            dbUser.lastLogin = new Date();
            dbUser.emailVerified = true; // OAuth accounts are pre-verified

            // Update social account info
            if (!dbUser.socialAccounts) {
              dbUser.socialAccounts = {};
            }
            dbUser.socialAccounts[account.provider] = {
              id: account.providerAccountId,
              email: token.email,
            };

            await dbUser.save();

            logger.auth("OAuth user updated", dbUser._id.toString(), {
              email: dbUser.email,
              provider: account.provider,
            });
          }

          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        } catch (error) {
          logger.error("OAuth user creation/update error", error, {
            email: token.email,
            provider: account?.provider,
          });
          // Don't throw - let the user sign in even if DB update fails
        }
      }

      return token;
    },

    async session({ session, token }) {
      logger.debug("Session callback triggered", { email: token.email });

      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
        session.user.name = token.name;
        session.user.image = token.image;
      }

      return session;
    },

    async signIn({ user, account, profile, email, credentials }) {
      logger.debug("SignIn callback triggered", {
        provider: account?.provider,
        email: user?.email,
      });

      // Allow all sign ins - we handle user creation in JWT callback
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Cookies configuration for production
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.NEXTAUTH_URL?.includes("vercel.app")
              ? ".vercel.app"
              : undefined
            : undefined,
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      logger.auth("User signed in", user.id, {
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },

    async signOut({ session, token }) {
      logger.auth("User signed out", token?.id, {
        email: token?.email,
      });
    },

    async createUser({ user }) {
      logger.auth("User created", user.id, {
        email: user.email,
      });
    },

    async updateUser({ user }) {
      logger.auth("User updated", user.id, {
        email: user.email,
      });
    },

    async linkAccount({ user, account, profile }) {
      logger.auth("Account linked", user.id, {
        email: user.email,
        provider: account.provider,
      });
    },

    async session({ session, token }) {
      // This runs whenever a session is checked
      if (process.env.NODE_ENV === "development") {
        logger.debug("Session accessed", {
          userId: token?.id,
          email: token?.email,
        });
      }
    },
  },

  // Custom error handling
  logger: {
    error(code, metadata) {
      logger.error(`NextAuth Error: ${code}`, null, metadata);
    },
    warn(code) {
      logger.warn(`NextAuth Warning: ${code}`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        logger.debug(`NextAuth Debug: ${code}`, metadata);
      }
    },
  },
};

export default NextAuth(authOptions);
