const fs = require('fs');
const path = require('path');
const { getFolderStructure, createStructure } = require('../service/FolderStructureService');
const { toCheckFileFolder } = require('../utils/validators');
const { prisma } = require('../db/config');

const createFileOrFolder = async (req, res) => {
    try {
        const { id, location, fileContent } = req.query;
        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'Invalid path provided.' });
        }

        const segments = location.split('/').filter(Boolean);
        const fileName = segments.pop();
        const folderPath = segments;

        // Retrieve the current JSON structure from the Prisma database
        const structureRecord = await prisma.folderStructure.findUnique({ where: { id: parseInt(id) } });
        if (!structureRecord) {
            return res.status(404).json({ error: 'Structure not found.' });
        }

        let structure = structureRecord.structure;
        let parent = structure;

        // Validate and update JSON structure
        const check = toCheckFileFolder(folderPath, parent, fileName, fileContent);
        if (check.isExist) {
            return res.status(400).json({ message: check.error });
        }

        // Create the directory structure in the `drive` folder
        let fullPath = path.join(__dirname, 'drive', ...folderPath);
        folderPath.forEach((folder, index) => {
            const currentPath = path.join(__dirname, 'drive', ...folderPath.slice(0, index + 1));
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
        });

        // Determine if we're creating a folder or a file at the end
        const isFile = fileName.includes('.');
        fullPath = path.join(fullPath, fileName);

        if (isFile) {
            fs.writeFileSync(fullPath, String(fileContent));
        } else if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath);
        }

        // Update the JSON structure in the database
        await prisma.folderStructure.update({
            where: { id: parseInt(id) },
            data: { structure }
        });

        res.status(201).json({ message: 'File or folder created successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const pushFolderStructure = async (req, res) => {
    try {
        const { id, location } = req.query;

        if (!id || !location) {
            return res.status(400).json({ error: 'Invalid id or location provided.' });
        }

        const fullPath = path.join(__dirname, 'drive', location);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Specified path does not exist.' });
        }

        if (!fs.lstatSync(fullPath).isDirectory()) {
            return res.status(400).json({ error: 'The specified path is not a directory.' });
        }

        const folderStructure = getFolderStructure(fullPath);

        await prisma.folderStructure.update({
            where: { id: parseInt(id) },
            data: { structure: folderStructure }
        });

        res.status(200).json({ message: 'Folder structure updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const createFoldersAndFiles = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Invalid id provided.' });
        }

        // Retrieve the structure from the database
        const folderStructureRecord = await prisma.folderStructure.findUnique({
            where: { id: parseInt(id) }
        });

        if (!folderStructureRecord) {
            return res.status(404).json({ error: 'Structure not found.' });
        }

        const structure = folderStructureRecord.structure;

        // Base directory where files will be created
        const baseDir = path.join(__dirname, 'drive');

        // Create folders and files
        createStructure(structure, baseDir);

        res.status(201).json({ message: 'Folders and files created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = { createFileOrFolder, pushFolderStructure, createFoldersAndFiles };
