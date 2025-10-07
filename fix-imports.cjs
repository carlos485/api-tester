/**
 * Script para automatizar la actualización de imports después de la reestructuración
 *
 * Uso: node fix-imports.js
 */

const fs = require('fs');
const path = require('path');

// Mapeo de reemplazos
const replacements = [
  // Shared UI Components
  { find: /from ['"]\.\.?\/.*?components\/(Button|Input|Textarea|Select)['"];?/g, replace: "from '@/shared/components/ui';" },
  { find: /from ['"]\.\.?\/.*?components\/(Modal|ConfirmationModal)['"];?/g, replace: "from '@/shared/components/ui';" },
  { find: /from ['"]\.\.?\/.*?components\/Tabs['"];?/g, replace: "from '@/shared/components/ui';" },

  // Auth
  { find: /from ['"]\.\.?\/.*?hooks\/useAuth['"];?/g, replace: "from '@/features/auth/hooks';" },
  { find: /from ['"]\.\.?\/.*?services\/authService['"];?/g, replace: "from '@/features/auth/services';" },
  { find: /from ['"]\.\.?\/.*?components\/(LoginPage|UserMenu)['"];?/g, replace: "from '@/features/auth/components';" },

  // Projects
  { find: /from ['"]\.\.?\/.*?hooks\/useProjects['"];?/g, replace: "from '@/features/projects/hooks';" },
  { find: /from ['"]\.\.?\/.*?services\/projectService['"];?/g, replace: "from '@/features/projects/services';" },
  { find: /from ['"]\.\.?\/.*?components\/(ProjectsHome|ProjectCard|ProjectDetails|ProjectSelector|ProjectSelectionModal|ProjectsSidebar|CreateProjectModal)['"];?/g, replace: "from '@/features/projects/components';" },

  // Endpoints
  { find: /from ['"]\.\.?\/.*?hooks\/useEndpoints['"];?/g, replace: "from '@/features/endpoints/hooks';" },
  { find: /from ['"]\.\.?\/.*?services\/endpointsService['"];?/g, replace: "from '@/features/endpoints/services';" },

  // Environments
  { find: /from ['"]\.\.?\/.*?components\/EnvironmentSelector['"];?/g, replace: "from '@/features/environments/components';" },

  // Requests
  { find: /from ['"]\.\.?\/.*?components\/(ApiTesterView|QuickRequestBar|RequestTabs|ResponseViewer|RequestMethodSelect|ProjectView)['"];?/g, replace: "from '@/features/requests/components';" },

  // Folders
  { find: /from ['"]\.\.?\/.*?components\/Sidebar['"];?/g, replace: "from '@/features/folders/components';" },

  // Utils
  { find: /from ['"]\.\.?\/.*?utils\/(sessionStorage|curlParser|curlGenerator)['"];?/g, replace: "from '@/shared/utils';" },

  // Firebase
  { find: /from ['"]\.\.?\/.*?lib\/firebase['"];?/g, replace: "from '@/lib/firebase';" },

  // Types - será más específico
  { find: /from ['"]\.\.?\/.*?types\/project['"];?/g, replace: "// TODO: Review this import - types were split into features" },
];

// Función para reemplazar en un archivo
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ find, replace }) => {
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

// Función recursiva para procesar directorio
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

// Ejecutar
console.log('🔧 Fixing imports...\n');
const srcPath = path.join(__dirname, 'src');
const filesFixed = processDirectory(srcPath);
console.log(`\n✅ Done! Fixed ${filesFixed} files.`);
console.log('\n⚠️  Remember to:');
console.log('  1. Review files with "TODO: Review this import" comments');
console.log('  2. Run "pnpm build" to check for remaining errors');
console.log('  3. Manually fix any type imports that need feature-specific types');
