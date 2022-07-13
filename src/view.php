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
namespace recitdashboard;

require(__DIR__ . '/../../config.php');
require(__DIR__ . '/lib.php');
require(dirname(__FILE__) . '/classes/PersistCtrl.php');

defined('MOODLE_INTERNAL') || die();

use moodle_url;

/*
* Class to generate React div
*/
class MainView{
    /** @var object $user store user */
    public $user = null;
    /** @var int $selectedCourseId store selected course */
    public $selectedCourseId = 0;

    public function __construct($user, $selectedCourseId){
        $this->user = $user;
        $this->selectedCourseId = $selectedCourseId;
    }

    public function display(){
        $studentId = $this->user->id;
        $selectedCourseId = ($this->selectedCourseId > 1 ? $this->selectedCourseId : 0);
        if ($this->hasAccess()){
            echo sprintf("<div id='recit_dashboard' data-student-id='%ld' data-course-id='%ld'></div>", $studentId, $selectedCourseId);
        }else{
            print_error('accessdenied', 'admin');
        }
    }

    public function hasAccess(){
        global $DB, $USER;
        $ctrl = PersistCtrl::getInstance($DB, $USER);
        $courses = $ctrl->getCourseList();
        return count($courses) > 0;
    }
}

require_login();

// Globals.
$PAGE->set_url("/local/recitdashboard/view.php");
$PAGE->requires->css(new moodle_url($CFG->wwwroot . '/local/recitdashboard/react/build/index.css'), true);
$PAGE->requires->js(new moodle_url($CFG->wwwroot . '/local/recitdashboard/react/build/index.js'), true);
local_recitdashboard_strings_for_js();

// Set page context.
$PAGE->set_context(\context_system::instance());

// Set page layout.
$PAGE->set_pagelayout('mydashboard');

$PAGE->set_title(get_string('pluginname', 'local_recitdashboard'));
$PAGE->set_heading(get_string('pluginname', 'local_recitdashboard'));

echo $OUTPUT->header();
$courseId = (isset($_GET['courseId']) ? $_GET['courseId'] : 0);
$recitDashboard = new MainView($USER, $courseId);
$recitDashboard->display();

echo $OUTPUT->footer();