CREATE TABLE `AdminUser` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `AdminUser_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TimelineMilestone` (
  `id` VARCHAR(191) NOT NULL,
  `month` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `memoryDate` DATETIME(3) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `published` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `TimelineMilestone_month_key`(`month`),
  INDEX `TimelineMilestone_published_sortOrder_idx`(`published`, `sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Media` (
  `id` VARCHAR(191) NOT NULL,
  `type` ENUM('IMAGE', 'VIDEO', 'AUDIO') NOT NULL,
  `title` VARCHAR(191) NOT NULL DEFAULT '',
  `caption` TEXT NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(100) NULL,
  `storageKey` VARCHAR(500) NOT NULL,
  `storageProvider` VARCHAR(30) NOT NULL DEFAULT 'local',
  `mimeType` VARCHAR(120) NOT NULL,
  `sizeBytes` INTEGER NOT NULL,
  `originalName` VARCHAR(255) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `featured` BOOLEAN NOT NULL DEFAULT false,
  `published` BOOLEAN NOT NULL DEFAULT true,
  `dateTaken` DATETIME(3) NULL,
  `timelineMilestoneId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Media_type_published_sortOrder_idx`(`type`, `published`, `sortOrder`),
  INDEX `Media_category_idx`(`category`),
  INDEX `Media_timelineMilestoneId_idx`(`timelineMilestoneId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Media_timelineMilestoneId_fkey` FOREIGN KEY (`timelineMilestoneId`) REFERENCES `TimelineMilestone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Memory` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(100) NULL,
  `memoryDate` DATETIME(3) NULL,
  `mediaIds` JSON NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `featured` BOOLEAN NOT NULL DEFAULT false,
  `published` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Memory_published_sortOrder_idx`(`published`, `sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `GalleryCategory` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `GalleryCategory_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BirthdayWish` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `relationship` VARCHAR(100) NULL,
  `message` VARCHAR(1200) NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `BirthdayWish_status_createdAt_idx`(`status`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BirthdayContent` (
  `id` INTEGER NOT NULL DEFAULT 1,
  `heroTitle` VARCHAR(191) NOT NULL DEFAULT 'One Whole Year of Love',
  `babyName` VARCHAR(191) NOT NULL DEFAULT 'Maher Ayan',
  `heroSubtitle` VARCHAR(255) NOT NULL DEFAULT 'Our Little Sunshine Turns ONE!',
  `heroDescription` TEXT NOT NULL,
  `storyTitle` VARCHAR(191) NOT NULL DEFAULT 'Our Beautiful Journey Begins',
  `storyText` TEXT NOT NULL,
  `birthdayLetter` TEXT NOT NULL,
  `footerMessage` VARCHAR(255) NOT NULL DEFAULT 'Forever our little star.',
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `WebsiteSetting` (
  `id` INTEGER NOT NULL DEFAULT 1,
  `visibility` ENUM('PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED') NOT NULL DEFAULT 'PUBLIC',
  `sitePasswordHash` VARCHAR(255) NULL,
  `allowWishes` BOOLEAN NOT NULL DEFAULT true,
  `backgroundMusicEnabled` BOOLEAN NOT NULL DEFAULT false,
  `searchIndexingEnabled` BOOLEAN NOT NULL DEFAULT false,
  `siteTitle` VARCHAR(191) NOT NULL DEFAULT 'Maher Ayan | One Whole Year of Love',
  `metaDescription` TEXT NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AdminActivityLog` (
  `id` VARCHAR(191) NOT NULL,
  `adminId` VARCHAR(191) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity` VARCHAR(100) NOT NULL,
  `entityId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `AdminActivityLog_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `AdminActivityLog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
