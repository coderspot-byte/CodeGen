// contextManager.js
const fs = require('fs').promises;

async function extractContextFromFiles(files) {
  const contentArr = [];

  for (const file of files) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (['txt', 'json'].includes(ext)) {
      const data = await fs.readFile(file.path, 'utf-8');
      contentArr.push(`--- ${file.originalname} ---\n${data}`);
    }
  }

  return contentArr.join('\n\n');
}

module.exports = { extractContextFromFiles };
