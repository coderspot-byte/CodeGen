
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'output.txt';
const PROJECT_ROOT = path.resolve(__dirname, 'src');
const INSERT_MARKER = '// INSERT HERE'; // Marker inside existing files

function extractBlocks(output) {
  const blocks = [];
  const lines = output.split('\n');

  let currentPath = null;
  let buffer = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/Add to `(.*?)` \(create if doesn't exist\):|Create `(.*?)`:/);
    if (match) {
      if (currentPath && buffer.length) {
        blocks.push({ file: currentPath, content: buffer.join('\n') });
      }
      currentPath = match[1] || match[2];
      buffer = [];
    } else if (currentPath) {
      buffer.push(line);
    }
  }

  if (currentPath && buffer.length) {
    blocks.push({ file: currentPath, content: buffer.join('\n') });
  }

  return blocks;
}

function integrateGeneratedCode() {
  const output = fs.readFileSync(OUTPUT_FILE, 'utf8');
  const blocks = extractBlocks(output);

  blocks.forEach(({ file, content }) => {
    const fullPath = path.join(PROJECT_ROOT, ...file.split('/'));
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(fullPath)) {
      let fileContent = fs.readFileSync(fullPath, 'utf8');
      if (fileContent.includes(INSERT_MARKER)) {
        console.log(`🔁 Inserting into marker in: ${file}`);
        fileContent = fileContent.replace(INSERT_MARKER, content.trim() + '\n' + INSERT_MARKER);
        fs.writeFileSync(fullPath, fileContent, 'utf8');
      } else {
        console.log(`📥 Appending to existing file: ${file}`);
        fs.appendFileSync(fullPath, '\n\n' + content.trim(), 'utf8');
      }
    } else {
      console.log(`📄 Creating new file: ${file}`);
      fs.writeFileSync(fullPath, content.trim(), 'utf8');
    }
  });
}

integrateGeneratedCode();
