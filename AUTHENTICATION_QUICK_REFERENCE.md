# 🚀 Quick Reference: Authentication Migration

## 📋 What Changed?

### Before (Old System)
- ✗ Register with: Name, Phone, Email, **Aadhaar (12 digits)**
- ✗ Login with: Phone + Last 4 Aadhaar digits

### After (New System)
- ✓ Register with: Name, Phone, Email, **Password**
- ✓ Login with: Phone + Password
- ✓ Legacy support: Phone + Aadhaar (one-time for existing users)

---

## 🎯 Quick Commands

### Run Database Migration
```bash
mysql -u username -p database_name < migrations/001_add_password_auth.sql
```

### Verify Migration
```sql
-- Check new columns exist
DESCRIBE individual_donors;

-- Count users needing password
SELECT COUNT(*) FROM individual_donors WHERE password_hash IS NULL;
```

### Build & Deploy
```bash
npm run build
npm run start
```

---

## 📝 Password Requirements

| Requirement | Rule |
|------------|------|
| Length | Minimum 8 characters |
| Uppercase | At least 1 (A-Z) |
| Lowercase | At least 1 (a-z) |
| Numbers | At least 1 (0-9) |
| Special Chars | Optional |

**Example Valid:** `SecurePass123`, `MyPassword2024`, `Donor@2026`  
**Example Invalid:** `short`, `alllowercase`, `NoNumbers`

---

## 🔄 User Flows (TL;DR)

### New User
```
Register → Fill Form (with password) → Done → Login with password
```

### Existing User
```
Login (Aadhaar) → Setup Password → Done → Next time: Login with password
```

---

## 📂 Key Files

| Category | File | Purpose |
|----------|------|---------|
| **DB** | `migrations/001_add_password_auth.sql` | Migration script |
| **API** | `app/api/donation-drive/register/route.ts` | Registration |
| **API** | `app/api/donation-drive/login/route.ts` | Login (dual method) |
| **API** | `app/api/donation-drive/setup-password/route.ts` | Password setup |
| **UI** | `app/donation-drive/register/page.tsx` | Registration form |
| **UI** | `app/donation-drive/login/page.tsx` | Login form |
| **UI** | `app/donation-drive/setup-password/page.tsx` | Password setup |

---

## 🛠️ API Quick Reference

### Registration
```bash
POST /api/donation-drive/register
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login (Password)
```bash
POST /api/donation-drive/login
{
  "phone": "9876543210",
  "password": "SecurePass123"
}
```

### Login (Aadhaar - Legacy)
```bash
POST /api/donation-drive/login
{
  "phone": "9876543210",
  "aadhaarLast4": "9012"
}
```

### Setup Password
```bash
POST /api/donation-drive/setup-password
{
  "donorId": 123,
  "password": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

---

## ✅ Testing Checklist

**New User:**
- [ ] Register with password
- [ ] Login with password

**Existing User:**
- [ ] Login with Aadhaar
- [ ] Redirected to password setup
- [ ] Set password successfully
- [ ] Next login with password works
- [ ] Aadhaar login now fails (as expected)

**Validation:**
- [ ] Weak password rejected
- [ ] Password mismatch error
- [ ] Phone validation works
- [ ] Email validation works

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Password not set" | User hasn't completed setup | Use Aadhaar login first |
| "Invalid credentials" (password) | Wrong password OR user not migrated | Try Aadhaar tab |
| "Invalid credentials" (Aadhaar) | User already has password | Use Password tab |
| Setup page redirects to login | Session expired | Login again |

---

## 📊 Database Schema

```sql
individual_donors
  ├─ id (PK)
  ├─ full_name
  ├─ phone
  ├─ email (UNIQUE)
  ├─ aadhaar_number (UNIQUE, NULLABLE) ✨ Made nullable
  ├─ password_hash (NULLABLE) ✨ NEW
  ├─ requires_password_update (BOOLEAN) ✨ NEW
  ├─ registration_date
  ├─ created_at
  └─ updated_at
```

---

## 🔐 Security Features

✓ bcryptjs hashing (10 rounds)  
✓ No plaintext passwords  
✓ Strong password requirements  
✓ Show/hide password toggles  
✓ Real-time validation  
✓ Secure session management  

---

## 📖 Documentation

- **Detailed Guide:** [AUTHENTICATION_MIGRATION_GUIDE.md](AUTHENTICATION_MIGRATION_GUIDE.md)
- **Summary:** [AUTHENTICATION_MIGRATION_SUMMARY.md](AUTHENTICATION_MIGRATION_SUMMARY.md)
- **Flow Diagrams:** [AUTHENTICATION_FLOW_DIAGRAMS.md](AUTHENTICATION_FLOW_DIAGRAMS.md)
- **This Quick Ref:** [AUTHENTICATION_QUICK_REFERENCE.md](AUTHENTICATION_QUICK_REFERENCE.md)

---

## 🎨 UI Components

### Login Page Tabs
```
┌─────────────┬──────────────────┐
│ 🔐 Password │ 🆔 Aadhaar      │ ← Toggle between methods
└─────────────┴──────────────────┘
```

### Password Strength Indicator
```
✓ At least 8 characters
✓ Uppercase and lowercase
✓ At least one number
```

### Show/Hide Toggle
```
[•••••••••••] [👁️]  ← Click eye to show/hide
```

---

## 💡 Tips for Developers

1. **Test Both Paths:** Always test new user AND existing user flows
2. **Check Sessions:** Verify donorId in sessionStorage
3. **Watch Redirects:** Login → Setup → Donate flow must work seamlessly
4. **Monitor Errors:** Use browser console and server logs
5. **Password Validation:** Test edge cases (too short, no uppercase, etc.)

---

## 🚨 Emergency Contacts

- **Tech Issues:** development.team@annadaan.org
- **User Support:** annadaan.mission@gmail.com
- **Database Admin:** dba@annadaan.org

---

## 📅 Timeline

- **Development:** February 2, 2026 ✅
- **Testing:** [Pending]
- **Staging Deploy:** [Pending]
- **Production Deploy:** [Pending]
- **User Notification:** [Pending]

---

## ⭐ Success Criteria

- [x] Database schema updated
- [x] APIs implemented
- [x] UI pages created
- [ ] All tests passing
- [ ] Zero errors in production
- [ ] 90%+ users migrated in 30 days
- [ ] < 5% support tickets

---

## 🔗 Quick Links

- Development Server: http://localhost:3000
- Registration: http://localhost:3000/donation-drive/register
- Login: http://localhost:3000/donation-drive/login
- Password Setup: http://localhost:3000/donation-drive/setup-password

---

**Last Updated:** February 2, 2026  
**Status:** ✅ Ready for Testing  
**Version:** 1.0
