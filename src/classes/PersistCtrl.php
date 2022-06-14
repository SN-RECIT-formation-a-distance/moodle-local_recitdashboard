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
 * @copyright  2019 RÉCIT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace recitdashboard;

require_once __DIR__ . '/recitcommon/PersistCtrl.php';

use stdClass;
use DateTime;

/**
 * Singleton class
 */
class PersistCtrl extends MoodlePersistCtrl
{
    protected static $instance = null;
    
    /**
     * @param MySQL Resource
     * @return PersistCtrl
     */
    public static function getInstance($mysqlConn = null, $signedUser = null)
    {
        if(!isset(self::$instance)) {
            self::$instance = new self($mysqlConn, $signedUser);
        }
        return self::$instance;
    }
    
    protected function __construct($mysqlConn, $signedUser){
        parent::__construct($mysqlConn, $signedUser);
    }
    
    public function getCourseProgressionOverview($courseId, $groupId = 0){
        $vars = array();
        $whereStmt = " and 1 ";

        if($groupId > 0){
            $whereStmt = " and t3_2.id = :gid ";
            $vars['gid'] = $groupId;
        }
        $vars['courseid'] = $courseId;

        $query = "select *, round(coalesce(datediff(now(), date_start_user)/datediff(end_date_course,date_start_user)*100,0),2) as pct_time from 
            (select (@uniqueId := @uniqueId + 1) AS uniqueId, t1.courseid as course_id, 
            t2.userid as user_id, concat(t3.firstname, ' ', t3.lastname) as student_name,  
            concat('[', group_concat(distinct JSON_OBJECT('id', coalesce(t3_2.id, 0), 'name', coalesce(t3_2.name, '')) order by t3_2.name), ']') as group_list,
            round(sum(if(coalesce(t5.completionstate,0) = 1, 1, 0))/count(*),2) * 100 as pct_work, FROM_UNIXTIME(max(t5.timemodified)) as last_update,
            from_unixtime(t6.startdate) as date_start_user,
            from_unixtime(t6.enddate) as end_date_course
            from {enrol} as t1
            inner join {user_enrolments} as t2 on t1.id = t2.enrolid
            inner join {user} as t3 on t2.userid = t3.id and t3.deleted = 0 and t3.suspended = 0
            left join {groups_members} as t3_1 on t3.id = t3_1.userid
            left join {groups} as t3_2 on t3_1.groupid = t3_2.id and t3_2.courseid = t1.courseid
            inner join {course} as t6 on t1.courseid = t6.id and t6.visible = 1
            inner join {course_modules} as t4 on t1.courseid = t4.course
            left join {course_modules_completion} as t5 on t4.id = t5.coursemoduleid and t5.userid = t2.userid
            where t1.courseid = :courseid and t4.completion = 1 $whereStmt
            group by user_id) tab
            order by pct_time desc, pct_work desc";
    
        $result = $this->getRecordsSQL($query, $vars);
        
        foreach($result as $item){
            $item->groups = json_decode($item->groupList);
        }

        return $result;
    }
    
    public function getCourseProgressionOverviewByGroups($courseId, $groupId = 0){
        $data = $this->getCourseProgressionOverview($courseId, $groupId);

        $result = array();

        $threshold = 0.05; 
        foreach($data as $item){
            foreach($item->groups as $group){
                if(!isset($result[$group->id])){
                    $result[$group->id] = new stdClass();
                    $result[$group->id]->nb = 0;
                    $result[$group->id]->g = 0;
                    $result[$group->id]->gDesc = '% '.get_string('work', 'local_recitdashboard').' > % '.get_string('work', 'local_recitdashboard').'';
                    $result[$group->id]->y = 0;
                    $result[$group->id]->yDesc = '(% '.get_string('work', 'local_recitdashboard').' * 5%) > % '.get_string('time', 'local_recitdashboard').'';
                    $result[$group->id]->r = 0;
                    $result[$group->id]->rDesc = '% '.get_string('work', 'local_recitdashboard').' < % '.get_string('time', 'local_recitdashboard').'';
                    $result[$group->id]->group = $group;
                }

                if($item->pctTime < $item->pctWork){
                    $result[$group->id]->g++;
                }
                else if($item->pctTime < $item->pctWork + ($item->pctWork * $threshold)){
                    $result[$group->id]->y++;
                }
                else{
                    $result[$group->id]->r++;
                }

                $result[$group->id]->nb++;
            }
        }

        foreach($result as $group){
            $group->g = $group->g / $group->nb * 100;
            $group->y = $group->y / $group->nb * 100;
            $group->r = $group->r / $group->nb * 100;
            unset($group->nb);
        }

        return array_values($result);
    }

    public function getCourseGradesOverviewByGroups($courseId, $groupId = 0){
        $whereStmt = "";
        $vars = array();

        if($groupId > 0){
            $whereStmt = " and t3_1.groupid = :gid ";
            $vars['gid'] = $groupId;
        }
        $vars['courseid'] = $courseId;

        $query = "select (@uniqueId := @uniqueId + 1) AS uniqueId, group_id, group_name, (g / (g+y+r) * 100) as g, '> 80' as  g_desc, (y / (g+y+r) * 100) as y, '>= 70' as  y_desc, (r / (g+y+r) * 100) as r, '< 70' as r_desc from
        (select group_id, group_name, sum(if(final_grade_pct > 80, 1, 0)) as g , sum(if(final_grade_pct >= 70, 1, 0)) as y, sum(if(final_grade_pct < 70, 1, 0)) as r
        from
        (SELECT coalesce(t3_2.id, 0) as group_id, coalesce(t3_2.name,'') as group_name, t3.id as user_id, concat(t3.firstname, ' ', t3.lastname) as student_name, COALESCE((t2.finalgrade / t1.grademax) * 100, 0) as final_grade_pct
                    FROM {grade_items} as t1                
                        inner join {grade_grades} as t2 on t1.id = t2.itemid
                        inner join {user} as t3 on t2.userid = t3.id and t3.deleted = 0 and t3.suspended = 0
                        left join {groups_members} as t3_1 on t3.id = t3_1.userid
                        left join {groups} as t3_2 on t3_1.groupid = t3_2.id and t3_2.courseid = t1.courseid 
                        WHERE t1.courseid = :courseid and itemtype = 'course' $whereStmt
                        group by t3_2.id, t3.id, t2.finalgrade, t1.grademax) as tab1
        group by group_name) as tab2";

        return $this->getRecordsSQL($query, $vars);
    }
    
    public function getGroupsOverview($courseId, $groupId = 0){
        $progress = $this->getCourseProgressionOverviewByGroups($courseId, $groupId);
        $grades = $this->getCourseGradesOverviewByGroups($courseId, $groupId);

        $result = array();

        foreach($progress as $item){
            if(!isset($result[$item->group->id])){
                $result[$item->group->id] = new stdClass();                
            }

            $result[$item->group->id]->progress = $item;
        }

        foreach($grades as $item){
            if(!isset($result[$item->groupId])){
                $result[$item->groupId] = new stdClass();                
            }

            $item->group = new stdClass();
            $item->group->id = $item->groupId;
            $item->group->name = $item->groupName;
            unset($item->groupId);
            unset($item->groupName);

            $result[$item->group->id]->grades = $item;
        }

        $result = array_values($result);

        function cmp($a, $b) {
            return strcmp($a->progress->group->name, $b->progress->group->name);
        }

        // sort by student name and question slot
        usort($result, "recitdashboard\cmp");

        return $result;
    }

    public function getWorkFollowup($courseId, $groupId = 0){
        global $CFG;

        $whereStmt = "";
        $vars = array();

        if(is_int($groupId) && $groupId > 0){
            $whereStmt = " and exists(select id from {groups_members} as tgm where tgm.groupid = $groupId and tuser.userid = tgm.userid)";
        }

        $stmtStudentRole = $this->getStmtStudentRole('tuser.userid', 't1.course');

        $query = "(SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t3.id as cm_id, t1.name as cm_name, FROM_UNIXTIME(t1.duedate) as due_date, FROM_UNIXTIME(min(tuser.timemodified)) as time_modified, count(*) as nb_items, group_concat(tuser.userid) as user_ids,
        concat(:assignurl, t3.id) as url, 
        2 as state
        FROM {assign} as t1
        inner join {assign_submission} as tuser on t1.id = tuser.assignment
        inner join {course_modules} as t3 on t1.id = t3.instance and t3.module = (select id from {modules} where name = 'assign') and t1.course = t3.course
        left join {assign_grades} as t4 on t4.assignment = tuser.assignment and t4.userid = tuser.userid
        -- gather all assignments that need to be (re)graded
        where t1.course = $courseId and tuser.status = 'submitted' and (coalesce(t4.grade,0) <= 0 or tuser.timemodified > coalesce(t4.timemodified,0)) $whereStmt and $stmtStudentRole
        group by t3.id, t1.id)       
        union
        (select (@uniqueId := @uniqueId + 1) AS uniqueId, cm_id, cm_name, due_date, time_modified, count(*) as nb_items, min(user_ids), url, state from 
        (SELECT t1.id as cm_id, t2.name as cm_name, '' as due_date, max(t3.timemodified) as time_modified,  group_concat(distinct t3.userid) as user_ids, t3.attempt as quiz_attempt, t4.questionusageid, 
        concat(:quizurl,t1.id,'&mode=grading') as url, group_concat(tuser.state order by tuser.sequencenumber) as states,
        1 as state
        FROM 
        {course_modules} as t1 
        inner join {quiz} as t2 on t2.id = t1.instance and t1.module = (select id from {modules} where name = 'quiz') and t2.course = t1.course
        inner join {quiz_attempts} as t3 on t3.quiz = t2.id 
        inner join {question_attempts} as t4 on  t4.questionusageid = t3.uniqueid
        inner join {question_attempt_steps} as tuser on t4.id = tuser.questionattemptid
        where t1.course = $courseId $whereStmt  
        and t3.userid in (select st2.userid 
            from {role} as st1 
            inner join {role_assignments} as st2 on st1.id = st2.roleid 
            inner join {user_enrolments} as st3 on st2.userid = st3.userid
            inner join {enrol} as st4 on st3.enrolid = st4.id
            where st4.courseid = t1.course and st2.userid = t3.userid and  st1.shortname in ('student') and st2.contextid in (select id from {context} where instanceid = t1.course and contextlevel = 50))
        group by t1.id, t2.id, t3.id, t4.id) as tab
        where right(states, 12) = 'needsgrading'
        group by cm_id)";
        $vars['assignurl'] = $CFG->wwwroot.'/mod/assign/view.php?id=';
        $vars['quizurl'] = $CFG->wwwroot.'/mod/quiz/report.php?id=';

        if(file_exists("{$CFG->dirroot}/mod/recitcahiercanada/")){
            $query .= " union
            (SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t3.id as cm_id, CONVERT(t1.name USING utf8) as cm_name, '' as due_date, FROM_UNIXTIME(t1.timemodified) as time_modified, count(*) as nb_items, group_concat(tuser.userid) as user_ids,
            concat(:ccurl, t3.id, '&tab=1') as url,
            2 as state
            FROM {recitcahiercanada} as t1
            inner join {recitcc_cm_notes} as t2 on t1.id = t2.ccid
            left join {recitcc_user_notes} as tuser on t2.id = tuser.cccmid
            inner join {course_modules} as t3 on t1.id = t3.instance and t3.module = (select id from {modules} where name = 'recitcahiercanada') and t1.course = t3.course
            where if(tuser.id > 0 and length(tuser.note) > 0 and (length(REGEXP_REPLACE(trim(coalesce(tuser.feedback, '')), '<[^>]*>+', '')) = 0), 1, 0) = 1 
            and t1.course = $courseId and t2.notifyteacher = 1 $whereStmt and $stmtStudentRole
            group by t3.id, t1.id)";
            $vars['ccurl'] = $CFG->wwwroot.'/mod/recitcahiercanada/view.php?id=';
        }

        if(file_exists("{$CFG->dirroot}/mod/recitcahiertraces/")){
            $query .= " union
            (SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t3.id as cm_id, CONVERT(t1.name USING utf8) as cm_name, '' as due_date, FROM_UNIXTIME(t1.timemodified) as time_modified, count(*) as nb_items, group_concat(tuser.userid) as user_ids,
            concat(:cturl, t3.id, '&tab=1') as url,
            2 as state
            FROM {recitcahiertraces} as t1
            inner join {recitct_groups} as t2 on t1.id = t2.ctid
            left join {recitct_notes} as t4 on t2.id = t4.gid
            left join {recitct_user_notes} as tuser on t4.id = tuser.nid
            inner join {course_modules} as t3 on t1.id = t3.instance and t3.module = (select id from {modules} where name = 'recitcahiertraces') and t1.course = t3.course
            where if(tuser.id > 0 and length(tuser.note) > 0 and (length(REGEXP_REPLACE(trim(coalesce(tuser.feedback, '')), '<[^>]*>+', '')) = 0), 1, 0) = 1 
            and t1.course = $courseId and t4.notifyteacher = 1 $whereStmt and $stmtStudentRole
            group by t3.id, t1.id)";
            $vars['cturl'] = $CFG->wwwroot.'/mod/recitcahiertraces/view.php?id=';
        }

        $result = $this->getRecordsSQL($query, $vars);

        foreach($result as $item){
            $item->extra = new stdClass();
            if ($item->state == 1){
                $item->extra->description = get_string('tobegraded', 'local_recitdashboard');
            }
            if ($item->state == 2){
                $item->extra->description = get_string('toaddfeedback', 'local_recitdashboard');
            }
        }

        return $result;
    }

    public function getStudentFollowUp($courseId, $groupId = 0, $cmVisible = 1){
        global $CFG, $USER;

        $options = $this->getUserOptions($USER->id);
        $daysWithoutConnect = intval($options['dayswithoutconnect']);
        $daysDueIntervalMin = intval($options['daysdueintervalmin']);
        $daysDueIntervalMax = intval($options['daysdueintervalmax']);

        $stmtStudentRole = $this->getStmtStudentRole('t4.id', 't2.courseid');

        $visibleStmt = "";
        if($cmVisible != null){
            $visibleStmt = " and t5.visible = $cmVisible ";
        }

        $groupStmt = "";
        if($groupId > 0){
            $groupStmt = " and exists(select id from {groups_members} as tgm where tgm.groupid = $groupId and t4.id = tgm.userid) ";
        }

        $query = "
        (select (@uniqueId := @uniqueId + 1) AS uniqueId, t4.id as user_id, concat(t4.firstname, ' ', t4.lastname) as username, 
        JSON_OBJECT('nbDaysLastAccess', DATEDIFF(now(), from_unixtime(t4.lastaccess))) as issue
        from {user_enrolments} as t1
        inner join {enrol} as t2 on t1.enrolid = t2.id
        inner join {user} as t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        where t2.courseid = :course1 and (DATEDIFF(now(), from_unixtime(t4.lastaccess)) >= $daysWithoutConnect) and $stmtStudentRole $groupStmt)
        union
        (SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t4.id as user_id, concat(t4.firstname, ' ', t4.lastname) as username,  
        JSON_OBJECT('cmId', t5.id, 'cmName', t3.name, 'nbDaysLate', DATEDIFF(now(), from_unixtime(t3.duedate)), 'url', concat(:assignurl, t5.id)) as issue
        FROM {user_enrolments} as t1
        inner join {enrol} as t2 on t1.enrolid = t2.id
        inner join {assign} as t3 on t2.courseid = t3.course
        inner join {user} as t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        inner join {course_modules} as t5 on t3.id = t5.instance and t5.module = (select id from {modules} where name = 'assign') and t5.course = t2.courseid
        where 
            t2.courseid = :course2 and 
            (t3.duedate > 0 and from_unixtime(t3.duedate) < now() and DATEDIFF(now(), from_unixtime(t3.duedate)) between $daysDueIntervalMin and $daysDueIntervalMax) and 
            not EXISTS((select id from {assign_submission} as st1 where st1.assignment = t3.id and st1.userid = t4.id ))
            and $stmtStudentRole $visibleStmt $groupStmt
        )
        union
        (SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t4.id as user_id, concat(t4.firstname, ' ', t4.lastname) as username,  
        JSON_OBJECT('cmId', t5.id, 'cmName', t3.name, 'nbDaysLate', DATEDIFF(now(), from_unixtime(t3.timeclose)), 'url', concat(:quizurl, t5.id)) as issue
        FROM {user_enrolments} as t1
        inner join {enrol} as t2 on t1.enrolid = t2.id
        inner join {quiz} as t3 on t2.courseid = t3.course
        inner join {user} as t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        inner join {course_modules} as t5 on t3.id = t5.instance and t5.module = (select id from {modules} where name = 'quiz') and t5.course = t2.courseid
        where 
            t2.courseid = :course3 and 
            (t3.timeclose > 0 and from_unixtime(t3.timeclose) < now() and DATEDIFF(now(), from_unixtime(t3.timeclose)) between $daysDueIntervalMax and $daysDueIntervalMax) and 
            not EXISTS((select id from {quiz_attempts} as st1 where st1.quiz = t3.id and st1.userid = t4.id ))
            and $stmtStudentRole $visibleStmt $groupStmt
        )";

        $tmp = $this->getRecordsSQL($query, ['quizurl' => $CFG->wwwroot.'/mod/quiz/view.php?id=', 'assignurl' => $CFG->wwwroot.'/mod/assign/view.php?id=', 'course1' => $courseId, 'course2' => $courseId, 'course3' => $courseId]);

        $result = array();
        foreach($tmp as $item){
            if(!isset($result[$item->userId])){
                $result[$item->userId] = new stdClass();
                $result[$item->userId]->userId = $item->userId;
                $result[$item->userId]->username = $item->username;
                $result[$item->userId]->issues = array();
            }

            $result[$item->userId]->issues[] = json_decode($item->issue);
        }

        $result = array_values($result);

        function cmp($a, $b) {
            return strcmp($a->username, $b->username);
        }

        usort($result, "recitdashboard\cmp");

        return $result;
    }

    public function reportSectionResults($courseId, $groupId, $cmVisible = 1){
        $stmtStudentRole = $this->getStmtStudentRole('t3.id', 't1.courseid');

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

        $query = "SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t1.courseid as course_id, t1.itemname as item_name, t1.itemmodule as item_module, 
        coalesce(max(t2.finalgrade),-1) as final_grade, t3.id as user_id, t3.firstname as first_name, t3.lastname as last_name, 
        t4.id as cm_id, t4.section as section_id, group_concat(t5.groupid) as group_ids, round(max(t2.finalgrade)/max(t1.grademax)*100,1) as success_pct,
        max(t1.grademax) as grade_max,
        (case t1.itemmodule 
            when 'quiz' then (select JSON_OBJECT('attempt', st1.id)  
                                from {quiz_attempts} as st1 where st1.quiz = t4.instance and st1.userid = t3.id and st1.state = 'finished' order by st1.attempt desc limit 1 )           
            else null end) as extra
        FROM {grade_items} as t1
        inner join {grade_grades} as t2 on t1.id = t2.itemid and t2.timecreated is not null
        inner join {user} as t3 on t3.id = t2.userid and t3.deleted = 0 and t3.suspended = 0
        inner join {course_modules} as t4 on t4.course = t1.courseid and t4.module = (select id from {modules} where name = t1.itemmodule order by name asc limit 1) and t4.instance = t1.iteminstance
        left join {groups_members} as t5 on t3.id = t5.userid
        inner join {groups} as t5_1 on t5.groupid = t5_1.id and t5_1.courseid = t1.courseid
        inner join {course_sections} as t6 on t4.section = t6.id
        where t1.courseid = :course and $stmtStudentRole $whereStmt
        group by t1.courseid, t3.id, t4.id, t1.itemname, t1.itemmodule
        order by t6.section, find_in_set(cm_id, t6.`sequence`), concat(first_name, ' ', last_name) asc";

        $tmp = $this->getRecordsSQL($query, $vars);

        $result = array();
        $cmList = array(); // gather all activities to create the columns 
        foreach($tmp as $item){
            // gather the user information
            if(!isset($result[$item->userId])){
                $result[$item->userId] = new stdClass();
                $result[$item->userId]->userId = $item->userId;
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
            $grade->extra = json_decode($item->extra);
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

        return array_values($result);
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

        $query = "SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t1.course as course_id, t3.id as user_id, t3.firstname as first_name, t3.lastname as last_name, t1.id as cm_id, group_concat(t5.groupid) as group_ids, 
        coalesce(t2.completionstate,-1) as completion_state, from_unixtime(t2.timemodified) as time_modified
        FROM {course_modules} as t1 
        inner join {course_sections} as t4 on t4.id = t1.section 
        inner join {role_assignments} as st2 on st2.contextid in (select id from {context} where instanceid = t1.course and contextlevel = 50)
        inner join {role} as st1 on st1.id = st2.roleid
        inner join {user} as t3 on t3.id = st2.userid and t3.deleted = 0 and t3.suspended = 0
        left join {groups_members} as t5 on t3.id = t5.userid 
        left join {course_modules_completion} as t2 on t1.id = t2.coursemoduleid and t3.id = t2.userid
        where t1.course = :course and st1.shortname in ('student') $whereStmt
        group by t1.course, t1.id, t2.id, t3.id order by t4.section, find_in_set(cm_id, t4.`sequence`), concat(first_name, ' ', last_name) asc";

        $tmp = $this->getRecordsSQL($query, $vars);
        
        $result = array();
        foreach($tmp as $item){
            $item->groupIds = explode(",", $item->groupIds);

            if(!isset($result[$item->userId])){
                $result[$item->userId] = new stdClass();
                $result[$item->userId]->courseId = $item->courseId;
                $result[$item->userId]->userId = $item->userId;
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

        return array_values($result);
    }
    
    public function reportQuiz($courseId, $activityId, $groupId = 0){
        $groupStmt = "1";
        $vars = array();
        $vars['activity'] = $activityId;
        if($groupId > 0){
            $groupStmt = " t6_2.id = :group";
            $vars['group'] = $groupId;
        }

        $stmtStudentRole = $this->getStmtStudentRole('t6.id', 't1.id');

        $query = "SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, if(count(*) > 0, 1, 0) as has_random_questions, count(*) as nb_questions
        FROM {course_modules} as t1 
        inner join {quiz_sections} as t2 on t1.instance = t2.quizid
        inner join {quiz_slots} as t3 on t3.quizid = t2.quizid
        inner join {question} as t4 on t4.id = t3.questionid
        where t1.id = :activity and (t2.shufflequestions = 1 or t4.qtype= 'random')";
        $quiz = $this->getRecordsSQL($query, $vars);
        $quiz = array_pop($quiz);

        $queryPart1 = "SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t1.id as course_id, t1.shortname as course_name, t2.id as activity_id, t3.id as quiz_id, t3.name as quiz_name, 
                t3.sumgrades as quiz_sum_grades, t3.grade as quiz_max_grade,
                coalesce((select (case `state` when 'needsgrading' then -1 else fraction end) from mdl_question_attempt_steps as t5_1 where t5.id = t5_1.questionattemptid order by sequencenumber desc limit 1),0) as grade, 
                t5.slot,
                t4.attempt, t4.id as quiz_attempt_id,
                t4.state as attemp_state, if(t4.timestart > 0, from_unixtime(t4.timestart),'') as attempt_time_start,
                if(t4.timefinish > 0, from_unixtime(t4.timefinish), '') as attempt_time_finish,
                greatest(SEC_TO_TIME(t4.timefinish - t4.timestart),0) as elapsed_time,
                t6.id as user_id, t6.firstname as first_name, t6.lastname as last_name, t6.email, 
                group_concat(distinct coalesce(t6_2.name, 'na') order by t6_2.name) as group_name,";

        $queryPart2 = "FROM {course} as t1 
        inner join {course_modules} as t2 on t1.id= t2.course 
        inner join {modules} as t2_1 on t2.module = t2_1.id 
        inner join {quiz} as t3 on t2.instance = t3.id 
        inner join {quiz_attempts} as t4 on t4.quiz = t3.id 
        inner join {question_attempts} as t5 on t4.uniqueid = t5.questionusageid 
        inner join {user} as t6 on t4.userid = t6.id  and t6.deleted = 0 and t6.suspended = 0
        left join {groups_members} as t6_1 on t6.id = t6_1.userid 
        left join {groups} as t6_2 on t6_1.groupid = t6_2.id ";

        $queryPart3 = " where t2_1.name = 'quiz' and t2.id = :activity and t1.id = :course and $groupStmt and $stmtStudentRole";
        $queryPart4 = "order by t6.id, t5.slot, t4.sumgrades desc";
        $vars['activity'] = $activityId;
        $vars['course'] = $courseId;

        if($quiz->hasRandomQuestions == 1){
            $query = " $queryPart1 
            t5.maxmark as default_mark, 0 as question_id, '' as question_name,  '' as question_text, '' as tags 
            $queryPart2
            $queryPart3
            group by t1.id, t2.id, t3.id, t5.id, t6.id
            $queryPart4";
        }
        else{
            $query = " $queryPart1
            t5.maxmark as default_mark, t7.id as question_id, t7.name as question_name, 
            t7.questiontext as question_text, 
            (SELECT group_concat(name SEPARATOR ',') FROM {tag} WHERE id IN (SELECT tagid from {tag_instance} where itemid = t7.id and itemtype in ('question') )) as tags 
            $queryPart2
            inner join mdl_question as t7 on t5.questionid = t7.id 
            $queryPart3
            group by t1.id, t2.id, t3.id, t5.id, t6.id, t7.id
            $queryPart4";
        }

        $tmp = $this->getRecordsSQL($query, $vars);
        
        $result = new stdClass();
        $result->students = array();
        $result->questions = array();

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
                
                $obj->tags = explode(",", $item->tags);
                $result->questions[$item->slot] = $obj;
            }

            // students info
            if(!isset($result->students[$item->userId])){
                $obj = new stdClass();
                $obj->userId = $item->userId;
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
                $obj->attempState = get_string("state$item->attempState", 'quiz');
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


        function cmp1($a, $b) {
            return strcmp("{$a->firstName} {$a->lastName}", "{$b->firstName} {$b->lastName}");
        }

        function cmp2($a, $b) {
            return $a->slot > $b->slot;
        }

        // sort by student name and question slot
        usort($result->students, "recitdashboard\cmp1");
        usort($result->questions, "recitdashboard\cmp2");

        foreach($result->students as $student){
            foreach($student->quizAttempts as $attempt){
                usort($attempt->questions, "recitdashboard\cmp2");
            }
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
        $rst = $DB->get_records('recitdashboard_options', array('userid' => $userId));
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
        $DB->execute("insert into {recitdashboard_options} (userid, name, value)
        values(?, ?, ?)
        ON DUPLICATE KEY UPDATE value = ?", [$userId, $key, $value, $value]);
    }
}