<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

/**
 * RÉCIT Dashboard 
 * 
 * @package   local_recitdashboard
 * @copyright 2019 RÉCIT 
 * @license   {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();


define('RECITDASHBOARD_ACCESS_CAPABILITY', 'local/recitdashboard:access');
define('RECITDASHBOARD_STUDENT_CAPABILITY', 'local/recitdashboard:student');

/**
 * Initialise the js strings required for this module.
 */
function local_recitdashboard_strings_for_js() {
    global $PAGE; 

    $PAGE->requires->strings_for_js(array(
        "pluginname",
        "work",
        "time",
        "tobegraded",
        "toaddfeedback",
        "question",
        "report",
        "quiz",
        "tags",
        "grade",
        "timeconsumed",
        "end",
        "state",
        "beganat",
        "attempts",
        "noresult",
        "filteroptions",
        "course",
        "groups",
        "students",
        "sections",
        "all",
        "selectyouroption",
        "activities",
        "go",
        "overviewofmygroups",
        "updategadget",
        "removegadget",
        "nogroup",
        "group",
        "progress",
        "grades",
        "dayswithoutconnect",
        "daysdueintervalmin",
        "daysdueintervalmax",
        "studenttracking",
        "studenttotrack",
        "options",
        "studenttrackinfo",
        "nofollowuptodo",
        "student",
        "needfollowup",
        "activity",
        "dayslate",
        "cancel",
        "save",
        "msgsuccess",
        "worktracking",
        "itemtofollow",
        "worktrackinfo",
        "firstname",
        "lastname",
        "groupoverview",
        "studentsoverview",
        "viewoptions",
        "filterbytags",
        "intervaldanger",
        "intervalalert",
        "intervalsuccess",
        "success",
        "partiallycorrect",
        "needsgrading",
        "fail",
        "gadget",
        "dashboard",
        "dashboarddesc",
        "activityachievements",
        "resultsbysection",
        "quizresults",
        "taganalysis"
    ), 'local_recitdashboard');
}