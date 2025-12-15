// Netlify Function: Concepts index - scans concepts folder and returns list
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        const conceptsDir = path.join(__dirname, '../../concepts');
        
        // Read all subdirectories
        const items = fs.readdirSync(conceptsDir, { withFileTypes: true });
        
        // Filter for folders with data.json
        const concepts = [];
        for (const item of items) {
            if (item.isDirectory() && !item.name.startsWith('.')) {
                const dataJsonPath = path.join(conceptsDir, item.name, 'data.json');
                if (fs.existsSync(dataJsonPath)) {
                    concepts.push(`concepts/${item.name}/data.json`);
                }
            }
        }
        
        // Sort alphabetically
        concepts.sort();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concepts })
        };
    } catch (error) {
        console.error('Error reading concepts directory:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to read concepts directory' })
        };
    }
};
