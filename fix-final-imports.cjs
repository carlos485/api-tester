/**
 * Script final para arreglar los imports múltiples de tipos que quedaron mal formateados
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  {
    path: 'src/features/requests/components/ApiTesterView.tsx',
    fixes: [
      {
        find: /import type {\s*ApiRequest,\s*ApiResponse,\s*Endpoint,\s*Environment,\s*Project,\s*}\s*\/\/ TODO.*$/m,
        replace: `import type { ApiRequest, ApiResponse } from '@/features/requests/types';
import type { Endpoint } from '@/features/endpoints/types';
import type { Environment } from '@/features/environments/types';
import type { Project } from '@/features/projects/types';`
      },
      {
        find: /import QuickRequestBar from '@\/features\/requests\/components';/g,
        replace: "import { QuickRequestBar } from '@/features/requests/components';"
      },
      {
        find: /import RequestTabs from '@\/features\/requests\/components';/g,
        replace: "import { RequestTabs } from '@/features/requests/components';"
      },
      {
        find: /import ResponseViewer from '@\/features\/requests\/components';/g,
        replace: "import { ResponseViewer } from '@/features/requests/components';"
      },
      {
        find: /import ProjectsSidebar from '@\/features\/projects\/components';/g,
        replace: "import { ProjectsSidebar } from '@/features/projects/components';"
      },
      {
        find: /import UserMenu from '@\/features\/auth\/components';/g,
        replace: "import { UserMenu } from '@/features/auth/components';"
      },
      {
        find: /import Input from '@\/shared\/components\/ui';/g,
        replace: "import { Input } from '@/shared/components/ui';"
      },
      {
        find: /import ProjectDetails from '@\/features\/projects\/components';/g,
        replace: "import { ProjectDetails } from '@/features/projects/components';"
      },
      {
        find: /import ProjectSelectionModal from '@\/features\/projects\/components';/g,
        replace: "import { ProjectSelectionModal } from '@/features/projects/components';"
      }
    ]
  },
  {
    path: 'src/features/requests/components/ProjectView.tsx',
    fixes: [
      {
        find: /import type {\s*Project,\s*ApiRequest,\s*ApiResponse,\s*Endpoint,\s*HttpMethod,\s*Environment,\s*}\s*\/\/ TODO.*$/m,
        replace: `import type { Project } from '@/features/projects/types';
import type { ApiRequest, ApiResponse } from '@/features/requests/types';
import type { Endpoint } from '@/features/endpoints/types';
import type { HttpMethod } from '@/shared/types';
import type { Environment } from '@/features/environments/types';`
      },
      {
        find: /import QuickRequestBar from '@\/features\/requests\/components';/g,
        replace: "import { QuickRequestBar } from '@/features/requests/components';"
      },
      {
        find: /import RequestTabs from '@\/features\/requests\/components';/g,
        replace: "import { RequestTabs } from '@/features/requests/components';"
      },
      {
        find: /import ResponseViewer from '@\/features\/requests\/components';/g,
        replace: "import { ResponseViewer } from '@/features/requests/components';"
      },
      {
        find: /import Sidebar from '@\/features\/folders\/components';/g,
        replace: "import { Sidebar } from '@/features/folders/components';"
      },
      {
        find: /import ProjectSelector from '@\/features\/projects\/components';/g,
        replace: "import { ProjectSelector } from '@/features/projects/components';"
      },
      {
        find: /import UserMenu from '@\/features\/auth\/components';/g,
        replace: "import { UserMenu } from '@/features/auth/components';"
      },
      {
        find: /import Input from '@\/shared\/components\/ui';/g,
        replace: "import { Input } from '@/shared/components/ui';"
      }
    ]
  },
  {
    path: 'src/features/requests/components/QuickRequestBar.tsx',
    fixes: [
      {
        find: /import type { Environment, ApiRequest } \/\/ TODO.*$/m,
        replace: "import type { Environment } from '@/features/environments/types';\nimport type { ApiRequest } from '@/features/requests/types';"
      },
      {
        find: /import RequestMethodSelect, { type HttpMethod } from '@\/features\/requests\/components';/g,
        replace: "import { RequestMethodSelect } from '@/features/requests/components';\nimport type { HttpMethod } from '@/shared/types';"
      },
      {
        find: /import EnvironmentSelector from '@\/features\/environments\/components';/g,
        replace: "import { EnvironmentSelector } from '@/features/environments/components';"
      }
    ]
  },
  {
    path: 'src/features/requests/components/RequestTabs.tsx',
    fixes: [
      {
        find: /import type { ApiRequest } \/\/ TODO.*$/m,
        replace: "import type { ApiRequest } from '@/features/requests/types';"
      },
      {
        find: /import RequestMethodSelect, { type HttpMethod } from '@\/features\/requests\/components';/g,
        replace: "import { RequestMethodSelect } from '@/features/requests/components';\nimport type { HttpMethod } from '@/shared/types';"
      },
      {
        find: /import Input from '@\/shared\/components\/ui';/g,
        replace: "import { Input } from '@/shared/components/ui';"
      },
      {
        find: /import Textarea from '@\/shared\/components\/ui';/g,
        replace: "import { Textarea } from '@/shared/components/ui';"
      },
      {
        find: /import Select from '@\/shared\/components\/ui';/g,
        replace: "import { Select } from '@/shared/components/ui';"
      }
    ]
  },
  {
    path: 'src/shared/utils/curlGenerator.ts',
    fixes: [
      {
        find: /import type { ApiRequest } \/\/ TODO.*$/m,
        replace: "import type { ApiRequest } from '@/features/requests/types';"
      }
    ]
  },
  {
    path: 'src/features/projects/components/CreateProjectModal.tsx',
    fixes: [
      {
        find: /import Modal from '@\/shared\/components\/ui';/g,
        replace: "import { Modal } from '@/shared/components/ui';"
      },
      {
        find: /import Button from '@\/shared\/components\/ui';/g,
        replace: "import { Button } from '@/shared/components/ui';"
      },
      {
        find: /import Input from '@\/shared\/components\/ui';/g,
        replace: "import { Input } from '@/shared/components/ui';"
      },
      {
        find: /import Textarea from '@\/shared\/components\/ui';/g,
        replace: "import { Textarea } from '@/shared/components/ui';"
      }
    ]
  },
  {
    path: 'src/features/projects/components/ProjectSelectionModal.tsx',
    fixes: [
      {
        find: /import Input from '@\/shared\/components\/ui';/g,
        replace: "import { Input } from '@/shared/components/ui';"
      }
    ]
  },
  {
    path: 'src/features/projects/components/ProjectSelector.tsx',
    fixes: [
      {
        find: /import Input from '@\/shared\/components\/ui';/g,
        replace: "import { Input } from '@/shared/components/ui';"
      }
    ]
  },
  {
    path: 'src/features/projects/components/ProjectDetails.tsx',
    fixes: [
      {
        find: /import Input from '@\/shared\/components\/ui';/g,
        replace: "import { Input } from '@/shared/components/ui';"
      }
    ]
  },
  {
    path: 'src/features/projects/components/ProjectsHome.tsx',
    fixes: [
      {
        find: /import ProjectCard from '@\/features\/projects\/components';/g,
        replace: "import { ProjectCard } from '@/features/projects/components';"
      },
      {
        find: /import Button from '@\/shared\/components\/ui';/g,
        replace: "import { Button } from '@/shared/components/ui';"
      },
      {
        find: /import CreateProjectModal from '@\/features\/projects\/components';/g,
        replace: "import { CreateProjectModal } from '@/features/projects/components';"
      },
      {
        find: /import UserMenu from '@\/features\/auth\/components';/g,
        replace: "import { UserMenu } from '@/features/auth/components';"
      }
    ]
  },
  {
    path: 'src/features/projects/components/ProjectsSidebar.tsx',
    fixes: [
      {
        find: /import CreateProjectModal from '@\/features\/projects\/components';/g,
        replace: "import { CreateProjectModal } from '@/features/projects/components';"
      }
    ]
  }
];

function fixFile(fileInfo) {
  const filePath = path.join(__dirname, fileInfo.path);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    fileInfo.fixes.forEach(({ find, replace }) => {
      const newContent = content.replace(find, replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${fileInfo.path}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error in ${fileInfo.path}:`, error.message);
    return false;
  }
}

console.log('🔧 Applying final import fixes...\n');
let filesFixed = 0;
filesToFix.forEach(fileInfo => {
  if (fixFile(fileInfo)) {
    filesFixed++;
  }
});
console.log(`\n✅ Done! Fixed ${filesFixed} files.`);
console.log('\n⚠️  Now run "pnpm build" to verify everything works!');
