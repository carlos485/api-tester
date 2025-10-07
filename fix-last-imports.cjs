/**
 * Script para arreglar los últimos imports problemáticos
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // Fix single component imports that should be destructured
  { find: /^import Button from '@\/shared\/components\/ui';$/gm, replace: "import { Button } from '@/shared/components/ui';" },
  { find: /^import Input from '@\/shared\/components\/ui';$/gm, replace: "import { Input } from '@/shared/components/ui';" },
  { find: /^import Textarea from '@\/shared\/components\/ui';$/gm, replace: "import { Textarea } from '@/shared/components/ui';" },
  { find: /^import Select from '@\/shared\/components\/ui';$/gm, replace: "import { Select } from '@/shared/components/ui';" },
  { find: /^import Modal from '@\/shared\/components\/ui';$/gm, replace: "import { Modal } from '@/shared/components/ui';" },
  { find: /^import ConfirmationModal from '@\/shared\/components\/ui';$/gm, replace: "import { ConfirmationModal } from '@/shared/components/ui';" },

  // Fix relative imports for components
  { find: /from '\.\/EnvironmentSelector';/g, replace: "from '@/features/environments/components';" },
  { find: /from '\.\/Select';/g, replace: "from '@/shared/components/ui';" },
  { find: /import RequestMethodSelect, { type HttpMethod } from '\.\/RequestMethodSelect';/g, replace: "import { RequestMethodSelect } from '@/features/requests/components';\nimport type { HttpMethod } from '@/shared/types';" },

  // Fix import services in ProjectsSidebar
  { find: /from '\.\.\/services\/endpointsService'/g, replace: "from '@/features/endpoints/services'" },
  { find: /from '\.\.\/services\/projectService'/g, replace: "from '@/features/projects/services'" },
];

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

console.log('🔧 Fixing last import issues...\n');
const srcPath = path.join(__dirname, 'src');
const filesFixed = processDirectory(srcPath);
console.log(`\n✅ Done! Fixed ${filesFixed} files.`);
console.log('\n📦 Running build now...');
