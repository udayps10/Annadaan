# Authentication Migration Guide
## Aadhaar-Based to Password-Based Authentication

**Date:** February 2, 2026  
**Version:** 1.0  
**Status:** Ready for Deployment

---

## Overview

This guide documents the migration from Aadhaar-based authentication to password-based authentication for individual donors in the Annadaan donation drive system. The migration is designed to be **backward compatible**, allowing existing users to continue using their Aadhaar credentials while transitioning to password-based login.

---

## Migration Strategy

### For New Users
- **Registration Requirements:**
  - Full Name
  - Phone Number
  - Email Address
  - **Password** (new requirement)
  - ~~Aadhaar Number~~ (no longer required)

### For Existing Users
1. **First Login After Update:**
   - Can still log in using Phone + Last 4 Aadhaar digits
   - System flags them as `requires_password_update = 1`
   - After successful login, redirected to password setup page
   
2. **Password Setup:**
   - Must create a strong password (8+ chars, uppercase, lowercase, number)
   - Password is hashed using bcryptjs
   - `password_hash` is saved to database
   - `requires_password_update` flag is cleared
   
3. **Subsequent Logins:**
   - Must use Phone + Password (new method)
   - Can no longer use Aadhaar authentication

---

## Database Changes

### Schema Updates

**File:** `db.sql` and `migrations/001_add_password_auth.sql`

```sql
-- Added columns to individual_donors table
ALTER TABLE `individual_donors`
  ADD COLUMN `password_hash` varchar(255) DEFAULT NULL,
  ADD COLUMN `requires_password_update` tinyint(1) DEFAULT '0',
  MODIFY COLUMN `aadhaar_number` varchar(12) DEFAULT NULL; -- Made nullable
```

### Migration Steps

1. **Run Migration Script:**
   ```bash
   mysql -u [username] -p [database_name] < migrations/001_add_password_auth.sql
   ```

2. **Verify Migration:**
   ```sql
   -- Check structure
   DESCRIBE individual_donors;
   
   -- Count existing users needing migration
   SELECT COUNT(*) as needs_password 
   FROM individual_donors 
   WHERE password_hash IS NULL;
   ```

---

## API Changes

### 1. Registration API
**Endpoint:** `/api/donation-drive/register`

**Changes:**
- Added `password` field (required)
- Made `aadhaarNumber` optional
- Added password validation (strength requirements)
- Hash password using bcryptjs before storing

**Request Body (New):**
```json
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "password": "SecurePass123",
  "aadhaarNumber": "123456789012" // Optional
}
```

### 2. Login API
**Endpoint:** `/api/donation-drive/login`

**Changes:**
- Supports dual authentication methods:
  - **Password-based** (primary): `phone` + `password`
  - **Aadhaar-based** (legacy): `phone` + `aadhaarLast4`
- Returns `requiresPasswordUpdate` flag for legacy logins
- Auto-marks users for password migration on Aadhaar login

**Request Body Options:**

**Option A - Password Login (New Users):**
```json
{
  "phone": "9876543210",
  "password": "SecurePass123"
}
```

**Option B - Aadhaar Login (Existing Users - One Time):**
```json
{
  "phone": "9876543210",
  "aadhaarLast4": "9012"
}
```

**Response (Legacy Login):**
```json
{
  "success": true,
  "data": {
    "donorId": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "requiresPasswordUpdate": true  // Triggers password setup
  },
  "message": "Login successful. Please set up your password for future logins."
}
```

### 3. Setup Password API (New)
**Endpoint:** `/api/donation-drive/setup-password`

**Purpose:** Allows existing users to set their password after Aadhaar login

**Request Body:**
```json
{
  "donorId": 123,
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donorId": 123,
    "fullName": "John Doe"
  },
  "message": "Password set successfully. You can now login with your phone number and password."
}
```

---

## Frontend Changes

### 1. Registration Page
**File:** `/app/donation-drive/register/page.tsx`

**Changes:**
- Added password input field with show/hide toggle
- Added confirm password field
- Real-time password strength validation
- Removed Aadhaar number field (simplified)
- Password requirements display

### 2. Login Page
**File:** `/app/donation-drive/login/page.tsx`

**Changes:**
- Added authentication method toggle (Password / Aadhaar)
- Conditional form fields based on selected method
- Password input with show/hide toggle
- "Legacy" label for Aadhaar option
- Warning message for Aadhaar users about password setup
- Redirect to setup page if `requiresPasswordUpdate` is true

### 3. Password Setup Page (New)
**File:** `/app/donation-drive/setup-password/page.tsx`

**Features:**
- Accessible only after Aadhaar login
- Requires active session (donorId in sessionStorage)
- Real-time password strength indicators
- Password and confirm password fields
- Clear security messaging
- Auto-redirect to donation page after setup

---

## Password Requirements

### Strength Rules
- ✓ Minimum 8 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)

### Security Implementation
- Hashing: bcryptjs with configurable rounds (default: 10)
- Storage: Only `password_hash` stored in database
- Verification: Constant-time comparison using `bcrypt.compare()`

---

## User Experience Flow

### New User Registration Flow
```
1. Visit /donation-drive/register
2. Fill form (name, phone, email, password)
3. Submit registration
4. Auto-login and redirect to /donation-drive/donate
```

### Existing User Migration Flow
```
1. Visit /donation-drive/login
2. Select "Aadhaar (Legacy)" tab
3. Enter phone + last 4 Aadhaar digits
4. Submit login
5. → Redirected to /donation-drive/setup-password
6. Set new password
7. Submit password
8. → Redirected to /donation-drive/donate
9. Next time: Use Password login tab
```

---

## Testing Checklist

### Registration Testing
- [ ] New user can register with password (no Aadhaar)
- [ ] Password validation works correctly
- [ ] Password mismatch shows error
- [ ] Weak password is rejected
- [ ] Successful registration creates hashed password
- [ ] User can login immediately after registration

### Login Testing (Password)
- [ ] New user can login with phone + password
- [ ] Wrong password shows error
- [ ] Correct credentials grant access
- [ ] Session is maintained correctly

### Login Testing (Aadhaar - Legacy)
- [ ] Existing user can login with phone + Aadhaar
- [ ] System detects requires_password_update flag
- [ ] User is redirected to password setup page
- [ ] Aadhaar login fails for users who already set password

### Password Setup Testing
- [ ] Page accessible only after Aadhaar login
- [ ] Unauthenticated access redirects to login
- [ ] Password validation works
- [ ] Successful setup updates database
- [ ] User redirected to donation page
- [ ] Next login requires password (Aadhaar disabled)

### Database Testing
- [ ] Migration script runs without errors
- [ ] Existing records have `requires_password_update = 1`
- [ ] New registrations have `requires_password_update = 0`
- [ ] Password hashes are properly stored
- [ ] Aadhaar field is nullable

---

## Rollback Plan

If issues arise, you can temporarily revert changes:

### Quick Rollback Steps
1. **API:** Restore old login/register endpoints from git
2. **Frontend:** Restore old login/register pages from git
3. **Database:** Aadhaar data is still intact (not deleted)

### Partial Rollback (Keep New Users)
- Keep password authentication active
- Re-enable Aadhaar login for ALL users (remove requiresPasswordUpdate check)
- This allows both methods to work indefinitely

---

## Security Considerations

### Strengths
✓ Strong password requirements  
✓ bcrypt hashing with salt  
✓ Configurable hash rounds  
✓ No plaintext passwords stored  
✓ Constant-time password comparison  

### Recommendations
- Enable HTTPS in production
- Implement rate limiting on login endpoint
- Add account lockout after failed attempts
- Consider adding 2FA for high-value donors
- Monitor for brute force attacks
- Implement password reset via email

---

## Deployment Instructions

### Pre-Deployment
1. Backup database
2. Test migration script on staging
3. Verify all APIs work correctly
4. Test UI flows thoroughly

### Deployment Steps
1. **Database Migration:**
   ```bash
   mysql -u username -p database < migrations/001_add_password_auth.sql
   ```

2. **Deploy Backend:**
   - Push updated API routes
   - Restart application server

3. **Deploy Frontend:**
   - Build and deploy Next.js application
   - Clear CDN cache if applicable

4. **Verification:**
   - Test new user registration
   - Test existing user login with Aadhaar
   - Test password setup flow
   - Test new password login

### Post-Deployment
- Monitor error logs
- Track password setup completion rate
- Send email notifications to existing users
- Provide support documentation

---

## Communication Plan

### User Notification
**Subject:** Important Update: New Login Method for Annadaan Donors

**Message:**
> Dear Donor,
>
> We're upgrading our security! Starting [DATE], you'll need to create a password for your account.
>
> **What you need to do:**
> 1. Log in as usual with your phone number and Aadhaar
> 2. You'll be prompted to create a secure password
> 3. From next time, just use your phone number and new password!
>
> **Why this change?**
> Passwords are more secure and convenient. You won't need to remember your Aadhaar details anymore.
>
> **Need help?** Contact us at annadaan.mission@gmail.com
>
> Thank you for your continued support!

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Password not set" error on password login  
**Solution:** User needs to complete password setup via Aadhaar login first

**Issue:** Aadhaar login not working  
**Solution:** User may have already set password. Try password login instead.

**Issue:** Forgot password  
**Solution:** Currently requires manual admin reset. Implement password reset feature in next iteration.

---

## Future Enhancements

- [ ] Password reset via email/SMS
- [ ] Email verification for new registrations
- [ ] Two-factor authentication (2FA)
- [ ] Login history and security logs
- [ ] Account recovery options
- [ ] Social login integration (Google, Facebook)
- [ ] Biometric authentication for mobile

---

## Metrics to Track

- Total users migrated to password
- Password setup completion rate
- Login method usage (password vs Aadhaar)
- Failed login attempts
- Average time to complete password setup
- Support tickets related to authentication

---

## Conclusion

This migration provides a seamless transition from Aadhaar-based to password-based authentication while maintaining full backward compatibility. The dual-authentication approach during the transition period ensures no user is locked out while encouraging adoption of the new, more secure method.

For questions or issues, contact the development team or refer to the codebase documentation.

---

**Last Updated:** February 2, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Ready for Production
