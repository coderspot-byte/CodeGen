const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

require('dotenv').config();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
console.log("🔐 OpenRouter API Key loaded?", !!process.env.OPENROUTER_API_KEY);
console.log("🔐 API Key:", process.env.OPENROUTER_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/generate', upload.array('files'), async (req, res) => {
    const { businessRequirement, relatedCode } = req.body;
  
    console.log("✅ Received business requirement:", businessRequirement);
    console.log("✅ Received related code:", relatedCode);
  
    if (!businessRequirement || !relatedCode) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: 'Missing required fields' });
    }
    let fileContents = '';
    if (req.files && req.files.length > 0) {
        fileContents = req.files.map((file) => {
        const content = fs.readFileSync(path.resolve(file.path), 'utf8');
        console.log(`📁 File ${file.originalname} content:\n${content}`);
        return `Filename: ${file.originalname}\n\n${content}\n`;
        }).join('\n\n');
    } else {
        console.log("⚠️ No files received");
    }


    // const fileContents = req.files.map((file) => {
    //   const content = fs.readFileSync(path.resolve(file.path), 'utf8');
    //   console.log(`📁 File ${file.originalname} content:\n${content}`);
    //   return `Filename: ${file.originalname}\n\n${content}\n`;
    // }).join('\n\n');
  
    //   Related Context Files:
//   ${fileContents}

// Existing Code:
// ${relatedCode}
    const prompt = `
  You are a senior Java developer assistant for SAP. SAP uses the CAP Java Framework for development. Use the 
  following links for reference https://cap.cloud.sap/docs/java/getting-started , https://cap.cloud.sap/docs/cds/ , 
  https://github.com/SAP-samples/cloud-cap-samples-java.
  Help generate CAP Java code.
  
  Business Requirement:
  ${businessRequirement}
  


  
  Only return the newly generated code. Do not repeat the entire class unless necessary.
  `;
  
    console.log("🧠 Prompt sent to LLM:\n", prompt);
  
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'nvidia/llama-3.3-nemotron-super-49b-v1:free',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        console.error("❌ No choices returned from LLM:", response.data);
        return res.status(500).json({ error: 'No completion returned from LLM.' });
      }
  
      const generatedCode = response.data.choices[0].message.content;
      //console.log("✅ Generated code:\n", generatedCode);
  
      const outputPath = path.join(__dirname, 'output.txt');
        fs.writeFileSync(outputPath, generatedCode, 'utf8');
        console.log(`💾 Output written to ${outputPath}`);

        res.json({ code: generatedCode });

    } catch (error) {
      console.error('❌ Error from OpenRouter:', error?.response?.data || error.message);
      res.status(500).json({ error: 'Failed to generate code from LLM.' });
    } finally {
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
              try {
                fs.unlinkSync(file.path);
              } catch (err) {
                console.error(`⚠️ Failed to delete file ${file.path}:`, err.message);
              }
            });
          }
          
    //   req.files.forEach(file => fs.unlinkSync(file.path));
    }
  });
  

app.listen(port, () => {
  console.log(`🚀 MCP Server running at http://localhost:${port}`);
});
