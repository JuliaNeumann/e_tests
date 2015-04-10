-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Mar 16, 2015 at 10:42 AM
-- Server version: 5.5.27
-- PHP Version: 5.4.7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `e_tests`
--

-- --------------------------------------------------------

--
-- Table structure for table `test_levels`
--

CREATE TABLE IF NOT EXISTS `test_levels` (
  `level_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `level_number` int(10) unsigned NOT NULL,
  `level_label` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`level_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=4 ;

--
-- Dumping data for table `test_levels`
--

INSERT INTO `test_levels` (`level_ID`, `level_number`, `level_label`) VALUES
(1, 1, 'Beginner'),
(2, 2, 'Intermediate'),
(3, 3, 'Advanced');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
