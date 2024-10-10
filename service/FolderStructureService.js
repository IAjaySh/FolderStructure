const fs = require('fs');
const path = require('path');

const getFolderStructure = (currentPath) => {
    const contents = fs.readdirSync(currentPath, { withFileTypes: true });
    return contents.map(item => {
        const itemPath = path.join(currentPath, item.name);
        if (item.isDirectory()) {
            return {
                name: item.name,
                type: 'folder',
                childs: getFolderStructure(itemPath),
            };
        } else {
            const fileContent = fs.readFileSync(itemPath, 'utf-8');
            return {
                name: item.name,
                type: 'file',
                content:fileContent
            };
        }
    });
};

const createStructure = (items, currentPath) => {
    items.forEach(item => {
        const itemPath = path.join(currentPath, item.name);
        if (item.type === 'folder') {
            // Create the folder
            if (!fs.existsSync(itemPath)) {
                fs.mkdirSync(itemPath, { recursive: true });
            }
            // Recursively create the structure in the folder
            createStructure(item.childs, itemPath);
        } else if (item.type === 'file') {
            // Create the file with content
            fs.writeFileSync(itemPath, item.content || ''); // Write content or empty if not specified
        }
    });
};

module.exports={getFolderStructure, createStructure}