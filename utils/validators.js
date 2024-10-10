const toCheckFileFolder=(folderPath, parent, fileName,fileContent)=>{
    for (let i = 0; i < folderPath.length; i++) {
        const folder = folderPath[i];
        let folderFound = parent.find(item => item.type === 'folder' && item.name === folder);

        if (!folderFound) {
            folderFound = {
                name: folder,
                type: 'folder',
                childs: []
            };
            parent.push(folderFound);
        }

        parent = folderFound.childs;

        if (i === folderPath.length - 1) {
            const existingFile = parent.find(item => item.type === 'file' && item.name === fileName);
            if (existingFile) {
                return { error: 'File already exists.',isExist:true };
            }

            parent.push({
                name: fileName,
                type: 'file',
                content:fileContent
            });
        }
    }
    return { error: 'File Created successfully.',isExist:false };
}

module.exports={toCheckFileFolder}