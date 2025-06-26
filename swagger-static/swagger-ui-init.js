
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "tags": [
            "App"
          ]
        }
      },
      "/api/users/{id}": {
        "get": {
          "operationId": "UsersController_getById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserViewDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Users"
          ]
        },
        "put": {
          "operationId": "UsersController_updateUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateUserInputDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserViewDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Users"
          ]
        },
        "delete": {
          "operationId": "UsersController_deleteUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Users"
          ]
        }
      },
      "/api/users": {
        "get": {
          "operationId": "UsersController_getAll",
          "parameters": [
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string",
                "enum": [
                  "createdAt",
                  "login",
                  "email"
                ]
              }
            },
            {
              "name": "searchLoginTerm",
              "required": true,
              "in": "query",
              "schema": {
                "nullable": true,
                "default": null,
                "type": "string"
              }
            },
            {
              "name": "searchEmailTerm",
              "required": true,
              "in": "query",
              "schema": {
                "nullable": true,
                "default": null,
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Users"
          ]
        },
        "post": {
          "operationId": "UsersController_createUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserViewDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Users"
          ]
        }
      },
      "/api/testing/all-data": {
        "delete": {
          "operationId": "TestingController_deleteAll",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Testing"
          ]
        }
      }
    },
    "info": {
      "title": "BLOGGER API",
      "description": "",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "securitySchemes": {
        "bearer": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http"
        }
      },
      "schemas": {
        "UserViewDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "login": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "createdAt": {
              "format": "date-time",
              "type": "string"
            }
          },
          "required": [
            "id",
            "login",
            "email",
            "createdAt"
          ]
        },
        "CreateUserInputDto": {
          "type": "object",
          "properties": {
            "login": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "email": {
              "type": "string"
            }
          },
          "required": [
            "login",
            "password",
            "email"
          ]
        },
        "UpdateUserInputDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string"
            }
          },
          "required": [
            "email"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
