# Import Mapping Guide

Este archivo contiene el mapeo de imports antiguos a nuevos después de la reestructuración.

## Pattern de Reemplazo

### Shared Components UI
```typescript
// Antiguo
import Button from './components/Button';
import Button from '../components/Button';
import Button from '../../components/Button';

// Nuevo
import { Button } from '@/shared/components/ui';
```

### Auth
```typescript
// Antiguo
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import UserMenu from './components/UserMenu';
import { authService } from './services/authService';

// Nuevo
import { useAuth } from '@/features/auth/hooks';
import { LoginPage, UserMenu } from '@/features/auth/components';
import { authService } from '@/features/auth/services';
```

### Projects
```typescript
// Antiguo
import type { Project } from './types/project';
import { useProjects } from './hooks/useProjects';
import { ProjectService } from './services/projectService';
import ProjectsHome from './components/ProjectsHome';

// Nuevo
import type { Project } from '@/features/projects/types';
import { useProjects } from '@/features/projects/hooks';
import { ProjectService } from '@/features/projects/services';
import { ProjectsHome } from '@/features/projects/components';
```

### Endpoints
```typescript
// Antiguo
import type { Endpoint } from './types/project';
import { useEndpoints } from './hooks/useEndpoints';
import { EndpointsService } from './services/endpointsService';

// Nuevo
import type { Endpoint } from '@/features/endpoints/types';
import { useEndpoints } from '@/features/endpoints/hooks';
import { EndpointsService } from '@/features/endpoints/services';
```

### Environments
```typescript
// Antiguo
import type { Environment } from './types/project';
import EnvironmentSelector from './components/EnvironmentSelector';

// Nuevo
import type { Environment } from '@/features/environments/types';
import { EnvironmentSelector } from '@/features/environments/components';
```

### Requests
```typescript
// Antiguo
import type { ApiRequest, ApiResponse } from './types/project';
import ApiTesterView from './components/ApiTesterView';
import QuickRequestBar from './components/QuickRequestBar';
import { parseCurl } from './utils/curlParser';

// Nuevo
import type { ApiRequest, ApiResponse } from '@/features/requests/types';
import { ApiTesterView, QuickRequestBar } from '@/features/requests/components';
import { parseCurl } from '@/shared/utils';
```

### Firebase
```typescript
// Antiguo
import { auth, db } from './lib/firebase';

// Nuevo
import { auth, db } from '@/lib/firebase';
```

### Utilities
```typescript
// Antiguo
import { saveRequestTabs } from './utils/sessionStorage';
import { parseCurl } from './utils/curlParser';

// Nuevo
import { saveRequestTabs, parseCurl } from '@/shared/utils';
```

### Types
```typescript
// Antiguo
import type { HttpMethod } from './types/project';

// Nuevo
import type { HttpMethod } from '@/shared/types';
```

## Lista Completa de Reemplazos para VS Code Find & Replace

Use estos patrones en VS Code (Ctrl+Shift+H) con "Use Regular Expression" activado:

### 1. Components UI
```
Find: from ['"]\.\.?/.*?components/(Button|Input|Textarea|Select|Modal|ConfirmationModal|Tabs)['"]
Replace: from '@/shared/components/ui'
```

### 2. Auth Components
```
Find: from ['"]\.\.?/.*?components/(LoginPage|UserMenu)['"]
Replace: from '@/features/auth/components'
```

### 3. Auth Hooks
```
Find: from ['"]\.\.?/.*?hooks/useAuth['"]
Replace: from '@/features/auth/hooks'
```

### 4. Auth Services
```
Find: from ['"]\.\.?/.*?services/authService['"]
Replace: from '@/features/auth/services'
```

### 5. Project Components
```
Find: from ['"]\.\.?/.*?components/(ProjectsHome|ProjectCard|ProjectDetails|ProjectSelector|ProjectSelectionModal|ProjectsSidebar|CreateProjectModal)['"]
Replace: from '@/features/projects/components'
```

### 6. Project Hooks
```
Find: from ['"]\.\.?/.*?hooks/useProjects['"]
Replace: from '@/features/projects/hooks'
```

### 7. Project Services
```
Find: from ['"]\.\.?/.*?services/projectService['"]
Replace: from '@/features/projects/services'
```

### 8. Endpoint Hooks
```
Find: from ['"]\.\.?/.*?hooks/useEndpoints['"]
Replace: from '@/features/endpoints/hooks'
```

### 9. Endpoint Services
```
Find: from ['"]\.\.?/.*?services/endpointsService['"]
Replace: from '@/features/endpoints/services'
```

### 10. Environment Components
```
Find: from ['"]\.\.?/.*?components/EnvironmentSelector['"]
Replace: from '@/features/environments/components'
```

### 11. Request Components
```
Find: from ['"]\.\.?/.*?components/(ApiTesterView|QuickRequestBar|RequestTabs|ResponseViewer|RequestMethodSelect|ProjectView)['"]
Replace: from '@/features/requests/components'
```

### 12. Utils
```
Find: from ['"]\.\.?/.*?utils/(sessionStorage|curlParser|curlGenerator)['"]
Replace: from '@/shared/utils'
```

### 13. Firebase
```
Find: from ['"]\.\.?/.*?lib/firebase['"]
Replace: from '@/lib/firebase'
```

### 14. Types - Project
```
Find: from ['"]\.\.?/.*?types/project['"]
Replace: Manually review and replace with appropriate feature type
```

## Instrucciones de Uso

1. Abrir VS Code
2. Presionar Ctrl+Shift+H (Find and Replace in Files)
3. Activar "Use Regular Expression" (.*)
4. Copiar y pegar cada patrón Find/Replace uno por uno
5. Revisar los cambios antes de aplicar "Replace All"
6. Hacer commit después de cada grupo de reemplazos

## Verificación Post-Migración

Después de actualizar todos los imports:

1. Ejecutar `pnpm build`
2. Revisar errores de TypeScript
3. Corregir imports manualmente si es necesario
4. Ejecutar `pnpm dev` para probar en desarrollo
5. Verificar que toda la funcionalidad trabaje correctamente
