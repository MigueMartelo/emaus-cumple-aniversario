---
description: Review uncommitted code changes for quality, security, and adherence to project patterns. Use when the user asks to review code, check changes, or before committing.
allowed-tools: Bash(git *)
---

# Code Review

## Current Changes

!`git diff HEAD`

## Review Guidelines

Please review the changes above and provide feedback on:

### Security
- **SQL Injection**: Ensure all database queries use parameterized queries (never string concatenation)
- **XSS**: Check that user input is properly escaped in React components
- **Authentication**: Verify admin endpoints use `requireAdmin` middleware
- **File Upload**: Confirm photo uploads validate file type, size, and use Cloudinary (not local filesystem in production)
- **Environment Variables**: Check no secrets are hardcoded (use `config` module)

### Code Quality
- **TypeScript**: Ensure proper types (no `any` unless absolutely necessary)
- **Error Handling**: API routes should use try/catch and pass errors to `next(error)`
- **Validation**: User input should be validated (backend uses `validatePersonPayload`, frontend uses react-hook-form)
- **Date Handling**: Date operations should use `dateUtils.ts` and respect `APP_TIME_ZONE`

### Project Patterns
- **Backend**: Follow repository pattern (queries in `peopleRepository.ts`, not in routes)
- **Frontend**: API calls go through `api.ts`, not direct fetch calls
- **Database**: Column names use snake_case, TypeScript uses camelCase (mapped in queries)
- **Photo URLs**: Use `photoUrl` field consistently, serve via `getMediaUrl()` helper

### React Best Practices
- Proper hook dependencies in `useEffect`
- No prop drilling (keep component depth reasonable)
- Form state managed by react-hook-form

## Output Format

Provide your review as:

1. **Summary**: One sentence overview (e.g., "Looks good" or "Found 3 issues")
2. **Issues**: List any problems found with file:line references
3. **Suggestions**: Optional improvements (non-blocking)
4. **Approval**: State whether changes are ready to commit

If no changes exist, say "No uncommitted changes to review."
