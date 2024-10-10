const express = require('express');
const { pushFolderStructure, createFileOrFolder, createFoldersAndFiles } = require('../controllers/FolderManagement');
const router = express.Router();

router.get('/create', createFileOrFolder);
router.put('/push', pushFolderStructure);
router.get('/create-structure', createFoldersAndFiles);

module.exports = router;