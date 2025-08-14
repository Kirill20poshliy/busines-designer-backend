import { type Options as SwaggerJsdocOptions } from "swagger-jsdoc";
import { type SwaggerUiOptions } from "swagger-ui-express";

export const swaggerOptions: SwaggerJsdocOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Business Designer API",
            version: "1.0.0",
            description: "API for Business Designer project",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/**/*.ts"],
};

export const swaggerUiOptions: SwaggerUiOptions = {
    customSiteTitle: "API Docs",
    explorer: true,
    swaggerOptions: {
        docExpansion: "list",
        filter: true,
        showRequestDuration: true,
    },
};
