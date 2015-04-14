-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Apr 10, 2015 at 01:31 PM
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
CREATE DATABASE `e_tests` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `e_tests`;

-- --------------------------------------------------------

--
-- Table structure for table `crossword_grid`
--

CREATE TABLE IF NOT EXISTS `crossword_grid` (
  `grid_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `grid_test_ID` int(10) unsigned NOT NULL,
  `grid_x` int(10) unsigned NOT NULL,
  `grid_y` int(10) unsigned NOT NULL,
  PRIMARY KEY (`grid_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crossword_questions`
--

CREATE TABLE IF NOT EXISTS `crossword_questions` (
  `question_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `question_test_ID` int(10) unsigned NOT NULL,
  `question_text` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `question_correct_answer` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `question_position_x` int(10) unsigned NOT NULL,
  `question_position_y` int(10) unsigned NOT NULL,
  `question_orientation` tinyint(3) unsigned NOT NULL COMMENT '0 = vertical, 1 = horizontal',
  `question_number` int(10) unsigned NOT NULL,
  PRIMARY KEY (`question_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dragdrop_containers`
--

CREATE TABLE IF NOT EXISTS `dragdrop_containers` (
  `container_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `container_test_ID` int(10) unsigned NOT NULL,
  `container_text` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`container_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dragdrop_items`
--

CREATE TABLE IF NOT EXISTS `dragdrop_items` (
  `item_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `item_test_ID` int(10) unsigned NOT NULL,
  `item_text` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `item_container_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`item_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dynmc_incorrect`
--

CREATE TABLE IF NOT EXISTS `dynmc_incorrect` (
  `incorrect_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `incorrect_text` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `incorrect_question_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`incorrect_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dynmc_lookup`
--

CREATE TABLE IF NOT EXISTS `dynmc_lookup` (
  `lookup_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `lookup_question_ID` int(10) unsigned NOT NULL,
  `lookup_test_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`lookup_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dynmc_questions`
--

CREATE TABLE IF NOT EXISTS `dynmc_questions` (
  `question_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `question_text` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `question_correct_answer` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`question_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test_levels`
--

CREATE TABLE IF NOT EXISTS `test_levels` (
  `level_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `level_number` int(10) unsigned NOT NULL,
  `level_label` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`level_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `test_levels`
--

INSERT INTO `test_levels` (`level_ID`, `level_number`, `level_label`) VALUES
(1, 1, 'Beginner'),
(2, 2, 'Intermediate'),
(3, 3, 'Advanced');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `test_types`
--

INSERT INTO `test_types` (`type_ID`, `type_string`, `type_label`, `type_description`, `type_icon`) VALUES
(1, 'dynmc', 'Dynamic Multiple-Choice', 'This type of test consists of questions, for each of which several answer options (only one of them being correct) are provided. Unlike traditional multiple-choice questions, these questions are not displayed as a whole. Rather, users are given one answer option at a time, and have to decide whether this single option is correct or not, before (on success), the next option is displayed.', 'images/dynmc_icon.png'),
(2, 'dragdrop', 'Drag &amp; Drop', 'A Drag &amp; Drop Test consists of several containers with labels that describe the category the container represents. Users are then given a number of terms or phrases, which they have to assign to the correct category by dragging them into the container representing said category.', 'images/dragdrop_icon.png'),
(3, 'crossword', 'Crossword Puzzle', 'Crossword Puzzle Tests present users with a number of questions, the answers to which they have to fill into the correct position of a grid representing all the solutions to the questions. If desired, a final solution word consisting of letters from the single answers can be added.', 'images/crossword_icon.png');

-- --------------------------------------------------------

--
-- Table structure for table `tests`
--

CREATE TABLE IF NOT EXISTS `tests` (
  `test_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `test_name` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `test_type_ID` int(10) unsigned NOT NULL,
  `test_level_ID` int(10) unsigned NOT NULL,
  `test_creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

CREATE USER 'e_tests_user'@'localhost' IDENTIFIED BY 'NDvZp8HfDCRjpfwF';

GRANT USAGE ON *.* TO 'e_tests_user'@'localhost' IDENTIFIED BY 'NDvZp8HfDCRjpfwF';

GRANT SELECT, INSERT, UPDATE, DELETE ON `e\_tests`.* TO 'e_tests_user'@'localhost';
