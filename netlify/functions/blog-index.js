// Netlify Function: Blog index - scans blog folder and returns list of posts
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        const blogDir = path.join(__dirname, '../../blog');
        
        // Read all subdirectories
        const items = fs.readdirSync(blogDir, { withFileTypes: true });
        
        // Filter for folders with data.json
        const posts = [];
        for (const item of items) {
            if (item.isDirectory() && !item.name.startsWith('.')) {
                const dataJsonPath = path.join(blogDir, item.name, 'data.json');
                if (fs.existsSync(dataJsonPath)) {
                    posts.push(`blog/${item.name}/data.json`);
                }
            }
        }
        
        // Sort alphabetically
        posts.sort();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ posts })
        };
    } catch (error) {
        console.error('Error reading blog directory:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to read blog directory' })
        };
    }
};
