# Error Handling Utilities

This module provides error handling solutions for Express 5.x controllers.

## Express 5.x Error Handling

Express 5.x **automatically catches errors from async functions**! This means you can write async controllers without any wrappers and errors will be automatically caught by the error middleware.

## Approach

### Express 5.x Middleware (Recommended)

The `errorHandlerMiddleware` is registered globally in `server.ts` and automatically handles all errors, including async errors.

```typescript
// In server.ts
import { errorHandlerMiddleware } from "./utils/errorHandler.ts";

app.use(errorHandlerMiddleware);
```

**Benefits:**

- Zero boilerplate in controllers
- Catches all async errors automatically (Express 5.x feature)
- Consistent error responses
- Works with any async/await code
- No need for wrapper functions

## Usage

### Async Controllers (Express 5.x)

Simply write your controllers without any wrappers:

```typescript
export const createBoardController = async (req: Request, res: Response) => {
  const validatedData = schema.parse(req.body);
  // Your controller logic here
  res.json(result);
};
```

Any errors (Zod validation, database errors, thrown errors) will be automatically caught and handled by the middleware.

### Sync Controllers

```typescript
export const syncController = (req: Request, res: Response) => {
  const validatedData = schema.parse(req.body);
  // Your controller logic here
  res.json(result);
};
```

## Error Response Format

### Zod Validation Errors (400)

```json
{
  "error": "Invalid request data",
  "details": [
    {
      "code": "invalid_string",
      "message": "Board name is required",
      "path": ["name"]
    }
  ]
}
```

### Internal Server Errors (500)

```json
{
  "error": "Internal server error"
}
```

## Migration Guide

To migrate existing controllers:

1. Remove all try-catch blocks
2. Keep Zod schema validation (it will be handled automatically)
3. That's it! Express 5.x middleware handles everything else

## Example Migration

**Before:**

```typescript
export const createBoardController = async (req: Request, res: Response) => {
  try {
    const validatedData = schema.parse(req.body);
    // ... logic
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid request data", details: error.issues });
      return;
    }
    console.error("Failed to create board:", error);
    res.status(500).json({ error: "Failed to create board" });
  }
};
```

**After:**

```typescript
export const createBoardController = async (req: Request, res: Response) => {
  const validatedData = schema.parse(req.body);
  // ... logic
  res.json(result);
};
```

## Express 5.x Features

- ✅ **Automatic async error catching**: No wrappers needed
- ✅ **Built-in promise rejection handling**: Thrown errors are caught
- ✅ **Improved error middleware**: Better error propagation
- ✅ **Backward compatibility**: Still works with sync controllers

## Why This Approach?

Express 5.x introduced automatic async error handling, eliminating the need for wrapper functions or try-catch blocks in controllers. This makes the code much cleaner and more maintainable.
