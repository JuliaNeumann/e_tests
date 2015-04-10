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
-- Table structure for table `test_types`
--

CREATE TABLE IF NOT EXISTS `test_types` (
  `type_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type_string` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `type_label` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `type_description` text COLLATE utf8_unicode_ci NOT NULL,
  `type_icon` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`type_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=4 ;

--
-- Dumping data for table `test_types`
--

INSERT INTO `test_types` (`type_ID`, `type_string`, `type_label`, `type_description`, `type_icon`) VALUES
(1, 'dynmc', 'Dynamic Multiple-Choice', 'This type of test consists of questions, for each of which several answer options (only one of them being correct) are provided. Unlike traditional multiple-choice questions, these questions are not displayed as a whole. Rather, users are given one answer option at a time, and have to decide whether this single option is correct or not, before (on success), the next option is displayed.', 'images/dynmc_icon.png'),
(2, 'dragdrop', 'Drag &amp; Drop', 'A Drag &amp; Drop Test consists of several containers with labels that describe the category the container represents. Users are then given a number of terms or phrases, which they have to assign to the correct category by dragging them into the container representing said category.', 'images/dragdrop_icon.png'),
(3, 'crossword', 'Crossword Puzzle', 'Crossword Puzzle Tests present users with a number of questions, the answers to which they have to fill into the correct position of a grid representing all the solutions to the questions. If desired, a final solution word consisting of letters from the single answers can be added.', 'images/crossword_icon.png');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
