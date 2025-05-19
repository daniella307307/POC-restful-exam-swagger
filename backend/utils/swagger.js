const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parking Management System API',
      version: '1.0.0',
      description: 'API documentation for the Parking Management System.',
    },
    servers: [
      {
        url: 'http://localhost:8080', // Your API base URL
        description: 'Development server'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { // Arbitrary name for the security scheme
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional, for documentation purposes
        }
      }
    },
    security: [ // Global security definition (can be overridden per-path)
      {
        bearerAuth: []
      }
    ],
  },
  // Path to the API docs (JSDoc comments)
  apis: ['./routes/*.js', './controllers/*.js'], // Adjust paths as needed
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
