/**
 * Script para arreglar los imports restantes, especialmente tipos y componentes dentro de features
 */

const fs = require('fs');
const path = require('path');

const typeReplacements = [
  // Imports de tipos - Project
  {
    find: /import type { Project } \/\/ TODO.*$/gm,
    replace: "import type { Project } from '@/features/projects/types';"
  },
  // Imports de tipos - Endpoint, EndpointFolder
  {
    find: /import type { (Endpoint|EndpointFolder|Endpoint, EndpointFolder|EndpointFolder, Endpoint) } \/\/ TODO.*$/gm,
    replace: "import type { Endpoint, EndpointFolder } from '@/features/endpoints/types';"
  },
  // Imports de tipos - Environment
  {
    find: /import type { Environment } \/\/ TODO.*$/gm,
    replace: "import type { Environment } from '@/features/environments/types';"
  },
  // Imports de tipos múltiples
  {
    find: /import type { (.*Project.*) } \/\/ TODO.*$/gm,
    replace: (match, types) => {
      const typeList = types.split(',').map(t => t.trim());
      const imports = [];

      if (typeList.some(t => t.includes('Project'))) {
        imports.push("import type { Project } from '@/features/projects/types';");
      }
      if (typeList.some(t => t.includes('Endpoint') || t.includes('EndpointFolder'))) {
        imports.push("import type { Endpoint, EndpointFolder } from '@/features/endpoints/types';");
      }
      if (typeList.some(t => t.includes('Environment'))) {
        imports.push("import type { Environment } from '@/features/environments/types';");
      }
      if (typeList.some(t => t.includes('ApiRequest') || t.includes('ApiResponse'))) {
        imports.push("import type { ApiRequest, ApiResponse } from '@/features/requests/types';");
      }
      if (typeList.some(t => t.includes('HttpMethod'))) {
        imports.push("import type { HttpMethod } from '@/shared/types';");
      }

      return imports.join('\n');
    }
  },
];

const componentReplacements = [
  // Components que siguen con imports relativos en features
  { find: /from ['"]\.\/QuickRequestBar['"];?/g, replace: "from '@/features/requests/components';" },
  { find: /from ['"]\.\/RequestTabs['"];?/g, replace: "from '@/features/requests/components';" },
  { find: /from ['"]\.\/ResponseViewer['"];?/g, replace: "from '@/features/requests/components';" },
  { find: /from ['"]\.\/ProjectDetails['"];?/g, replace: "from '@/features/projects/components';" },
  { find: /from ['"]\.\/ProjectSelector['"];?/g, replace: "from '@/features/projects/components';" },
  { find: /from ['"]\.\/ProjectsSidebar['"];?/g, replace: "from '@/features/projects/components';" },
  { find: /from ['"]\.\/ProjectCard['"];?/g, replace: "from '@/features/projects/components';" },
  { find: /from ['"]\.\/CreateProjectModal['"];?/g, replace: "from '@/features/projects/components';" },
  { find: /from ['"]\.\/ProjectSelectionModal['"];?/g, replace: "from '@/features/projects/components';" },
  { find: /from ['"]\.\/UserMenu['"];?/g, replace: "from '@/features/auth/components';" },
  { find: /from ['"]\.\/Sidebar['"];?/g, replace: "from '@/features/folders/components';" },

  // UI components con imports relativos
  { find: /from ['"]\.\/Modal['"];?/g, replace: "from '@/shared/components/ui';" },
  { find: /from ['"]\.\/Button['"];?/g, replace: "from '@/shared/components/ui';" },
  { find: /from ['"]\.\/Input['"];?/g, replace: "from '@/shared/components/ui';" },
  { find: /from ['"]\.\/Textarea['"];?/g, replace: "from '@/shared/components/ui';" },
  { find: /from ['"]\.\/ConfirmationModal['"];?/g, replace: "from '@/shared/components/ui';" },
  { find: /from ['"]\.\/Tabs['"];?/g, replace: "from '@/shared/components/ui';" },
];

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix types first
    typeReplacements.forEach(({ find, replace }) => {
      const newContent = content.replace(find, replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Then fix components
    componentReplacements.forEach(({ find, replace }) => {
      const newContent = content.replace(find, replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error in ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let filesFixed = 0;

  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
      filesFixed += processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      if (fixImportsInFile(fullPath)) {
        filesFixed++;
      }
    }
  });

  return filesFixed;
}

console.log('🔧 Fixing remaining imports...\n');
const srcPath = path.join(__dirname, 'src');
const filesFixed = processDirectory(srcPath);
console.log(`\n✅ Done! Fixed ${filesFixed} more files.`);
console.log('\n⚠️  Now run "pnpm build" to check for any remaining errors');
