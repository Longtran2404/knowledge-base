/**
 * Script to replace console.log/error/warn/info/debug with logger utility
 * This script will automatically update all TypeScript/TSX files in src/
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files in src directory
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});

let totalReplacements = 0;
let filesModified = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileReplacements = 0;

  // Check if file already imports logger
  const hasLoggerImport = content.includes('from "../lib/logger/logger"') ||
                          content.includes('from "../../lib/logger/logger"') ||
                          content.includes('from "../../../lib/logger/logger"') ||
                          content.includes('from "../../../../lib/logger/logger"');

  // Replace console statements with logger equivalents
  const replacements = [
    // console.error(message, error) -> logger.error(message, error)
    {
      pattern: /console\.error\((.*?)\)/gs,
      replacement: (match, args) => {
        fileReplacements++;
        return `logger.error(${args})`;
      }
    },
    // console.warn(message) -> logger.warn(message)
    {
      pattern: /console\.warn\((.*?)\)/gs,
      replacement: (match, args) => {
        fileReplacements++;
        return `logger.warn(${args})`;
      }
    },
    // console.info(message) -> logger.info(message)
    {
      pattern: /console\.info\((.*?)\)/gs,
      replacement: (match, args) => {
        fileReplacements++;
        return `logger.info(${args})`;
      }
    },
    // console.debug(message) -> logger.debug(message)
    {
      pattern: /console\.debug\((.*?)\)/gs,
      replacement: (match, args) => {
        fileReplacements++;
        return `logger.debug(${args})`;
      }
    },
    // console.log(message) -> logger.info(message)
    {
      pattern: /console\.log\((.*?)\)/gs,
      replacement: (match, args) => {
        fileReplacements++;
        return `logger.info(${args})`;
      }
    }
  ];

  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });

  // Add logger import if file was modified and doesn't have it
  if (fileReplacements > 0 && !hasLoggerImport) {
    // Calculate relative path to logger
    const fileDir = path.dirname(filePath);
    const projectRoot = path.join(__dirname, '..');
    const loggerPath = path.join(projectRoot, 'src/lib/logger/logger.ts');
    const relativePath = path.relative(fileDir, loggerPath)
      .replace(/\\/g, '/')
      .replace('.ts', '');

    // Find the last import statement
    const importRegex = /^import\s+.*?from\s+['"].*?['"];?$/gm;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;

      content = content.slice(0, insertPosition) +
                `\nimport { logger } from "${relativePath}";` +
                content.slice(insertPosition);
    } else {
      // No imports found, add at the top
      content = `import { logger } from "${relativePath}";\n\n` + content;
    }
  }

  // Write back if modified
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += fileReplacements;
    console.log(`✓ ${path.relative(path.join(__dirname, '..'), filePath)}: ${fileReplacements} replacements`);
  }
});

console.log(`\n✅ Completed!`);
console.log(`📁 Files modified: ${filesModified}`);
console.log(`🔄 Total replacements: ${totalReplacements}`);
