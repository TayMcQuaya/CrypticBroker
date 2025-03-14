# CrypticBroker API Documentation

This document provides detailed information about the CrypticBroker API endpoints, request and response formats.

## Base URL

All endpoints are relative to the base URL:

```
http://localhost:5000/api
```

## Authentication

### Register a new user

Create a new user account.

**URL**: `/auth/signup`  
**Method**: `POST`  
**Auth required**: No

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John", 
  "lastName": "Doe",
  "role": "PROJECT_OWNER" // Optional, defaults to PROJECT_OWNER
}
```

**Successful Response**:

```json
{
  "status": "success",
  "token": "jwt-token-here",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PROJECT_OWNER",
      "isEmailVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Login

Log in with existing credentials.

**URL**: `/auth/login`  
**Method**: `POST`  
**Auth required**: No

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Successful Response**:

```json
{
  "status": "success",
  "token": "jwt-token-here",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PROJECT_OWNER",
      "isEmailVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Current User Profile

Retrieve the profile of the currently authenticated user.

**URL**: `/auth/me`  
**Method**: `GET`  
**Auth required**: Yes (JWT Token)

**Headers**:

```
Authorization: Bearer jwt-token-here
```

**Successful Response**:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PROJECT_OWNER",
      "isEmailVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Update User Profile

Update the profile of the currently authenticated user.

**URL**: `/auth/updateMe`  
**Method**: `PATCH`  
**Auth required**: Yes (JWT Token)

**Headers**:

```
Authorization: Bearer jwt-token-here
```

**Request Body**:

```json
{
  "firstName": "Updated",
  "lastName": "Name"
}
```

**Successful Response**:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "Updated",
      "lastName": "Name",
      "role": "PROJECT_OWNER",
      "isEmailVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

## Error Responses

All endpoints can return the following error responses:

### 400 Bad Request

```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Error message explaining the issue"
}
```

### 401 Unauthorized

```json
{
  "status": "fail",
  "statusCode": 401,
  "message": "You are not logged in. Please log in to get access."
}
```

### 403 Forbidden

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found

```json
{
  "status": "fail",
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Internal Server Error"
}
``` 