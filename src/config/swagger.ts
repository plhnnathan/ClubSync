import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "ClubSync API",
    version: "1.0.0",
    description:
      "SaaS platform for football squad management and tactical performance analysis. Academic project — Web Application Architecture 2026.1",
    contact: {
      name: "ClubSync Team",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from /api/auth/login",
      },
    },
    schemas: {
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password", "clubName"],
        properties: {
          name: { type: "string", example: "Nathan Admin" },
          email: { type: "string", example: "nathan@clubsync.com" },
          password: { type: "string", example: "123456" },
          clubName: { type: "string", example: "FC ClubSync" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "nathan@clubsync.com" },
          password: { type: "string", example: "123456" },
        },
      },
      CreateAnalystInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Carlos Analyst" },
          email: { type: "string", example: "carlos@clubsync.com" },
          password: { type: "string", example: "123456" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["admin", "analyst"] },
            },
          },
        },
      },

      PlayerInput: {
        type: "object",
        required: ["name", "position", "jerseyNumber", "dominantFoot"],
        properties: {
          name: { type: "string", example: "Gabriel Silva" },
          position: {
            type: "string",
            enum: [
              "Goalkeeper",
              "Right Back",
              "Left Back",
              "Center Back",
              "Defensive Midfielder",
              "Midfielder",
              "Attacking Midfielder",
              "Right Winger",
              "Left Winger",
              "Striker",
            ],
            example: "Striker",
          },
          jerseyNumber: { type: "integer", example: 9 },
          dominantFoot: {
            type: "string",
            enum: ["Right", "Left", "Both"],
            example: "Right",
          },
          status: {
            type: "string",
            enum: ["Active", "Injured", "On Loan"],
            example: "Active",
          },
        },
      },
      Player: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6a064bb5bd3f656b862a81f0" },
          name: { type: "string", example: "Gabriel Silva" },
          position: { type: "string", example: "Striker" },
          jerseyNumber: { type: "integer", example: 9 },
          dominantFoot: { type: "string", example: "Right" },
          status: { type: "string", example: "Active" },
          clubId: { type: "string", example: "6a0644df8b6eb3e954e3489f" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      MatchReportInput: {
        type: "object",
        required: [
          "playerId",
          "opponent",
          "matchDate",
          "minutesPlayed",
          "sofascoreRating",
        ],
        properties: {
          playerId: { type: "string", example: "6a064bb5bd3f656b862a81f0" },
          opponent: { type: "string", example: "FC Rival" },
          matchDate: { type: "string", format: "date", example: "2026-05-10" },
          minutesPlayed: { type: "integer", example: 90 },
          goals: { type: "integer", example: 2 },
          assists: { type: "integer", example: 1 },
          sofascoreRating: { type: "number", example: 8.5 },
        },
      },
      MatchReport: {
        type: "object",
        properties: {
          _id: { type: "string" },
          playerId: { type: "object" },
          clubId: { type: "string" },
          opponent: { type: "string", example: "FC Rival" },
          matchDate: { type: "string", format: "date-time" },
          minutesPlayed: { type: "integer", example: 90 },
          goals: { type: "integer", example: 2 },
          assists: { type: "integer", example: 1 },
          sofascoreRating: { type: "number", example: 8.5 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Error description" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new admin and create a club",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Account created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: { description: "Missing required fields" },
          409: { description: "Email already in use" },
          500: { description: "Internal server error" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: { description: "Missing required fields" },
          401: { description: "Invalid credentials" },
          500: { description: "Internal server error" },
        },
      },
    },
    "/api/auth/analysts": {
      post: {
        tags: ["Auth"],
        summary: "Create an analyst user (admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAnalystInput" },
            },
          },
        },
        responses: {
          201: { description: "Analyst created successfully" },
          400: { description: "Missing required fields" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden — admin only" },
          409: { description: "Email already in use" },
        },
      },
    },

    "/api/players": {
      get: {
        tags: ["Players"],
        summary: "List all players from your club",
        responses: {
          200: {
            description: "List of players",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Player" },
                    },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Players"],
        summary: "Create a new player (admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlayerInput" },
            },
          },
        },
        responses: {
          201: { description: "Player created successfully" },
          400: { description: "Missing required fields" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden — admin only" },
          409: { description: "Jersey number already in use" },
        },
      },
    },
    "/api/players/{id}": {
      get: {
        tags: ["Players"],
        summary: "Get a player by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "6a064bb5bd3f656b862a81f0",
          },
        ],
        responses: {
          200: {
            description: "Player found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Player" } },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Player not found" },
        },
      },
      patch: {
        tags: ["Players"],
        summary: "Update a player (admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlayerInput" },
            },
          },
        },
        responses: {
          200: { description: "Player updated successfully" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden — admin only" },
          404: { description: "Player not found" },
        },
      },
      delete: {
        tags: ["Players"],
        summary: "Delete a player (admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          204: { description: "Player deleted successfully" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden — admin only" },
          404: { description: "Player not found" },
        },
      },
    },
    "/api/players/{id}/stats": {
      get: {
        tags: ["Players"],
        summary: "Get player performance stats",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Player stats returned successfully" },
          401: { description: "Unauthorized" },
          404: { description: "Player not found" },
        },
      },
    },

    "/api/match-reports": {
      get: {
        tags: ["Match Reports"],
        summary: "List all match reports from your club",
        responses: {
          200: {
            description: "List of match reports",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/MatchReport" },
                    },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Match Reports"],
        summary: "Create a match report (admin + analyst)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MatchReportInput" },
            },
          },
        },
        responses: {
          201: { description: "Match report created successfully" },
          400: { description: "Missing required fields" },
          401: { description: "Unauthorized" },
          404: { description: "Player not found" },
        },
      },
    },
    "/api/match-reports/{id}": {
      get: {
        tags: ["Match Reports"],
        summary: "Get a match report by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Match report found" },
          401: { description: "Unauthorized" },
          404: { description: "Match report not found" },
        },
      },
      patch: {
        tags: ["Match Reports"],
        summary: "Update a match report (admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MatchReportInput" },
            },
          },
        },
        responses: {
          200: { description: "Match report updated successfully" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden — admin only" },
          404: { description: "Match report not found" },
        },
      },
      delete: {
        tags: ["Match Reports"],
        summary: "Delete a match report (admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          204: { description: "Match report deleted successfully" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden — admin only" },
          404: { description: "Match report not found" },
        },
      },
    },
    "/api/match-reports/player/{playerId}": {
      get: {
        tags: ["Match Reports"],
        summary: "Get all match reports for a specific player",
        parameters: [
          {
            name: "playerId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Match reports for the player" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("📄 Swagger docs available at http://localhost:3000/api/docs");
};

export default setupSwagger;
