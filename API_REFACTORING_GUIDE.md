# 🔄 API Refactoring Guide - Quick Reference

This guide shows how to refactor existing API endpoints to use the new production-ready patterns.

---

## 📝 Refactoring Checklist

For each API endpoint, apply these changes:

- [ ] Import new utilities (`errors`, `validation`, `middleware`, `config`)
- [ ] Replace try-catch with `handleError` / `handleSuccess`
- [ ] Add input validation with `validateFields`
- [ ] Add input sanitization
- [ ] Add authentication where needed
- [ ] Use typed database queries
- [ ] Remove `console.error` / `console.log`
- [ ] Test the refactored endpoint

---

## 🎯 Pattern Templates

### Template 1: Public Endpoint (No Auth Required)

```typescript
import { NextRequest } from 'next/server';
import { executeQuery } from '@/lib/database';
import { handleError, handleSuccess, ValidationError } from '@/lib/errors';
import { validateFields, validateEmail, sanitizeEmail } from '@/lib/validation';
import { HTTP_STATUS } from '@/lib/config';

interface RequestBody {
  email: string;
  name: string;
}

interface DbRecord {
  id: number;
  email: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await request.json();

    // Validate inputs
    validateFields([
      { result: validateRequired(body.email, 'Email'), field: 'email' },
      { result: validateEmail(body.email), field: 'email' },
      { result: validateRequired(body.name, 'Name'), field: 'name' },
    ]);

    // Sanitize inputs
    const email = sanitizeEmail(body.email);
    const name = sanitizeString(body.name);

    // Execute database query with type safety
    const result = await executeQuery<DbRecord[]>(
      'SELECT * FROM table WHERE email = ?',
      [email]
    );

    // Return success response
    return handleSuccess(result, 'Operation successful', HTTP_STATUS.OK);
    
  } catch (error) {
    return handleError(error as Error);
  }
}
```

### Template 2: Protected Endpoint (Auth Required)

```typescript
import { NextRequest } from 'next/server';
import { executeQuery } from '@/lib/database';
import { handleError, handleSuccess } from '@/lib/errors';
import { createAuthContext } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = createAuthContext(request);
    
    // Get authenticated user data
    const userId = auth.user.userId;
    const userRole = auth.user.role;

    // Query database
    const data = await executeQuery(
      'SELECT * FROM table WHERE user_id = ?',
      [userId]
    );

    return handleSuccess(data, 'Data retrieved successfully');
    
  } catch (error) {
    return handleError(error as Error);
  }
}
```

### Template 3: Admin-Only Endpoint

```typescript
import { NextRequest } from 'next/server';
import { executeQuery } from '@/lib/database';
import { handleError, handleSuccess } from '@/lib/errors';
import { createAuthContext } from '@/lib/middleware';

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate and require admin role
    const auth = createAuthContext(request);
    auth.requireAdmin();

    // Get ID from URL
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      throw new ValidationError('ID is required');
    }

    // Delete from database
    await executeQuery('DELETE FROM table WHERE id = ?', [id]);

    return handleSuccess({ deleted: true }, 'Deleted successfully');
    
  } catch (error) {
    return handleError(error as Error);
  }
}
```

### Template 4: Role-Based Access (Multiple Roles)

```typescript
import { NextRequest } from 'next/server';
import { executeQuery } from '@/lib/database';
import { handleError, handleSuccess } from '@/lib/errors';
import { createAuthContext, UserRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = createAuthContext(request);
    
    // Allow both admin and vendor roles
    auth.requireRole([UserRole.ADMIN, UserRole.VENDOR]);

    // Query based on role
    let query = 'SELECT * FROM table';
    const params: any[] = [];
    
    if (auth.isVendor) {
      query += ' WHERE vendor_id = ?';
      params.push(auth.user.userId);
    }

    const data = await executeQuery(query, params);

    return handleSuccess(data, 'Data retrieved successfully');
    
  } catch (error) {
    return handleError(error as Error);
  }
}
```

### Template 5: Owner-Based Authorization

```typescript
import { NextRequest } from 'next/server';
import { executeQuery } from '@/lib/database';
import { handleError, handleSuccess, NotFoundError } from '@/lib/errors';
import { createAuthContext } from '@/lib/middleware';

export async function PUT(request: NextRequest) {
  try {
    // Authenticate
    const auth = createAuthContext(request);
    
    // Get resource ID
    const resourceId = parseInt(request.nextUrl.searchParams.get('id') || '');
    
    // Check resource exists and get owner
    const resources = await executeQuery<{ owner_id: number }[]>(
      'SELECT owner_id FROM table WHERE id = ?',
      [resourceId]
    );
    
    if (resources.length === 0) {
      throw new NotFoundError('Resource not found');
    }

    // Require admin or owner
    auth.requireOwner(resources[0].owner_id);

    // Update resource
    const body = await request.json();
    await executeQuery(
      'UPDATE table SET data = ? WHERE id = ?',
      [body.data, resourceId]
    );

    return handleSuccess({ updated: true }, 'Updated successfully');
    
  } catch (error) {
    return handleError(error as Error);
  }
}
```

### Template 6: Transaction with Multiple Operations

```typescript
import { NextRequest } from 'next/server';
import { executeInTransaction } from '@/lib/database';
import { handleError, handleSuccess } from '@/lib/errors';
import { createAuthContext } from '@/lib/middleware';
import { HTTP_STATUS } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const auth = createAuthContext(request);
    const body = await request.json();

    // Validate inputs
    validateFields([
      { result: validateRequired(body.field1, 'Field1'), field: 'field1' },
      { result: validateRequired(body.field2, 'Field2'), field: 'field2' },
    ]);

    // Execute in transaction (auto-commits on success, auto-rollbacks on error)
    const result = await executeInTransaction(async (connection) => {
      // Insert into first table
      const [result1] = await connection.execute(
        'INSERT INTO table1 (data) VALUES (?)',
        [body.field1]
      );
      const id1 = (result1 as any).insertId;

      // Insert into second table
      await connection.execute(
        'INSERT INTO table2 (parent_id, data) VALUES (?, ?)',
        [id1, body.field2]
      );

      return { id: id1, created: true };
    });

    return handleSuccess(result, 'Created successfully', HTTP_STATUS.CREATED);
    
  } catch (error) {
    return handleError(error as Error);
  }
}
```

### Template 7: File Upload with Validation

```typescript
import { NextRequest } from 'next/server';
import { handleError, handleSuccess } from '@/lib/errors';
import { validateFile } from '@/lib/validation';
import { UPLOAD_CONFIG } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file
    validateFields([
      { 
        result: validateFile(file, {
          maxSize: UPLOAD_CONFIG.maxFileSize,
          allowedTypes: UPLOAD_CONFIG.allowedImageTypes,
          fieldName: 'File',
        }), 
        field: 'file' 
      },
    ]);

    // Process file...
    // (your file processing logic)

    return handleSuccess({ uploaded: true }, 'File uploaded successfully');
    
  } catch (error) {
    return handleError(error as Error);
  }
}
```

---

## 🔍 Common Validation Patterns

### Email Validation
```typescript
validateFields([
  { result: validateRequired(email, 'Email'), field: 'email' },
  { result: validateEmail(email), field: 'email' },
]);
const cleanEmail = sanitizeEmail(email);
```

### Phone Validation
```typescript
validateFields([
  { result: validateRequired(phone, 'Phone'), field: 'phone' },
  { result: validatePhone(phone), field: 'phone' },
]);
const cleanPhone = sanitizePhone(phone);
```

### Password Validation
```typescript
validateFields([
  { result: validateRequired(password, 'Password'), field: 'password' },
  { result: validatePassword(password), field: 'password' },
]);
```

### Amount Validation
```typescript
validateFields([
  { result: validateRequired(amount, 'Amount'), field: 'amount' },
  { result: validateDonationAmount(amount), field: 'amount' },
]);
const numAmount = parseFloat(amount);
```

### Enum Validation
```typescript
const allowedStatuses = ['pending', 'approved', 'rejected'] as const;
validateFields([
  { result: validateEnum(status, allowedStatuses, 'Status'), field: 'status' },
]);
```

---

## ⚠️ Common Pitfalls

### ❌ Don't Do This:
```typescript
// Using console.error
console.error('Error:', error);

// Inconsistent error responses
return NextResponse.json({ error: 'Failed' }, { status: 500 });

// No validation
const email = body.email; // Might be undefined or malicious

// Using 'any' type
const users = await executeQuery(query) as any[];

// Exposing sensitive errors
return NextResponse.json({ error: error.message }, { status: 500 });
```

### ✅ Do This Instead:
```typescript
// Use structured logging
logError(error as Error, { context: 'User registration failed' });

// Use standardized responses
return handleError(error as Error);

// Validate and sanitize
validateFields([{ result: validateEmail(body.email), field: 'email' }]);
const email = sanitizeEmail(body.email);

// Use proper types
interface User { id: number; email: string; }
const users = await executeQuery<User[]>(query);

// Use error classes
throw new ValidationError('Invalid email format');
```

---

## 🚀 Quick Refactoring Steps

1. **Add Imports**
   ```typescript
   import { handleError, handleSuccess, ValidationError } from '@/lib/errors';
   import { validateFields, validateEmail, sanitizeEmail } from '@/lib/validation';
   import { createAuthContext } from '@/lib/middleware';
   import { HTTP_STATUS } from '@/lib/config';
   ```

2. **Wrap in Try-Catch**
   ```typescript
   export async function POST(request: NextRequest) {
     try {
       // your code
       return handleSuccess(data, 'Success message');
     } catch (error) {
       return handleError(error as Error);
     }
   }
   ```

3. **Add Authentication (if needed)**
   ```typescript
   const auth = createAuthContext(request);
   auth.requireAdmin(); // or requireVendor(), requireNGO(), etc.
   ```

4. **Add Validation**
   ```typescript
   const body = await request.json();
   validateFields([
     { result: validateRequired(body.field, 'Field'), field: 'field' },
     { result: validateEmail(body.field), field: 'field' },
   ]);
   ```

5. **Sanitize Inputs**
   ```typescript
   const cleanEmail = sanitizeEmail(body.email);
   const cleanName = sanitizeString(body.name);
   ```

6. **Use Typed Queries**
   ```typescript
   interface User { id: number; email: string; }
   const users = await executeQuery<User[]>(query, params);
   ```

7. **Remove Console Statements**
   ```typescript
   // Replace console.error with throw
   throw new ValidationError('Message');
   
   // Or use structured logging
   logInfo('Info message', { context: { userId: 123 } });
   ```

8. **Test**
   - Test with valid inputs
   - Test with invalid inputs
   - Test authentication/authorization
   - Test error cases

---

## 📚 Reference

- **Configuration**: `lib/config.ts`
- **Errors**: `lib/errors.ts`
- **Validation**: `lib/validation.ts`
- **Middleware**: `lib/middleware.ts`
- **Database**: `lib/database.ts`
- **Example**: `app/api/auth/login/route.ts` (refactored)

---

## ✅ Success Criteria

An endpoint is properly refactored when:

- ✅ Uses `handleError` and `handleSuccess`
- ✅ Has input validation for all user inputs
- ✅ Sanitizes strings/emails/phones before use
- ✅ Uses authentication where appropriate
- ✅ Uses typed database queries
- ✅ Has no `console.error` or `console.log`
- ✅ Throws appropriate error classes
- ✅ Returns consistent response format
- ✅ Compiles without TypeScript errors
- ✅ Works correctly with valid/invalid inputs

---

**Need Help?** Refer to the templates above or check the refactored `app/api/auth/login/route.ts` for a complete example.
