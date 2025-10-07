/**
 * Fix logger API calls to match correct signature
 * logger.info(message, context) where context is Record<string, any>
 *
 * Convert:
 *   logger.info("message", someVar) -> logger.info("message", { data: someVar })
 *   logger.info("message", "string") -> logger.info("message: string")
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

  // Fix logger.info/warn calls with string as second parameter
  // Pattern: logger.info("message", variableOrString)
  // Replace with: logger.info("message", { data: variable }) or logger.info("message: string")

  // Fix cases like: logger.info("message", variable)
  content = content.replace(
    /logger\.(info|warn|debug)\(\s*([^,]+),\s*([^)]+?)\s*\)/g,
    (match, level, msg, secondArg) => {
      // Clean up the arguments
      msg = msg.trim();
      secondArg = secondArg.trim();

      // If second arg is a simple string literal, merge it into the message
      if (secondArg.startsWith('"') || secondArg.startsWith("'") || secondArg.startsWith('`')) {
        // Extract string value without quotes
        const strValue = secondArg.slice(1, -1);
        const msgValue = msg.slice(1, -1); // Remove quotes from message
        return `logger.${level}("${msgValue}: ${strValue}")`;
      }

      // If second arg is a variable, wrap it in an object
      return `logger.${level}(${msg}, { data: ${secondArg} })`;
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    console.log(`✓ ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
});

console.log(`\n✅ Fixed ${filesFixed} files`);
