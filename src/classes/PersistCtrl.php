<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License published by
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
 * RÉCIT Dashboard 
 * 
 * @package   local_recitdashboard
 * @copyright 2019 RÉCIT 
 * @license   {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */

namespace recitdashboard;

require_once __DIR__ . '/recitcommon/PersistCtrl.php';

use stdClass;
use DateTime;

/**
 * Singleton class
 */
abstract class PersistCtrl extends MoodlePersistCtrl
{
    protected static $instance = null;
    
    /**
     * @param MySQL Resource
     * @return PersistCtrl
     */
    public static function getInstance($mysqlConn = null, $signedUser = null)
    {
        global $CFG;
        if(!isset(self::$instance)) {
            if ($CFG->version >= 2022041900){//Moodle 4.0
                self::$instance = new PersistCtrlMoodle4($mysqlConn, $signedUser);
            }else{
                self::$instance = new PersistCtrlMoodle3($mysqlConn, $signedUser);
            }
        }
        return self::$instance;
    }

    public static function compareString($str1, $str2){
        // fix sorting issue with quotes in names (for example: N'Gole) by removing it
        $str1 = str_replace("'", "", $str1);
        $str2 = str_replace("'", "", $str2);
        // //  Case insensitive string comparisons using a "natural order" algorithm
        return strnatcasecmp($str1, $str2); 
    }
    
    protected function __construct($mysqlConn, $signedUser){
        parent::__construct($mysqlConn, $signedUser);
    }

    public function getEnrolledUserList($cmId = 0, $userId = 0, $courseId = 0, $ownGroup = false){
        $result = parent::getEnrolledUserList($cmId, $userId, $courseId, $ownGroup);

        foreach($result as $i => $group){
            $this->filterStudents($result[$i], $courseId);

            foreach($group as $student){
                if($student->groupName == 'nogroup'){
                    $student->groupName = get_string("nogroup", 'local_recitdashboard');
                }
            }
        }

        return $result;
    }

    protected function isStudent($userId, $courseId){
        $ccontext = \context_course::instance($courseId);
        if (has_capability(RECITDASHBOARD_STUDENT_CAPABILITY, $ccontext, $userId, false)) {
            return true;
        }

        return false;
    }

    protected function filterStudents(array &$dataProvider, $courseId){
        $cacheStudents = array(); // Keep a cache so we dont check capabilities for the same user multiple times.

        foreach($dataProvider as $i => $item){
            if (!isset($cacheStudents[$item->userId])){
                if ($this->isStudent($item->userId, $courseId)){
                    $cacheStudents[$item->userId] = true;
                }
                else{
                    $cacheStudents[$item->userId] = false;
                    unset($dataProvider[$i]);
                }
            }
            else if($cacheStudents[$item->userId] == false){
                unset($dataProvider[$i]);
            }
        }

        $dataProvider = array_values($dataProvider); // reindex array
    }
    
    public function getWorkFollowup($courseId, $groupId = 0){
        global $CFG;

        $whereStmt = "";
        $vars = array();

        if(is_int($groupId) && $groupId > 0){
            $whereStmt = " and exists(select id from {groups_members} tgm where tgm.groupid = $groupId and tuser.userid = tgm.userid)";
        }

        $query = "
        -- return the number of submitted assignments by users that need to be corrected
        (SELECT ". $this->sql_uniqueid() ." uniqueid, t3.id cm_id, ". $this->sql_castutf8('t1.name')." cm_name, t1.duedate due_date, min(tuser.timemodified) time_modified, count(distinct tuser.id) nb_items, tuser.userid user_id,
        ". $this->mysqlConn->sql_concat(':assignurl', 't3.id')." url, 2 state
        FROM {assign} t1
        inner join {assign_submission} tuser on t1.id = tuser.assignment
        inner join {course_modules} t3 on t1.id = t3.instance and t3.module = (select id from {modules} where name = 'assign') and t1.course = t3.course
        left join {assign_grades} t4 on t4.assignment = tuser.assignment and t4.userid = tuser.userid  and tuser.attemptnumber = t4.attemptnumber
        -- gather all assignments that need to be (re)graded
        where t1.course = :course1 and tuser.status = 'submitted' and tuser.latest = 1 and (coalesce(t4.grade,0) < 0 or tuser.timemodified > coalesce(t4.timemodified,0)) $whereStmt
        group by t3.id, t1.id, tuser.userid)      

        union

        -- return the number of quizzes by users that have questions to be corrected manually 
        (select ". $this->sql_uniqueid() ." uniqueid, cm_id, min(cm_name), min(due_date), min(time_modified), count(*) nb_items, user_id, min(url), 1 state from 
        (SELECT t1.id cm_id, ". $this->sql_castutf8('t2.name')." cm_name, 0 due_date, max(tuser.timemodified) time_modified, tuser.attempt quiz_attempt, t4.questionusageid, 
        ". $this->mysqlConn->sql_concat(':quizurl', 't1.id', "'&mode=grading'")." url, ". $this->sql_group_concat('t5.state', ',', 't5.sequencenumber') ." states, min(t5.userid) user_id
        FROM 
        {course_modules} t1 
        inner join {quiz} t2 on t2.id = t1.instance and t1.module = (select id from {modules} where name = 'quiz') and t2.course = t1.course
        inner join {quiz_attempts} tuser on tuser.quiz = t2.id 
        inner join {question_attempts} t4 on  t4.questionusageid = tuser.uniqueid
        inner join {question_attempt_steps} t5 on t4.id = t5.questionattemptid
        where t1.course = :course2 $whereStmt  
        group by t1.id, t2.id, tuser.id, t4.id) tab
        where right(states, 12) = 'needsgrading' 
        group by cm_id, time_modified, user_id)";
        $vars['assignurl'] = $CFG->wwwroot.'/mod/assign/view.php?id=';
        $vars['quizurl'] = $CFG->wwwroot.'/mod/quiz/report.php?id=';
        $vars['course1'] = $courseId;
        $vars['course2'] = $courseId;

        if(file_exists("{$CFG->dirroot}/mod/recitcahiercanada/")){
            $query .= " union
            -- return the number of cahiercanada by users awaiting feedback
            (SELECT ". $this->sql_uniqueid() ." uniqueid, t3.id cm_id, ". $this->sql_castutf8('t1.name')." cm_name, 0 due_date, t1.timemodified time_modified, 
            count(*) nb_items, tuser.userid as user_id, ". $this->mysqlConn->sql_concat(':ccurl', 't3.id')." url, 2 state
            FROM {recitcahiercanada} t1
            inner join {recitcc_cm_notes} t2 on t1.id = t2.ccid
            left join {recitcc_user_notes} tuser on t2.id = tuser.cccmid
            inner join {course_modules} t3 on t1.id = t3.instance and t3.module = (select id from {modules} where name = 'recitcahiercanada') and t1.course = t3.course
            where (case when tuser.id > 0 and length(tuser.note) > 0 and (length(REGEXP_REPLACE(trim(coalesce(tuser.feedback, '')), '<[^>]*>+', '')) = 0) then 1 else 0 end) = 1 
            and t1.course = :course3 and t2.notifyteacher = 1 $whereStmt
            group by t3.id, t1.id, tuser.userid)";
            $vars['ccurl'] = $CFG->wwwroot.'/mod/recitcahiercanada/view.php?id=';
            $vars['course3'] = $courseId;
        }

        if(file_exists("{$CFG->dirroot}/mod/recitcahiertraces/")){
            $version = get_config('mod_recitcahiertraces')->version;
            $ctid_field = "ctid";
            if ($version > 2022100102) $ctid_field = "ct_id";
            $query .= " union
            -- return the number of cahiertraces by users awaiting feedback
            (SELECT ". $this->sql_uniqueid() ." uniqueid, t3.id cm_id, ". $this->sql_castutf8('t1.name')." cm_name, 0 due_date, t1.timemodified time_modified, 
            count(*) nb_items, tuser.userid as user_id, ". $this->mysqlConn->sql_concat(':cturl', 't3.id')." url, 2 state
            FROM {recitcahiertraces} t1
            inner join {recitct_groups} t2 on t1.id = t2.$ctid_field
            left join {recitct_notes} t4 on t2.id = t4.gid
            left join {recitct_user_notes} tuser on t4.id = tuser.nid
            inner join {course_modules} t3 on t1.id = t3.instance and t3.module = (select id from {modules} where name = 'recitcahiertraces') and t1.course = t3.course
            where (case when tuser.id > 0 and length(tuser.note) > 0 and (length(REGEXP_REPLACE(trim(coalesce(tuser.feedback, '')), '<[^>]*>+', '')) = 0) then 1 else 0 end) = 1 
            and t1.course = :course4 and t4.notifyteacher = 1 $whereStmt
            group by t3.id, t1.id, tuser.userid)";
            $vars['cturl'] = $CFG->wwwroot.'/mod/recitcahiertraces/view.php?id=';
            $vars['course4'] = $courseId;
        }

        $tmp = $this->getRecordsSQL($query, $vars);
        
        $this->filterStudents($tmp, $courseId);

        $result = array();
        foreach($tmp as $item){            
            // index by activity counting the number of occurrences
            if(isset($result[$item->cmId])){
                $result[$item->cmId]->nbItems += $item->nbItems;
            }
            else{
                $item->extra = new stdClass();
                if ($item->state == 1){
                    $item->extra->description = get_string('tobegraded', 'local_recitdashboard');
                }
                else if ($item->state == 2){
                    $item->extra->description = get_string('toaddfeedback', 'local_recitdashboard');
                }
               
                unset($item->uniqueid);
                unset($item->state);
                unset($item->userId);
                $result[$item->cmId] = $item;
            }
        } 

        return array_values($result); 
    }

    public function getStudentFollowUp($courseId, $groupId = 0, $cmVisible = 1){
        global $CFG, $USER;

        $vars = array('quizurl' => $CFG->wwwroot.'/mod/quiz/view.php?id=', 'assignurl' => $CFG->wwwroot.'/mod/assign/view.php?id=', 'course1' => $courseId, 'course2' => $courseId, 'course3' => $courseId);
        $options = $this->getUserOptions($USER->id);
        $vars['dayswithoutconnect'] = intval($options['dayswithoutconnect']);
        $vars['daysdueintervalmin'] = intval($options['daysdueintervalmin']);
        $vars['daysdueintervalmax'] = intval($options['daysdueintervalmax']);
        $vars['daysdueintervalmin2'] = intval($options['daysdueintervalmin']);
        $vars['daysdueintervalmax2'] = intval($options['daysdueintervalmax']);

        $visibleStmt = "";
        $visibleStmt2 = "";
        if($cmVisible != null){
            $visibleStmt = " and t5.visible = :visible ";
            $vars['visible'] = $cmVisible;
            $visibleStmt2 = " and t5.visible = :visible2 ";
            $vars['visible2'] = $cmVisible;
        }

        $groupStmt = "";
        $groupStmt2 = "";
        $groupStmt3 = "";
        if($groupId > 0){
            $groupStmt = " and exists(select id from {groups_members} tgm where tgm.groupid = :gid and t4.id = tgm.userid) ";
            $vars['gid'] = $groupId;
            $groupStmt2 = " and exists(select id from {groups_members} tgm where tgm.groupid = :gid2 and t4.id = tgm.userid) ";
            $vars['gid2'] = $groupId;
            $groupStmt3 = " and exists(select id from {groups_members} tgm where tgm.groupid = :gid3 and t4.id = tgm.userid) ";
            $vars['gid3'] = $groupId;
        }

        $query = "
        -- return if the student is X days without logging in
        (select ". $this->sql_uniqueid() ." uniqueId, t4.id user_id, ". $this->mysqlConn->sql_concat('t4.firstname', "' '", 't4.lastname')." username, 
        ". $this->mysqlConn->sql_concat('t4.firstname', "' '", 't4.lastname')." orderby,
        ". $this->sql_tojson() ."('nbDaysLastAccess', ".($this->sql_datediff('now()', $this->sql_to_time('t4.lastaccess'))).") issue
        from {user_enrolments} t1
        inner join {enrol} t2 on t1.enrolid = t2.id
        inner join {user} t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        where t2.courseid = :course1 and ".($this->sql_datediff('now()', $this->sql_to_time('t4.lastaccess')))." >= :dayswithoutconnect $groupStmt)

        -- return students who have delayed submitting an assignment based on the settings. The assignment must set a due date
        union
        (SELECT ". $this->sql_uniqueid() ." uniqueId, t4.id user_id, ". $this->mysqlConn->sql_concat('t4.firstname', "' '", 't4.lastname')." username,  
        ". $this->mysqlConn->sql_concat('t4.firstname', "' '", 't4.lastname')." orderby,
        ". $this->sql_tojson() ."('cmId', t5.id, 'cmName', t3.name, 'nbDaysLate', ".($this->sql_datediff('now()', $this->sql_to_time('t3.duedate'))).", 'url', ". $this->mysqlConn->sql_concat(':assignurl', 't5.id').") issue
        FROM {user_enrolments} t1
        inner join {enrol} t2 on t1.enrolid = t2.id
        inner join {assign} t3 on t2.courseid = t3.course
        inner join {user} t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        inner join {course_modules} t5 on t3.id = t5.instance and t5.module = (select id from {modules} where name = 'assign') and t5.course = t2.courseid
        where 
            t2.courseid = :course2 and 
            (t3.duedate > 0 and ".$this->sql_to_time('t3.duedate')." < now() and ".($this->sql_datediff('now()', $this->sql_to_time('t3.duedate')))." between :daysdueintervalmin and :daysdueintervalmax) and 
            not EXISTS((select id from {assign_submission} st1 where st1.assignment = t3.id and st1.userid = t4.id ))
            $visibleStmt $groupStmt2
        )

        -- return students who have delayed submitting an quiz based on the settings. The quiz must set a time close
        union
        (SELECT ". $this->sql_uniqueid() ." uniqueId, t4.id user_id, ". $this->mysqlConn->sql_concat('t4.firstname', "' '", 't4.lastname')." username, 
        ". $this->mysqlConn->sql_concat('t4.firstname', "' '", 't4.lastname')." orderby,
        ". $this->sql_tojson() ."('cmId', t5.id, 'cmName', t3.name, 'nbDaysLate', ".($this->sql_datediff('now()', $this->sql_to_time('t3.timeclose'))).", 'url', ". $this->mysqlConn->sql_concat(':quizurl', 't5.id').") issue
        FROM {user_enrolments} t1
        inner join {enrol} t2 on t1.enrolid = t2.id
        inner join {quiz} t3 on t2.courseid = t3.course
        inner join {user} t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        inner join {course_modules} t5 on t3.id = t5.instance and t5.module = (select id from {modules} where name = 'quiz') and t5.course = t2.courseid
        where 
            t2.courseid = :course3 and 
            (t3.timeclose > 0 and ".$this->sql_to_time('t3.timeclose')." < now() and ".($this->sql_datediff('now()', $this->sql_to_time('t3.timeclose')))." between :daysdueintervalmin2 and :daysdueintervalmax2) and 
            not EXISTS((select id from {quiz_attempts} st1 where st1.quiz = t3.id and st1.userid = t4.id ))
            $visibleStmt2 $groupStmt3
        )";
        $tmp = $this->getRecordsSQL($query, $vars);

        $this->filterStudents($tmp, $courseId);

        $result = array();
        foreach($tmp as $item){
            if(!isset($result[$item->userId])){
                $result[$item->userId] = new stdClass();
                $result[$item->userId]->userId = $item->userId;
                $result[$item->userId]->username = $item->username;
                $result[$item->userId]->orderby = $item->orderby;
                $result[$item->userId]->issues = array();
            }

            $result[$item->userId]->issues[] = json_decode($item->issue);
        }

        $result = array_values($result);
        
        usort($result, function($a, $b) {
            return PersistCtrl::compareString($a->orderby, $b->orderby);
        });

        return $result;
    }

    public function reportSectionResults($courseId, $groupId, $cmVisible = 1){

        $whereStmt = "";
        $vars = array();
        if($cmVisible != null){
            $whereStmt = " and t4.visible = :visible";
            $vars['visible'] = $cmVisible;
        }

        if($groupId > 0){
            $whereStmt .= " and t5.groupid = :group ";
            $vars['group'] = $groupId;
        }
        $vars['course'] = $courseId;

        $query = "SELECT ". $this->sql_uniqueid() ." uniqueId, t1.courseid course_id, t1.itemname item_name, t1.itemmodule item_module, 
        coalesce(max(t2.finalgrade),-1) final_grade, t3.id user_id, t3.firstname first_name, t3.lastname last_name, 
        t4.id cm_id, min(t4.section) section_id, ". $this->sql_group_concat('t5.groupid') ." group_ids, round(max(t2.finalgrade)/max(t1.grademax)*100,1) success_pct,
        max(t1.grademax) grade_max,
        (case t1.itemmodule 
            when 'quiz' then (select ". $this->sql_tojson() ."('attempt', st1.id)  
                                from {quiz_attempts} st1 where st1.quiz = t4.instance and st1.userid = t3.id and st1.state = 'finished' order by st1.attempt desc limit 1 )           
            else null end) extra
        FROM {grade_items} t1
        inner join {grade_grades} t2 on t1.id = t2.itemid and (t2.timecreated is not null or t2.timemodified is not null)
        inner join {user} t3 on t3.id = t2.userid and t3.deleted = 0 and t3.suspended = 0
        inner join {course_modules} t4 on t4.course = t1.courseid and t4.module = (select id from {modules} where name = t1.itemmodule order by name asc limit 1) and t4.instance = t1.iteminstance
        left join {groups_members} t5 on t3.id = t5.userid
        inner join {groups} t5_1 on t5.groupid = t5_1.id and t5_1.courseid = t1.courseid
        inner join {course_sections} t6 on t4.section = t6.id
        where t1.courseid = :course $whereStmt
        group by t1.courseid, t3.id, t4.id, t1.itemname, t1.itemmodule
        order by min(t6.section), cm_id, min(t6.sequence)";

        $tmp = $this->getRecordsSQL($query, $vars);
        
        $result = array();
        $cmList = array(); // gather all activities to create the columns 
        
        $this->filterStudents($tmp, $courseId);

        foreach($tmp as $item){
            // gather the user information
            if(!isset($result[$item->userId])){
                $result[$item->userId] = new stdClass();
                $result[$item->userId]->userId = (int) $item->userId;
                $result[$item->userId]->firstName = $item->firstName;
                $result[$item->userId]->lastName = $item->lastName;
                $result[$item->userId]->groupIds = explode(",", $item->groupIds);
                $result[$item->userId]->grades = array();
            }

            // gather the activity information
            $grade = new stdClass();
            $grade->cmId = $item->cmId;
            $grade->itemModule = $item->itemModule;
            $grade->itemName = $item->itemName;
            $grade->sectionId = $item->sectionId;
            $grade->extra = null;                
            $grade->finalGrade = -1;
            $grade->gradeMax = 0;
            $grade->successPct = 0;

            // array index must be a string for later merge
            $cmList[".$item->cmId."] = $grade;

            // gather the user information about the activity
            $grade = clone($grade);
            if($item->extra != null){
                $grade->extra = json_decode($item->extra);
            }
            
            $grade->finalGrade = $item->finalGrade;
            $grade->gradeMax = $item->gradeMax;
            $grade->successPct = $item->successPct;
            // array index must be a string for later merge
            $result[$item->userId]->grades[".$item->cmId."] = $grade;
        }

        foreach($result as $user){
            // merge both arrays (cmList and user-cmList) to prevent column shift
            $user->grades = array_values(array_merge($cmList, $user->grades));
        }

        $result = array_values($result);

        usort($result, function($a, $b) {
            return PersistCtrl::compareString("{$a->lastName} {$a->firstName}", "{$b->lastName} {$b->firstName}");
        });

        return $result;
    }

    public function reportActivityCompletion($courseId, $groupId, $cmVisible = 1){        
        $modinfo = get_fast_modinfo($courseId);
        
        $activityList = array();
        foreach ($modinfo->get_cms() as $cm) {
            if(($cmVisible == 1) && ($cm->__get('visible') == 0)) {
                continue;
            }

            if ($cm->completion != COMPLETION_TRACKING_NONE && !$cm->deletioninprogress) {
                $tmp = new stdClass();
                $tmp->cmId = intval($cm->__get('id'));
                $tmp->cmName = $cm->__get('name');
                $tmp->timeModified = null;
                $tmp->completionExpected = null;
                $tmp->sectionId = intval($cm->__get('section'));
                $tmp->modName = $cm->__get('modname');
                
                if($cm->__get('completionexpected') > 0){
                    $tmp->completionExpected = new DateTime();
                    $tmp->completionExpected->setTimestamp($cm->__get('completionexpected'));
                } 

                $tmp->completionState = 0;
                $activityList[] = $tmp;
            }
        }

        $whereStmt = "";
        $vars = array();
        if($groupId > 0){
            $whereStmt = " and t5.groupid = :group";
            $vars['group'] = $groupId;
        }
        $vars['course'] = $courseId;

        $query = "SELECT ". $this->sql_uniqueid() ." uniqueId, t1.course course_id, t3.id user_id, t3.firstname first_name, t3.lastname last_name, t1.id cm_id, ". $this->sql_group_concat('t5.groupid') ." group_ids, 
        coalesce(t2.completionstate,-1) completion_state, t2.timemodified time_modified
        FROM {course_modules} t1 
        inner join {course_sections} t4 on t4.id = t1.section 
        inner join {role_assignments} st2 on st2.contextid in (select id from {context} where instanceid = t1.course and contextlevel = 50)
        inner join {role} st1 on st1.id = st2.roleid
        inner join {user} t3 on t3.id = st2.userid and t3.deleted = 0 and t3.suspended = 0
        left join {groups_members} t5 on t3.id = t5.userid 
        left join {course_modules_completion} t2 on t1.id = t2.coursemoduleid and t3.id = t2.userid
        where t1.course = :course and st1.shortname in ('student') $whereStmt
        group by t1.course, t1.id, t2.id, t3.id, cm_id, t4.sequence";

        $tmp = $this->getRecordsSQL($query, $vars);
        
        $result = array();
        $this->filterStudents($tmp, $courseId);
        foreach($tmp as $item){
            $item->groupIds = explode(",", $item->groupIds);

            if(!isset($result[$item->userId])){
                $result[$item->userId] = new stdClass();
                $result[$item->userId]->courseId = (int) $item->courseId;
                $result[$item->userId]->userId = (int) $item->userId;
                $result[$item->userId]->firstName = $item->firstName;
                $result[$item->userId]->lastName = $item->lastName;
                $result[$item->userId]->groupIds = $item->groupIds;
                $result[$item->userId]->activityList = array_map(function ($object) { return clone $object; }, $activityList); 
            }

            foreach($result[$item->userId]->activityList as $act){
                if($act->cmId == $item->cmId){
                    $act->completionState = $item->completionState;
                    $act->timeModified = $item->timeModified;
                    break;
                }
            }            
        }

        usort($result, function($a, $b) {
            return PersistCtrl::compareString("{$a->lastName} {$a->firstName}", "{$b->lastName} {$b->firstName}");
        });

        return array_values($result);
    }

    abstract public function reportQuiz_QueryNbQuestions();
    
    public function reportQuiz($courseId, $activityId, $groupId = 0){
        $groupStmt = "1";
        $vars = array();
        $vars['activity'] = $activityId;
        if($groupId > 0){
            $groupStmt = " t6_2.id = :group";
            $vars['group'] = $groupId;
        }

        $query = $this->reportQuiz_QueryNbQuestions();
        $quiz = $this->getRecordsSQL($query, $vars);
        $quiz = array_pop($quiz);

        $queryPart1 = "SELECT ". $this->sql_uniqueid() ." uniqueId, t1.id course_id, t1.shortname course_name, t2.id activity_id, t3.id quiz_id, t3.name quiz_name, 
                t3.sumgrades quiz_sum_grades, t3.grade quiz_max_grade,
                coalesce((select (case state when 'needsgrading' then -1 else fraction end) from {question_attempt_steps} t5_1 where t5.id = t5_1.questionattemptid order by sequencenumber desc limit 1),0) grade, 
                t5.slot,
                min(t4.attempt) attempt, min(t4.id) quiz_attempt_id,
                min(t4.state) attempt_state, (case when min(t4.timestart) > 0 then min(t4.timestart) else 0 end) attempt_time_start,
                (case when min(t4.timefinish) > 0 then min(t4.timefinish) else 0 end) attempt_time_finish,
                greatest(min(t4.timefinish) - min(t4.timestart),0) elapsed_time,
                t6.id user_id, t6.firstname first_name, t6.lastname last_name, t6.email, 
                ". $this->sql_group_concat('coalesce(t6_2.name, \'na\')', ',', 't6_2.name') ." group_name,";

        $queryPart2 = "FROM {course} t1 
        inner join {course_modules} t2 on t1.id= t2.course 
        inner join {modules} t2_1 on t2.module = t2_1.id 
        inner join {quiz} t3 on t2.instance = t3.id 
        inner join {quiz_attempts} t4 on t4.quiz = t3.id 
        inner join {question_attempts} t5 on t4.uniqueid = t5.questionusageid 
        inner join {user} t6 on t4.userid = t6.id  and t6.deleted = 0 and t6.suspended = 0
        left join {groups_members} t6_1 on t6.id = t6_1.userid 
        left join {groups} t6_2 on t6_1.groupid = t6_2.id ";

        $queryPart3 = " where t2_1.name = 'quiz' and t2.id = :activity and t1.id = :course and $groupStmt";
        $queryPart4 = "order by t6.id, t5.slot, min(t4.sumgrades) desc";
        $vars['activity'] = $activityId;
        $vars['course'] = $courseId;

        if($quiz->hasRandomQuestions == 1){
            $query = " $queryPart1 
            t5.maxmark default_mark, 0 question_id, '' question_name,  '' question_text, '' tags 
            $queryPart2
            $queryPart3
            group by t1.id, t2.id, t3.id, t5.id, t6.id
            $queryPart4";
        }
        else{
            $query = " $queryPart1
            t5.maxmark default_mark, t7.id question_id, t7.name question_name, 
            t7.questiontext question_text, 
            (SELECT ". $this->sql_group_concat('name') ." FROM {tag} WHERE id IN (SELECT tagid from {tag_instance} where itemid = t7.id and itemtype in ('question') )) tags 
            $queryPart2
            inner join {question} t7 on t5.questionid = t7.id 
            $queryPart3
            group by t1.id, t2.id, t3.id, t5.id, t6.id, t7.id
            $queryPart4";
        }

        $tmp = $this->getRecordsSQL($query, $vars);
        
        $result = new stdClass();
        $result->students = array();
        $result->questions = array();
        $this->filterStudents($tmp, $courseId);

        foreach($tmp as $item){
            // course info
            if(!isset($result->courseId)){
                $result->courseId = $item->courseId;
                $result->courseName = $item->courseName;
                $result->activityId = $item->activityId;
                $result->quizId = $item->quizId;
                $result->quizName = $item->quizName;  
                $result->quizMaxGrade = $item->quizMaxGrade;                              
                $result->hasRandomQuestions = $quiz->hasRandomQuestions; 
            }

            // quiz questions info
            if(!isset($result->questions[$item->slot])){
                $obj = new stdClass();
                $obj->slot = $item->slot;
                $obj->questionId = $item->questionId;
                $obj->defaultMark = $item->defaultMark;
                $obj->questionName = $item->questionName;
                $obj->questionText = $item->questionText;
                $obj->gradeWeight = $item->defaultMark * ($item->quizSumGrades > 0 ? $item->quizMaxGrade/$item->quizSumGrades : 0);
                
                $obj->tags = array();
                if($item->tags){
                    $obj->tags = explode(",", $item->tags);
                }
                
                $result->questions[$item->slot] = $obj;
            }

            // students info
            if(!isset($result->students[$item->userId])){
                $obj = new stdClass();
                $obj->userId = (int) $item->userId;
                $obj->firstName = $item->firstName;
                $obj->lastName = $item->lastName;
                $obj->email = $item->email;
                $obj->groupName = $item->groupName;
                $obj->quizAttempts = array();
                $result->students[$obj->userId] = $obj;
            }

            // students quiz attempts info
            if(!isset($result->students[$item->userId]->quizAttempts[$item->quizAttemptId])){
                $obj = new stdClass();
                $obj->attempt = $item->attempt;
                $obj->quizAttemptId = $item->quizAttemptId;
                $obj->attempState = get_string("state$item->attemptState", 'quiz');
                $obj->attemptTimeStart = $item->attemptTimeStart;
                $obj->attemptTimeFinish = $item->attemptTimeFinish;
                $obj->quizSumGrades = $item->quizSumGrades;
                $obj->elapsedTime = $item->elapsedTime;
                $obj->finalGrade = 0;
                $obj->questions = array();
                $result->students[$item->userId]->quizAttempts[$item->quizAttemptId] = $obj;
            }

            // students quiz attempts questions info
            if(!isset($result->students[$item->userId]->quizAttempts[$item->quizAttemptId]->questions[$item->slot])){
                $obj = new stdClass();
                $obj->questionId = $item->questionId;
                $obj->grade = $item->grade;
                $obj->defaultMark = $item->defaultMark;
                $obj->slot = $item->slot;
                $obj->gradeWeight = $result->questions[$obj->slot]->gradeWeight;

                if($obj->grade >= 0){
                    $obj->weightedGrade = $result->questions[$obj->slot]->gradeWeight * $obj->grade;
                }
                else{
                    $obj->weightedGrade = -1;
                }
                
                $result->students[$item->userId]->quizAttempts[$item->quizAttemptId]->questions[$item->slot] = $obj;
            }
        }

        // final grade
        foreach($result->students as $student){
            foreach($student->quizAttempts as $attempt){
                $attempt->questions = array_values($attempt->questions); 
                foreach($attempt->questions as $question){
                    if($question->weightedGrade >= 0){
                        $attempt->finalGrade += $question->weightedGrade;  
                    }
                    else{
                        $attempt->finalGrade = -1;
                        break;
                    }
                } 
            }
            $student->quizAttempts = array_values($student->quizAttempts);
        }
        
        // remove array indexes
        $result->questions = array_values($result->questions);
        $result->students = array_values($result->students);

        function cmp3($a, $b) {
            if($a->slot == $b->slot){ return 0; }
            return ($a->slot < $b->slot) ? -1 : 1;
        }

        function cmp4($a, $b) {
            if($a->attempt == $b->attempt){ return 0; }
            return ($a->attempt < $b->attempt) ? -1 : 1;
        }

        // sort by student name and question slot
        usort($result->students, function($a, $b) {
            return PersistCtrl::compareString("{$a->lastName} {$a->firstName}", "{$b->lastName} {$b->firstName}");
        });

        usort($result->questions, "recitdashboard\cmp3");

        foreach($result->students as $student){
            usort($student->quizAttempts, "recitdashboard\cmp4");

            foreach($student->quizAttempts as $attempt){
                usort($attempt->questions, "recitdashboard\cmp3");
            }
        }

        return $result;
    }

    public function reportQuizEssayAnswers($courseId, $cmId, $groupId, $studentId, $onlyLastTry = false){
        $vars = array();
        $vars['cmid'] = $cmId;
        $vars['courseid'] = $courseId;

        $groupStmt = "1";
        if($groupId > 0){
            $groupStmt = " t6_2.id = :groupid";
            $vars['groupid'] = $groupId;
        }

        $studentStmt = "1";
        if($studentId > 0){
            $studentStmt = " t6.id = :studentid";
            $vars['studentid'] = $studentId;
        }

        $onlyLastTryStmt = "1";
        if($onlyLastTry){
            $onlyLastTryStmt = " t4.attempt = (SELECT MAX(sub_t4.attempt) FROM mdl_quiz_attempts as sub_t4 WHERE sub_t4.quiz = t3.id AND sub_t4.userid = t6.id)";
        }

        $query = "select ". $this->sql_uniqueid() ." uniqueId, t1.id course_id, t1.shortname course_name, t2.id cmid, t3.id quiz_id, t3.name quiz_name, t6.id user_id, t6.firstname first_name, t6.lastname last_name, 
". $this->mysqlConn->sql_concat('t6.firstname', "' '", 't6.lastname')." fullname, t6.email, t4.attempt, t4.timefinish attemp_timestamp, t5_2.value as answer
from {course} t1 
inner join {course_modules} t2 on t1.id= t2.course 
inner join {modules} t2_1 on t2.module = t2_1.id 
inner join {quiz} t3 on t2.instance = t3.id 
inner join {quiz_attempts} t4 on t4.quiz = t3.id 
inner join {question_attempts} t5 on t5.questionusageid = t4.uniqueid 
inner join {question_attempt_steps} t5_1 on t5.id = t5_1.questionattemptid 
inner join {question_attempt_step_data} t5_2 on t5_1.id = t5_2.attemptstepid and t5_2.name = 'answer' 
inner join {qtype_essay_options} as t5_3 on t5.questionid = t5_3.questionid 
inner join {user} t6 on t4.userid = t6.id and t6.deleted = 0 and t6.suspended = 0 
left join {groups_members} t6_1 on t6.id = t6_1.userid 
left join {groups} t6_2 on t6_1.groupid = t6_2.id 
where t2_1.name = 'quiz' and t2.id = :cmid  and t1.id = :courseid  and $groupStmt and $studentStmt and $onlyLastTryStmt
order by last_name asc, first_name asc,  attempt desc, t5_1.sequencenumber asc";

        $tmp = $this->getRecordsSQL($query, $vars);

        $result = array();

        if(count($tmp) == 0){
            return $result;
        }

        foreach($tmp as $item){
            $answer = html_entity_decode($item->answer);
            $answer = str_replace( '<', ' <', $item->answer );
            $answer = strip_tags( $answer );
            $item->nbWords = preg_match_all('/\pL+/u', $answer, $matches);
                $result[] = $item;
            }

        return $result;
    }

    public function getUserOptions($userId){
        global $DB;

        $defaultValues = array(
            'showstudentfollowupwidget' => 1,
            'showworkfollowupwidget' => 1,
            'showgroupsoverviewwidget' => 1,
            'dayswithoutconnect' => 7,
            'daysdueintervalmin' => 0,
            'daysdueintervalmax' => 7,
        );

        $options = array();
        $rst = $DB->get_records('local_recitdashboard_options', array('userid' => $userId));
        if (!empty($rst)){
            foreach ($rst as $v){
                $options[$v->name] = $v->value;
            }
        }

        foreach($defaultValues as $k => $v){
            if (!isset($options[$k])){
                $options[$k] = $v;
            }
        }

        return $options;
    }

    public function setUserOption($userId, $key, $value){
        global $DB;
        $DB->execute("insert into {local_recitdashboard_options} (userid, name, value)
        values(?, ?, ?)
        ON DUPLICATE KEY UPDATE value = ?", [$userId, $key, $value, $value]);
    }
}

class PersistCtrlMoodle3 extends PersistCtrl {
    public function reportQuiz_QueryNbQuestions(){
        
        $query = "SELECT ". $this->sql_uniqueid() ." uniqueId, (case when count(*) > 0 then 1 else 0 end) has_random_questions, count(*) nb_questions
        FROM {course_modules} t1 
        inner join {quiz_sections} t2 on t1.instance = t2.quizid
        inner join {quiz_slots} t3 on t3.quizid = t2.quizid
        inner join {question} t4 on t4.id = t3.questionid
        where t1.id = :activity and (t2.shufflequestions = 1 or t4.qtype= 'random')";
        return $query;
    }
}

class PersistCtrlMoodle4 extends PersistCtrl {
    public function reportQuiz_QueryNbQuestions() {
        $query = "SELECT ". $this->sql_uniqueid() ." uniqueId, (case when count(*) > 0 then 1 else 0 end) has_random_questions, count(*) nb_questions
        FROM {course_modules} t1 
        inner join {quiz_sections} t2 on t1.instance = t2.quizid
        inner join {quiz_slots} t3 on t3.quizid = t2.quizid
        inner join {question_references} t3_1 on t3.id = t3_1.itemid
        inner join {question} t4 on t4.id = t3_1.questionbankentryid
        where t1.id = :activity and (t2.shufflequestions = 1 or t4.qtype= 'random')";
        return $query;
    }
}