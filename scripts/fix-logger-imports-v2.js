/**
 * Fix incorrect logger import paths - updated version
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/src/lib/logger/**', '**/src/lib/logging/**']
});

let filesFixed = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix incorrect import paths (without quotes in the regex pattern)
  if (content.includes('from "logger/logger"') || content.includes("from 'logger/logger'")) {
    // Calculate correct relative path
    const fileDir = path.dirname(filePath);
    const projectRoot = path.join(__dirname, '..');
    const loggerPath = path.join(projectRoot, 'src', 'lib', 'logger', 'logger.ts');
    let relativePath = path.relative(fileDir, loggerPath)
      .replace(/\\/g, '/')
      .replace('.ts', '');

    // Make sure relative path starts with ./ or ../
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }

    content = content.replace(
      /import\s*\{\s*logger\s*\}\s*from\s*["']logger\/logger["'];?/g,
      `import { logger } from "${relativePath}";`
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    console.log(`✓ ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
});

console.log(`\n✅ Fixed ${filesFixed} files`);
