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
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 *
 * @package   local_recitdashboard
 * @copyright RÉCIT 2019
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
require(__DIR__ . '/../../config.php');

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . "/local/recitcommon/php/Utils.php");

class RecitDashboard{
    public $cfg = null;
    public $user = null;
    public $page = null;
    public $output = null;

    public function __construct($cfg, $page, $user, $output){
        $this->cfg = $cfg;
        $this->user = $user;
        $this->page = $page;
        $this->output = $output;
    }

    public function display(){       
        $roles = Utils::getUserRolesOnContext(context_system::instance(), $this->user->id);
        //$studentId = (in_array('ad', $roles) ? 0 : $this->user->id);
        $studentId = $this->user->id;
        
        echo sprintf("<div id='recit_dashboard' data-student-id='%ld' data-roles='%s'></div>", $studentId, implode(",", $roles));
    }
}

require_login();

// Globals.
global $PAGE, $OUTPUT;

$PAGE->set_url("/local/recitdashboard/view.php");
$PAGE->requires->css(new moodle_url($CFG->wwwroot . '/local/recitdashboard/react_app/build/index.css'), true);
$PAGE->requires->js(new moodle_url($CFG->wwwroot . '/local/recitdashboard/react_app/build/index.js'), true);

// Set page context.
$PAGE->set_context(context_system::instance());

// Set page layout.
$PAGE->set_pagelayout('myrecitdashboard');

$PAGE->set_title(get_string('pluginname', 'local_recitdashboard'));
$PAGE->set_heading(get_string('pluginname', 'local_recitdashboard'));

echo $OUTPUT->header();
$recitDashboard = new RecitDashboard($CFG, $PAGE, $USER, $OUTPUT);
$recitDashboard->display();

echo $OUTPUT->footer();