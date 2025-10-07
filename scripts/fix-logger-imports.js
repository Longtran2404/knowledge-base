/**
 * Fix incorrect logger import paths
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});

let filesFixed = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix incorrect import paths
  content = content.replace(
    /import\s+\{\s*logger\s*\}\s+from\s+["']logger\/logger["'];?/g,
    (match) => {
      // Calculate correct relative path
      const fileDir = path.dirname(filePath);
      const projectRoot = path.join(__dirname, '..');
      const loggerPath = path.join(projectRoot, 'src/lib/logger/logger.ts');
      const relativePath = path.relative(fileDir, loggerPath)
        .replace(/\\/g, '/')
        .replace('.ts', '');

      return `import { logger } from "${relativePath}";`;
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    console.log(`✓ ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
});

console.log(`\n✅ Fixed ${filesFixed} files`);
