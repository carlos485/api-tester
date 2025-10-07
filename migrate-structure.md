# Migration Guide - Project Restructuring

## Migration Steps Completed

### ✅ Phase 1: Configuration
- [x] Path aliases configured in `tsconfig.app.json`
- [x] Path aliases configured in `vite.config.ts`
- [x] Base folder structure created

## Manual Migration Steps

Due to the complexity and number of files, here's the recommended manual migration approach:

### Step 1: Migrate lib/firebase
```bash
# Move firebase configuration
mv src/lib/firebase.ts src/lib/firebase/config.ts
# Create index.ts for barrel export
echo "export * from './config';" > src/lib/firebase/index.ts
```

### Step 2: Migrate shared/utils
```bash
mv src/utils/sessionStorage.ts src/shared/utils/
mv src/utils/curlParser.ts src/shared/utils/
mv src/utils/curlGenerator.ts src/shared/utils/
echo "export * from './sessionStorage';\nexport * from './curlParser';\nexport * from './curlGenerator';" > src/shared/utils/index.ts
```

### Step 3: Migrate shared/components/ui
```bash
mv src/components/Button.tsx src/shared/components/ui/Button.tsx
mv src/components/Input.tsx src/shared/components/ui/Input.tsx
mv src/components/Textarea.tsx src/shared/components/ui/Textarea.tsx
mv src/components/Select.tsx src/shared/components/ui/Select.tsx
mv src/components/Modal.tsx src/shared/components/ui/Modal.tsx
mv src/components/ConfirmationModal.tsx src/shared/components/ui/ConfirmationModal.tsx
mv src/components/Tabs.tsx src/shared/components/ui/Tabs.tsx
```

Create `src/shared/components/ui/index.ts`:
```typescript
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Textarea } from './Textarea';
export { default as Select } from './Select';
export { default as Modal } from './Modal';
export { default as ConfirmationModal } from './ConfirmationModal';
export { Tabs, Tab } from './Tabs';
```

### Step 4: Migrate features/auth
```bash
mv src/components/LoginPage.tsx src/features/auth/components/
mv src/components/UserMenu.tsx src/features/auth/components/
mv src/hooks/useAuth.ts src/features/auth/hooks/
mv src/services/authService.ts src/features/auth/services/
```

Create barrel exports:
- `src/features/auth/components/index.ts`
- `src/features/auth/hooks/index.ts`
- `src/features/auth/services/index.ts`

### Step 5: Migrate features/projects
```bash
mv src/components/ProjectsHome.tsx src/features/projects/components/
mv src/components/ProjectCard.tsx src/features/projects/components/
mv src/components/ProjectDetails.tsx src/features/projects/components/
mv src/components/ProjectSelector.tsx src/features/projects/components/
mv src/components/ProjectSelectionModal.tsx src/features/projects/components/
mv src/components/ProjectsSidebar.tsx src/features/projects/components/
mv src/components/CreateProjectModal.tsx src/features/projects/components/
mv src/hooks/useProjects.ts src/features/projects/hooks/
mv src/services/projectService.ts src/features/projects/services/
```

### Step 6: Migrate features/endpoints
```bash
mv src/hooks/useEndpoints.ts src/features/endpoints/hooks/
mv src/services/endpointsService.ts src/features/endpoints/services/
```

### Step 7: Migrate features/environments
```bash
mv src/components/EnvironmentSelector.tsx src/features/environments/components/
```

### Step 8: Migrate features/requests
```bash
mv src/components/ApiTesterView.tsx src/features/requests/components/
mv src/components/QuickRequestBar.tsx src/features/requests/components/
mv src/components/RequestTabs.tsx src/features/requests/components/
mv src/components/ResponseViewer.tsx src/features/requests/components/
mv src/components/RequestMethodSelect.tsx src/features/requests/components/
mv src/utils/curlParser.ts src/features/requests/utils/ # if not already moved
mv src/utils/curlGenerator.ts src/features/requests/utils/ # if not already moved
```

### Step 9: Migrate features/folders
```bash
mv src/components/Sidebar.tsx src/features/folders/components/
```

### Step 10: Migrate app
```bash
mv src/App.tsx src/app/
mv src/main.tsx src/app/
```

### Step 11: Migrate types
Split `src/types/project.ts` into feature-specific type files:
- Auth types → `src/features/auth/types/auth.types.ts`
- Project types → `src/features/projects/types/project.types.ts`
- Endpoint types → `src/features/endpoints/types/endpoint.types.ts`
- Environment types → `src/features/environments/types/environment.types.ts`
- Request types → `src/features/requests/types/request.types.ts`

### Step 12: Move styles
```bash
mv src/index.css src/styles/
```

Update `src/app/main.tsx` to import from new location:
```typescript
import '../styles/index.css'
```

## Import Updates Required

After migration, update all imports to use path aliases:

### Before:
```typescript
import Button from './components/Button';
import { useAuth } from './hooks/useAuth';
import { ProjectService } from './services/projectService';
```

### After:
```typescript
import { Button } from '@/shared/components/ui';
import { useAuth } from '@/features/auth/hooks';
import { ProjectService } from '@/features/projects/services';
```

## Automated Migration Script

Run this PowerShell script to perform the migration:

```powershell
# Save this as migrate-files.ps1 and run it from the project root
# WARNING: Make sure you have a git commit or backup before running!

# To use this script:
# 1. Open PowerShell
# 2. cd to project root
# 3. ./migrate-files.ps1
```

## Testing After Migration

1. Run `pnpm build` to check for TypeScript errors
2. Run `pnpm dev` to test the development server
3. Test all major features:
   - Authentication
   - Project CRUD
   - Endpoint management
   - API requests
   - Environment switching

## Rollback Plan

If something goes wrong:
```bash
git reset --hard HEAD  # If you committed before migration
# OR
git stash  # If you didn't commit
```
