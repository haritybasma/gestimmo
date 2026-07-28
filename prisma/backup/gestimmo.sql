-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 28, 2026 at 08:48 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gestimmo`
--

-- --------------------------------------------------------

--
-- Table structure for table `asset`
--

CREATE TABLE `asset` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organizationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locationId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acquisitionDate` datetime(3) NOT NULL,
  `acquisitionValue` double NOT NULL,
  `residualValue` double NOT NULL DEFAULT '0',
  `duration` int NOT NULL,
  `method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LINEAR',
  `degressiveCoef` double DEFAULT NULL,
  `serialNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IN_SERVICE',
  `disposedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `asset`
--

INSERT INTO `asset` (`id`, `organizationId`, `companyId`, `code`, `designation`, `categoryId`, `locationId`, `acquisitionDate`, `acquisitionValue`, `residualValue`, `duration`, `method`, `degressiveCoef`, `serialNumber`, `supplier`, `notes`, `status`, `disposedAt`, `createdAt`, `updatedAt`) VALUES
('cms2yzvoi000ru8qkt7qgkoni', 'demo-org', 'cms2yzvjf0003u8qkj9vfjij4', 'IMMO-000001', 'Ordinateur portable Dell Latitude', 'cms2yzvl50007u8qkrtkpeglm', 'cms2yzvng000ju8qkyqhq1ux4', '2024-01-15 00:00:00.000', 12000, 0, 3, 'DEGRESSIVE', NULL, NULL, NULL, NULL, 'IN_SERVICE', NULL, '2026-07-27 08:33:48.834', '2026-07-27 08:33:48.834'),
('cms2yzvou000tu8qkpsprnmm8', 'demo-org', 'cms2yzvjf0003u8qkj9vfjij4', 'IMMO-000002', 'Bureau direction bois', 'cms2yzvlo0009u8qkxod7w1qb', 'cms2yzvng000ju8qkyqhq1ux4', '2022-06-01 00:00:00.000', 8000, 0, 10, 'LINEAR', NULL, NULL, NULL, NULL, 'IN_SERVICE', NULL, '2026-07-27 08:33:48.846', '2026-07-27 08:33:48.846'),
('cms2yzvp2000vu8qkyrv1xeyj', 'demo-org', 'cms2yzvk20005u8qkikm7jy1m', 'IMMO-000003', 'Imprimante multifonction HP', 'cms2yzvl50007u8qkrtkpeglm', 'cms2yzvng000ju8qkyqhq1ux4', '2023-09-10 00:00:00.000', 450, 0, 3, 'DEGRESSIVE', NULL, NULL, NULL, NULL, 'IN_SERVICE', NULL, '2026-07-27 08:33:48.854', '2026-07-27 08:33:48.854'),
('cms2yzvpb000xu8qk62t352nf', 'demo-org', 'cms2yzvk20005u8qkikm7jy1m', 'IMMO-000004', 'Armoire de rangement métal', 'cms2yzvlo0009u8qkxod7w1qb', 'cms2yzvng000ju8qkyqhq1ux4', '2021-03-01 00:00:00.000', 600, 0, 10, 'LINEAR', NULL, NULL, NULL, NULL, 'IN_SERVICE', NULL, '2026-07-27 08:33:48.863', '2026-07-27 08:33:48.863');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organizationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `defaultDuration` int DEFAULT NULL,
  `defaultMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LINEAR',
  `degressiveCoef` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `organizationId`, `code`, `name`, `defaultDuration`, `defaultMethod`, `degressiveCoef`) VALUES
('cms2yzvl50007u8qkrtkpeglm', 'demo-org', 'MAT-INFO', 'Matériel informatique', 3, 'DEGRESSIVE', NULL),
('cms2yzvlo0009u8qkxod7w1qb', 'demo-org', 'MOB-BUR', 'Mobilier de bureau', 10, 'LINEAR', NULL),
('cms2yzvlv000bu8qkp8ibljpp', 'demo-org', 'MAT-TRANS', 'Matériel de transport', 5, 'LINEAR', NULL),
('cms2yzvmc000du8qkp9yg4wnm', 'demo-org', 'MAT-IND', 'Matériel industriel', 7, 'DEGRESSIVE', NULL),
('cms2yzvmi000fu8qkzgjpcbp4', 'demo-org', 'AGENC', 'Agencements & installations', 10, 'LINEAR', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organizationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legalId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`id`, `organizationId`, `name`, `country`, `currency`, `legalId`, `address`, `isDefault`, `createdAt`) VALUES
('cms2yzvjf0003u8qkj9vfjij4', 'demo-org', 'Société Alpha', 'MA', 'MAD', 'ICE 001122334455667', NULL, 1, '2026-07-27 08:33:48.650'),
('cms2yzvk20005u8qkikm7jy1m', 'demo-org', 'Société Beta', 'FR', 'EUR', 'SIREN 123 456 789', NULL, 0, '2026-07-27 08:33:48.674');

-- --------------------------------------------------------

--
-- Table structure for table `inventorycampaign`
--

CREATE TABLE `inventorycampaign` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organizationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `closedAt` datetime(3) DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventoryscan`
--

CREATE TABLE `inventoryscan` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaignId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assetId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scannedCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foundLocationId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condition` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scannedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scannedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organizationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`id`, `organizationId`, `code`, `name`, `parentId`) VALUES
('cms2yzvn5000hu8qkqsisw29c', 'demo-org', 'SIEGE', 'Siège social', NULL),
('cms2yzvng000ju8qkyqhq1ux4', 'demo-org', 'SIEGE-R1', 'Siège - 1er étage', NULL),
('cms2yzvnl000lu8qkcg90fsxy', 'demo-org', 'SIEGE-R2', 'Siège - 2e étage', NULL),
('cms2yzvnq000nu8qk79q4l2f7', 'demo-org', 'ENTREPOT', 'Entrepôt', NULL),
('cms2yzvny000pu8qkrrl0qn2n', 'demo-org', 'AGENCE-C', 'Agence Casablanca', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `organization`
--

CREATE TABLE `organization` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organization`
--

INSERT INTO `organization` (`id`, `name`, `createdAt`) VALUES
('demo-org', 'Groupe Démo', '2026-07-27 08:33:48.450');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organizationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `organizationId`, `email`, `passwordHash`, `name`, `role`, `createdAt`) VALUES
('cms2yzvix0001u8qk92nv53x7', 'demo-org', 'admin@gestimmo.local', '$2b$10$n.36KYXTKOYu2HExxIrjXum5v5ZroebeNsLAmURYl9F/dAbQiHuem', 'Administrateur', 'ADMIN', '2026-07-27 08:33:48.633');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('49950be9-0574-4bb2-8f44-f028bf588094', 'ce463084ae46f4ea422bbede6b67fa413d7840d0c1941bcb502b23ca55f14434', '2026-07-27 08:33:36.601', '20260727083334_init', NULL, NULL, '2026-07-27 08:33:34.042', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `asset`
--
ALTER TABLE `asset`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Asset_organizationId_code_key` (`organizationId`,`code`),
  ADD KEY `Asset_companyId_idx` (`companyId`),
  ADD KEY `Asset_categoryId_idx` (`categoryId`),
  ADD KEY `Asset_locationId_idx` (`locationId`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Category_organizationId_code_key` (`organizationId`,`code`),
  ADD KEY `Category_organizationId_idx` (`organizationId`);

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Company_organizationId_name_key` (`organizationId`,`name`),
  ADD KEY `Company_organizationId_idx` (`organizationId`);

--
-- Indexes for table `inventorycampaign`
--
ALTER TABLE `inventorycampaign`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `InventoryCampaign_organizationId_reference_key` (`organizationId`,`reference`),
  ADD KEY `InventoryCampaign_organizationId_idx` (`organizationId`),
  ADD KEY `InventoryCampaign_companyId_idx` (`companyId`),
  ADD KEY `InventoryCampaign_createdById_fkey` (`createdById`);

--
-- Indexes for table `inventoryscan`
--
ALTER TABLE `inventoryscan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `InventoryScan_campaignId_idx` (`campaignId`),
  ADD KEY `InventoryScan_assetId_idx` (`assetId`),
  ADD KEY `InventoryScan_foundLocationId_fkey` (`foundLocationId`),
  ADD KEY `InventoryScan_scannedById_fkey` (`scannedById`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Location_organizationId_code_key` (`organizationId`,`code`),
  ADD KEY `Location_organizationId_idx` (`organizationId`),
  ADD KEY `Location_parentId_fkey` (`parentId`);

--
-- Indexes for table `organization`
--
ALTER TABLE `organization`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_organizationId_idx` (`organizationId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `asset`
--
ALTER TABLE `asset`
  ADD CONSTRAINT `Asset_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Asset_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `Asset_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Asset_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `Category_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `company`
--
ALTER TABLE `company`
  ADD CONSTRAINT `Company_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventorycampaign`
--
ALTER TABLE `inventorycampaign`
  ADD CONSTRAINT `InventoryCampaign_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryCampaign_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryCampaign_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventoryscan`
--
ALTER TABLE `inventoryscan`
  ADD CONSTRAINT `InventoryScan_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `asset` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryScan_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `inventorycampaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryScan_foundLocationId_fkey` FOREIGN KEY (`foundLocationId`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryScan_scannedById_fkey` FOREIGN KEY (`scannedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `location`
--
ALTER TABLE `location`
  ADD CONSTRAINT `Location_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Location_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
