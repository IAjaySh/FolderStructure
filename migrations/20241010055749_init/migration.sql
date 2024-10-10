-- CreateTable
CREATE TABLE `FolderStructure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `structure` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
