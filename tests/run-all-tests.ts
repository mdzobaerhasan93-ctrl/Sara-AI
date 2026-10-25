import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const testFiles = (await readdir(testDirectory))
  .filter((fileName) => fileName.endsWith('.test.ts'))
  .sort();

if (testFiles.length === 0) {
  throw new Error('No test files were found.');
}

for (const fileName of testFiles) {
  console.log(`\n▶ Running ${fileName}`);
  await import(pathToFileURL(join(testDirectory, fileName)).href);
}

console.log(`\n✓ All ${testFiles.length} test files completed.`);
