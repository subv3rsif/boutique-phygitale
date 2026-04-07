# Authentication Testing Report

**Date:** [To be filled during testing]
**Tester:** [To be filled during testing]
**Status:** ⏳ Pending Manual Testing

## Overview

This document tracks manual integration testing of the dual authentication system implemented in Tasks 1-8 of the auth refactoring.

---

## Test Checklist

### 1. Admin Authentication Flow

**Login page:**
- [ ] Visit `/admin/login`
- [ ] Page loads correctly
- [ ] Form fields present (email, password)
- [ ] Logo and styling consistent with app

**Invalid login:**
- [ ] Submit with wrong email → Error: "Email ou mot de passe incorrect"
- [ ] Submit with wrong password → Error: "Email ou mot de passe incorrect"
- [ ] Still on login page after error

**Valid login:**
- [ ] Submit with correct `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env
- [ ] Redirects to `/admin/dashboard`
- [ ] Cookie `admin-token` set (check browser DevTools → Application → Cookies)
- [ ] Cookie is HTTP-only and secure (production)

**Admin navigation:**
- [ ] Visit `/admin/products` - page loads
- [ ] Visit `/admin/orders` - page loads
- [ ] Visit `/admin/pickup` - page loads
- [ ] Visit `/admin/dashboard` - page loads
- [ ] Sidebar shows all nav items correctly
- [ ] Admin email displayed in sidebar

**Admin API access:**
- [ ] Upload product image - works (no 401 error)
- [ ] Adjust stock - works (no 401 error)
- [ ] Create product - works (no 401 error)
- [ ] Mark order shipped - works (no 401 error)

**Logout:**
- [ ] Click "Déconnexion" button in sidebar
- [ ] Redirects to `/admin/login`
- [ ] Cookie `admin-token` deleted (check DevTools)
- [ ] Cannot access `/admin/dashboard` anymore (redirects to login)

### 2. Session Expiration

**Token expiration handling:**
- [ ] Login as admin
- [ ] Wait 8 hours OR manually expire token (modify cookie expiry in DevTools)
- [ ] Try to access `/admin/dashboard`
- [ ] Redirects to `/admin/login?error=session_expired`
- [ ] Error message visible: "Votre session a expiré" (if implemented)

### 3. Client Authentication (Isolation Test)

**Google OAuth login:**
- [ ] Logout from admin (if logged in)
- [ ] Click "Se connecter" button in header
- [ ] Redirects to `/connexion` page
- [ ] Google OAuth button present
- [ ] Click Google OAuth → Google consent screen appears
- [ ] Complete Google login
- [ ] Redirects to `/profil` (or specified redirect)
- [ ] Page shows user info (email, name, avatar)
- [ ] Cookie `authjs.session-token` set (check DevTools)

**Isolation verification - Client cannot access admin:**
- [ ] While logged in as client (Google OAuth)
- [ ] Try to access `/admin/dashboard`
- [ ] Redirects to `/admin/login`
- [ ] ✅ CORRECT: Google OAuth ≠ admin access

**Isolation verification - Admin does not show as client:**
- [ ] Logout from client
- [ ] Login as admin via `/admin/login`
- [ ] Header button shows "Se connecter" (not "Mon profil")
- [ ] ✅ CORRECT: admin cookie ≠ client session

**Cookie separation:**
- [ ] Both systems use different cookies
- [ ] `admin-token` (admin auth)
- [ ] `authjs.session-token` (client auth)
- [ ] No collision or conflict between cookies

### 4. Header Button Behavior

**Not logged in:**
- [ ] Header button shows "Se connecter" with User icon
- [ ] Clicking button redirects to `/connexion`

**After Google OAuth:**
- [ ] Header button shows "Mon profil"
- [ ] Clicking button goes to `/profil`

**After admin login:**
- [ ] Header button still shows "Se connecter"
- [ ] ✅ CORRECT: admin auth is separate, not shown in header

### 5. Edge Cases

**Invalid cookie:**
- [ ] Manually set `admin-token` cookie to invalid value
- [ ] Try to access `/admin/dashboard`
- [ ] Redirects to `/admin/login` (401)

**Missing environment variables:**
- [ ] Check logs for errors if ADMIN_EMAIL or ADMIN_PASSWORD missing
- [ ] Should fail gracefully with clear error message

**Direct admin access without cookie:**
- [ ] Clear all cookies
- [ ] Try to access `/admin/dashboard` directly
- [ ] Redirects to `/admin/login`

**Admin API routes without auth:**
- [ ] Clear cookies
- [ ] Call `/api/admin/products` via curl or Postman
- [ ] Returns 401 Unauthorized

---

## Test Results

### Admin Authentication: [ ⏳ / ✅ / ❌ ]

**Issues found:**
- None / [list issues]

### Client Authentication: [ ⏳ / ✅ / ❌ ]

**Issues found:**
- None / [list issues]

### Isolation: [ ⏳ / ✅ / ❌ ]

**Issues found:**
- None / [list issues]

### Edge Cases: [ ⏳ / ✅ / ❌ ]

**Issues found:**
- None / [list issues]

---

## Overall Status

- [ ] **All tests passed** ✅
- [ ] **Issues found requiring fixes** ⚠️
- [ ] **Testing in progress** ⏳

---

## Recommendations

1. Add rate limiting to admin login endpoint (Task 10)
2. Add Playwright e2e tests for automated regression testing (future)
3. Monitor Sentry for authentication-related errors
4. Consider implementing "Remember me" for admin (optional)
5. Add CSRF protection to logout endpoint (recommended)

---

## Notes

[Add any additional observations, performance notes, or recommendations here]

---

**Instructions for Manual Testing:**

1. Start dev server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Open DevTools (F12) to monitor cookies and network requests
4. Go through each checklist item systematically
5. Mark items with ✅ when passed, ❌ when failed
6. Document any issues in "Issues found" sections
7. Update "Test Results" status for each section
8. Commit this document after testing is complete

**Environment Variables Needed:**
- `ADMIN_EMAIL` - set in `.env.local`
- `ADMIN_PASSWORD` - set in `.env.local`
- `AUTH_SECRET` - set in `.env.local`
- `GOOGLE_CLIENT_ID` - configured Google OAuth project
- `GOOGLE_CLIENT_SECRET` - configured Google OAuth project

**Testing Timeline:** Estimated 30-45 minutes for complete manual testing
