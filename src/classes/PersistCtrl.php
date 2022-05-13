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

require_once "$CFG->dirroot/local/recitcommon/php/PersistCtrl.php";
require_once "$CFG->dirroot/local/recitcommon/php/Utils.php";

use recitcommon;
use recitcommon\Utils;
use stdClass;
use DateTime;

/**
 * Singleton class
 */
class PersistCtrl extends recitcommon\MoodlePersistCtrl
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
        $whereStmt = " and 1 ";

        if($groupId > 0){
            $whereStmt = " and t3_2.id = $groupId ";
        }

        // (select from_unixtime(min(timecreated)) from {$this->prefix}logstore_standard_log as st1 where st1.userid = t3.id and st1.courseid = $courseId) dateStartUser,
        $query = "select *, round(coalesce(datediff(now(), dateStartUser)/datediff(endDateCourse,dateStartUser)*100,0),2) as pctTime from 
            (select t1.courseid as courseId, 
            t2.userid as userId, concat(t3.firstname, ' ', t3.lastname) as studentName,  
            concat('[', group_concat(distinct JSON_OBJECT('id', coalesce(t3_2.id, 0), 'name', coalesce(t3_2.name, '')) order by t3_2.name), ']') as groupList,
            round(sum(if(coalesce(t5.completionstate,0) = 1, 1, 0))/count(*),2) * 100 as pctWork, FROM_UNIXTIME(max(t5.timemodified)) as lastUpdate,
            from_unixtime(t6.startdate) as dateStartUser,
            from_unixtime(t6.enddate) as endDateCourse
            from {$this->prefix}enrol as t1
            inner join {$this->prefix}user_enrolments as t2 on t1.id = t2.enrolid
            inner join {$this->prefix}user as t3 on t2.userid = t3.id and t3.deleted = 0 and t3.suspended = 0
            left join {$this->prefix}groups_members as t3_1 on t3.id = t3_1.userid
            left join {$this->prefix}groups as t3_2 on t3_1.groupid = t3_2.id and t3_2.courseid = t1.courseid
            inner join {$this->prefix}course as t6 on t1.courseid = t6.id and t6.visible = 1
            inner join {$this->prefix}course_modules as t4 on t1.courseid = t4.course
            left join {$this->prefix}course_modules_completion as t5 on t4.id = t5.coursemoduleid and t5.userid = t2.userid
            where t1.courseid = $courseId and t4.completion = 1 $whereStmt
            group by userId) tab
            order by pctTime desc, pctWork desc";
    
        $result = $this->mysqlConn->execSQLAndGetObjects($query);
        
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
                    $result[$group->id]->gDesc = '% travail > % Temps';
                    $result[$group->id]->y = 0;
                    $result[$group->id]->yDesc = '(% travail * 5%) > % Temps';
                    $result[$group->id]->r = 0;
                    $result[$group->id]->rDesc = '% travail < % Temps';
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

        if($groupId > 0){
            $whereStmt = " and t3_1.groupid = $groupId ";
        }

        $query = "select groupId, groupName, (g / (g+y+r) * 100) as g, '> 80' as  gDesc, (y / (g+y+r) * 100) as y, '>= 70' as  yDesc, (r / (g+y+r) * 100) as r, '< 70' as rDesc from
        (select groupId, groupName, sum(if(finalGradePct > 80, 1, 0)) as g , sum(if(finalGradePct >= 70, 1, 0)) as y, sum(if(finalGradePct < 70, 1, 0)) as r
        from
        (SELECT coalesce(t3_2.id, 0) as groupId, coalesce(t3_2.name,'') as groupName, t3.id as userId, concat(t3.firstname, ' ', t3.lastname) as studentName, COALESCE((t2.finalgrade / t1.grademax) * 100, 0) as finalGradePct
                    FROM {$this->prefix}grade_items as t1                
                        inner join {$this->prefix}grade_grades as t2 on t1.id = t2.itemid
                        inner join {$this->prefix}user as t3 on t2.userid = t3.id and t3.deleted = 0 and t3.suspended = 0
                        left join {$this->prefix}groups_members as t3_1 on t3.id = t3_1.userid
                        left join {$this->prefix}groups as t3_2 on t3_1.groupid = t3_2.id and t3_2.courseid = t1.courseid 
                        WHERE t1.courseid = $courseId and itemtype = 'course'  $whereStmt
                        group by t3_2.id, t3.id, t2.finalgrade, t1.grademax) as tab1
        group by groupName) as tab2";

        return $this->mysqlConn->execSQLAndGetObjects($query);
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

        if($groupId > 0){
            $whereStmt = " and exists(select id from {$this->prefix}groups_members as tgm where tgm.groupid = $groupId and tuser.userid = tgm.userid)";
        }

        $stmtStudentRole = $this->getStmtStudentRole('tuser.userid', 't1.course');

        $query = "(SELECT t3.id as cmId, t1.name as cmName, FROM_UNIXTIME(t1.duedate) as dueDate, FROM_UNIXTIME(min(tuser.timemodified)) as timeModified, count(*) as nbItems, group_concat(tuser.userid) as userIds,
        concat('{$CFG->wwwroot}/mod/assign/view.php?id=', t3.id) as url, 
        JSON_OBJECT('description', 'à corriger') as extra
        FROM {$this->prefix}assign as t1
        inner join {$this->prefix}assign_submission as tuser on t1.id = tuser.assignment
        inner join {$this->prefix}course_modules as t3 on t1.id = t3.instance and t3.module = (select id from {$this->prefix}modules where name = 'assign') and t1.course = t3.course
        left join {$this->prefix}assign_grades as t4 on t4.assignment = tuser.assignment and t4.userid = tuser.userid
        -- il ramasse tous les devoirs où il y a besoin d'évaluation et la note n'est pas encore assignée ou si c'est une réévaluation
        where t1.course = $courseId and tuser.status = 'submitted' and (coalesce(t4.grade,0) <= 0 or tuser.timemodified > coalesce(t4.timemodified,0)) $whereStmt and $stmtStudentRole
        group by t3.id, t1.id)       
        union
        (select cmId, cmName, dueDate, timeModified, count(*) as nbItems, min(userIds), url, extra from 
        (SELECT  t1.id as cmId, t2.name as cmName, '' as dueDate, max(t3.timemodified) as timeModified,  group_concat(distinct t3.userid) as userIds, t3.attempt as quizAttempt, t4.questionusageid, 
        concat('{$CFG->wwwroot}/mod/quiz/report.php?id=',t1.id,'&mode=grading') as url, group_concat(tuser.state order by tuser.sequencenumber) as states,
        JSON_OBJECT('description', 'à corriger') as extra
        FROM 
        {$this->prefix}course_modules as t1 
        inner join {$this->prefix}quiz as t2 on t2.id = t1.instance and t1.module = (select id from {$this->prefix}modules where name = 'quiz') and t2.course = t1.course
        inner join {$this->prefix}quiz_attempts as t3 on t3.quiz = t2.id 
        inner join {$this->prefix}question_attempts as t4 on  t4.questionusageid = t3.uniqueid
        inner join {$this->prefix}question_attempt_steps as tuser on t4.id = tuser.questionattemptid
        where t1.course =  $courseId $whereStmt  
        and t3.userid in (select st2.userid 
            from {$this->prefix}role as st1 
            inner join {$this->prefix}role_assignments as st2 on st1.id = st2.roleid 
            inner join {$this->prefix}user_enrolments as st3 on st2.userid = st3.userid
            inner join {$this->prefix}enrol as st4 on st3.enrolid = st4.id
            where st4.courseid = t1.course and st2.userid = t3.userid and  st1.shortname in ('student') and st2.contextid in (select id from {$this->prefix}context where instanceid = t1.course and contextlevel = 50))
        group by t1.id, t2.id, t3.id, t4.id) as tab
        where right(states, 12) = 'needsgrading'
        group by cmId)";

        if(file_exists("{$CFG->dirroot}/mod/recitcahiercanada/")){
            $query .= " union
            (SELECT t3.id as cmId, t1.name as cmName, '' as dueDate, FROM_UNIXTIME(t1.timemodified) as timeModified, count(*) as nbItems, group_concat(tuser.userid) as userIds,
            concat('{$CFG->wwwroot}/mod/recitcahiercanada/view.php?id=', t3.id, '&tab=1') as url,
            JSON_OBJECT('description', 'à ajouter une rétroaction') as extra
            FROM {$this->prefix}recitcahiercanada as t1
            inner join {$this->prefix}recitcc_cm_notes as t2 on t1.id = t2.ccid
            left join {$this->prefix}recitcc_user_notes as tuser on t2.id = tuser.cccmid
            inner join {$this->prefix}course_modules as t3 on t1.id = t3.instance and t3.module = (select id from {$this->prefix}modules where name = 'recitcahiercanada') and t1.course = t3.course
            where if(tuser.id > 0 and length(tuser.note) > 0 and (length(REGEXP_REPLACE(trim(coalesce(tuser.feedback, '')), '<[^>]*>+', '')) = 0), 1, 0) = 1 
            and t1.course = $courseId and t2.notifyteacher = 1 $whereStmt and $stmtStudentRole
            group by t3.id, t1.id)";
        }

        if(file_exists("{$CFG->dirroot}/mod/recitcahiertraces/")){
            $query .= " union
            (SELECT t3.id as cmId, t1.name as cmName, '' as dueDate, FROM_UNIXTIME(t1.timemodified) as timeModified, count(*) as nbItems, group_concat(tuser.userid) as userIds,
            concat('{$CFG->wwwroot}/mod/recitcahiertraces/view.php?id=', t3.id, '&tab=1') as url,
            JSON_OBJECT('description', 'à ajouter une rétroaction') as extra
            FROM {$this->prefix}recitcahiertraces as t1
            inner join {$this->prefix}recitct_groups as t2 on t1.id = t2.ctid
            left join {$this->prefix}recitct_notes as t4 on t2.id = t4.gid
            left join {$this->prefix}recitct_user_notes as tuser on t4.id = tuser.nid
            inner join {$this->prefix}course_modules as t3 on t1.id = t3.instance and t3.module = (select id from {$this->prefix}modules where name = 'recitcahiertraces') and t1.course = t3.course
            where if(tuser.id > 0 and length(tuser.note) > 0 and (length(REGEXP_REPLACE(trim(coalesce(tuser.feedback, '')), '<[^>]*>+', '')) = 0), 1, 0) = 1 
            and t1.course = $courseId and t4.notifyteacher = 1 $whereStmt and $stmtStudentRole
            group by t3.id, t1.id)";
        }

        $result = $this->mysqlConn->execSQLAndGetObjects($query);

        /*foreach($result as $item){
            $item->extra = json_encode($item->extra);
        }*/

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
            $groupStmt = " and exists(select id from {$this->prefix}groups_members as tgm where tgm.groupid = $groupId and t4.id = tgm.userid) ";
        }

        $query = "
        (select t4.id as userId, concat(t4.firstname, ' ', t4.lastname) as username, 
        JSON_OBJECT('nbDaysLastAccess', DATEDIFF(now(), from_unixtime(t4.lastaccess))) as issue
        from {$this->prefix}user_enrolments as t1
        inner join {$this->prefix}enrol as t2 on t1.enrolid = t2.id
        inner join {$this->prefix}user as t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        where t2.courseid = $courseId and (DATEDIFF(now(), from_unixtime(t4.lastaccess)) >= $daysWithoutConnect) and $stmtStudentRole $groupStmt)
        union
        (SELECT t4.id as userId, concat(t4.firstname, ' ', t4.lastname) as username,  
        JSON_OBJECT('cmId', t5.id, 'cmName', t3.name, 'nbDaysLate', DATEDIFF(now(), from_unixtime(t3.duedate)), 'url', concat('{$CFG->wwwroot}/mod/assign/view.php?id=', t5.id)) as issue
        FROM {$this->prefix}user_enrolments as t1
        inner join {$this->prefix}enrol as t2 on t1.enrolid = t2.id
        inner join {$this->prefix}assign as t3 on t2.courseid = t3.course
        inner join {$this->prefix}user as t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        inner join {$this->prefix}course_modules as t5 on t3.id = t5.instance and t5.module = (select id from {$this->prefix}modules where name = 'assign') and t5.course = t2.courseid
        where 
            t2.courseid = $courseId and 
            (t3.duedate > 0 and from_unixtime(t3.duedate) < now() and DATEDIFF(now(), from_unixtime(t3.duedate)) between $daysDueIntervalMin and $daysDueIntervalMax) and 
            not EXISTS((select id from {$this->prefix}assign_submission as st1 where st1.assignment = t3.id and st1.userid = t4.id ))
            and $stmtStudentRole $visibleStmt $groupStmt
        )
        union
        (SELECT t4.id as userId, concat(t4.firstname, ' ', t4.lastname) as username,  
        JSON_OBJECT('cmId', t5.id, 'cmName', t3.name, 'nbDaysLate', DATEDIFF(now(), from_unixtime(t3.timeclose)), 'url', concat('{$CFG->wwwroot}/mod/quiz/view.php?id=', t5.id)) as issue
        FROM {$this->prefix}user_enrolments as t1
        inner join {$this->prefix}enrol as t2 on t1.enrolid = t2.id
        inner join {$this->prefix}quiz as t3 on t2.courseid = t3.course
        inner join {$this->prefix}user as t4 on t1.userid = t4.id and t4.deleted = 0 and t4.suspended = 0
        inner join {$this->prefix}course_modules as t5 on t3.id = t5.instance and t5.module = (select id from {$this->prefix}modules where name = 'quiz') and t5.course = t2.courseid
        where 
            t2.courseid = $courseId and 
            (t3.timeclose > 0 and from_unixtime(t3.timeclose) < now() and DATEDIFF(now(), from_unixtime(t3.timeclose)) between $daysDueIntervalMax and $daysDueIntervalMax) and 
            not EXISTS((select id from {$this->prefix}quiz_attempts as st1 where st1.quiz = t3.id and st1.userid = t4.id ))
            and $stmtStudentRole $visibleStmt $groupStmt
        )";

        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);

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
        if($cmVisible != null){
            $whereStmt = " and t4.visible = $cmVisible";
        }

        if($groupId > 0){
            $whereStmt .= " and t5.groupId = $groupId ";
        }

        $query = "SELECT t1.courseid as courseId, t1.itemname as itemName, t1.itemmodule as itemModule, 
        coalesce(max(t2.finalgrade),-1) as finalGrade, t3.id as userId, t3.firstname as firstName, t3.lastname as lastName, 
        t4.id as cmId, t4.section as sectionId, group_concat(t5.groupid) as groupIds, round(max(t2.finalgrade)/max(t1.grademax)*100,1) as successPct,
        max(t1.grademax) as gradeMax,
        (case t1.itemmodule 
            when 'quiz' then (select JSON_OBJECT('attempt', st1.id)  
                                from {$this->prefix}quiz_attempts as st1 where st1.quiz = t4.instance and st1.userid = t3.id and st1.state = 'finished' order by st1.attempt desc limit 1 )           
            else null end) as extra
        FROM `{$this->prefix}grade_items` as t1
        inner join {$this->prefix}grade_grades as t2 on t1.id = t2.itemid and t2.timecreated is not null
        inner join {$this->prefix}user as t3 on t3.id = t2.userid and t3.deleted = 0 and t3.suspended = 0
        inner join {$this->prefix}course_modules as t4 on t4.course = t1.courseid and t4.module = (select id from {$this->prefix}modules where name = t1.itemmodule order by name asc limit 1) and t4.instance = t1.iteminstance
        left join {$this->prefix}groups_members as t5 on t3.id = t5.userid
        inner join {$this->prefix}groups as t5_1 on t5.groupid = t5_1.id and t5_1.courseid = t1.courseid
        inner join {$this->prefix}course_sections as t6 on t4.section = t6.id
        where t1.courseid = $courseId  and $stmtStudentRole $whereStmt
        group by t1.courseid, t3.id, t4.id, t1.itemname, t1.itemmodule
        order by t6.section, find_in_set(cmId, t6.`sequence`), concat(firstName, ' ', lastName) asc";

        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);

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
        if($groupId > 0){
            $whereStmt = " and t5.groupId = $groupId";
        }

        $query = "SELECT t1.course as courseId, t3.id as userId, t3.firstname as firstName, t3.lastname as lastName, t1.id as cmId, group_concat(t5.groupid) as groupIds, 
        coalesce(t2.completionstate,-1) as completionState, from_unixtime(t2.timemodified) as timeModified
        FROM {$this->prefix}course_modules as t1 
        inner join {$this->prefix}course_sections as t4 on t4.id = t1.section 
        inner join {$this->prefix}role_assignments as st2 on st2.contextid in (select id from {$this->prefix}context where instanceid = t1.course and contextlevel = 50)
        inner join {$this->prefix}role as st1 on st1.id = st2.roleid
        inner join {$this->prefix}user as t3 on t3.id = st2.userid and t3.deleted = 0 and t3.suspended = 0
        left join {$this->prefix}groups_members as t5 on t3.id = t5.userid 
        left join {$this->prefix}course_modules_completion as t2 on t1.id = t2.coursemoduleid and t3.id = t2.userid
        where t1.course = $courseId and st1.shortname in ('student') $whereStmt
        group by t1.course, t1.id, t2.id, t3.id order by t4.section, find_in_set(cmId, t4.`sequence`), concat(firstName, ' ', lastName) asc";

        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);
        
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
        if($groupId > 0){
            $groupStmt = " t6_2.id = $groupId";
        }

        $stmtStudentRole = $this->getStmtStudentRole('t6.id', 't1.id');

        $query = "SELECT if(count(*) > 0, 1, 0) as hasRandomQuestions,  count(*) as nbQuestions
        FROM {$this->prefix}course_modules as t1 
        inner join {$this->prefix}quiz_sections as t2 on t1.instance = t2.quizid
        inner join {$this->prefix}quiz_slots as t3 on t3.quizid = t2.quizid
        inner join {$this->prefix}question as t4 on t4.id = t3.questionid
        where t1.id = $activityId and (t2.shufflequestions = 1 or t4.qtype= 'random')";
        $quiz = $this->mysqlConn->execSQLAndGetObject($query);

        $queryPart1 =  "SELECT t1.id as courseId, t1.shortname as courseName, t2.id as activityId, t3.id as quizId, t3.name as quizName, 
                t3.sumgrades as quizSumGrades, t3.grade as quizMaxGrade,
                coalesce((select (case `state` when 'needsgrading' then -1 else fraction end) from mdl_question_attempt_steps as t5_1 where t5.id = t5_1.questionattemptid order by sequencenumber desc limit 1),0) as grade, 
                t5.slot,
                t4.attempt, t4.id as quizAttemptId,
                t4.state as attempState, if(t4.timestart > 0, from_unixtime(t4.timestart),'') as attemptTimeStart,
                if(t4.timefinish > 0, from_unixtime(t4.timefinish), '') as attemptTimeFinish,
                greatest(SEC_TO_TIME(t4.timefinish - t4.timestart),0) as elapsedTime,
                t6.id as userId, t6.firstname as firstName, t6.lastname as lastName, t6.email, 
                group_concat(distinct coalesce(t6_2.name, 'na') order by t6_2.name) as groupName,";

        $queryPart2 = "FROM mdl_course as t1 
        inner join mdl_course_modules as t2 on t1.id= t2.course 
        inner join mdl_modules as t2_1 on t2.module = t2_1.id 
        inner join mdl_quiz as t3 on t2.instance = t3.id 
        inner join mdl_quiz_attempts as t4 on t4.quiz = t3.id 
        inner join mdl_question_attempts as t5 on t4.uniqueid = t5.questionusageid 
        inner join mdl_user as t6 on t4.userid = t6.id  and t6.deleted = 0 and t6.suspended = 0
        left join mdl_groups_members as t6_1 on t6.id = t6_1.userid 
        left join mdl_groups as t6_2 on t6_1.groupid = t6_2.id ";

        $queryPart3 = " where t2_1.name = 'quiz' and t2.id = $activityId and t1.id = $courseId and  $groupStmt and $stmtStudentRole";
        $queryPart4 = "order by t6.id, t5.slot, t4.sumgrades desc";

        if($quiz->hasRandomQuestions == 1){
            $query = " $queryPart1 
            t5.maxmark as defaultMark, 0 as questionId, '' as questionName,  '' as questionText, '' as tags 
            $queryPart2
            $queryPart3
            group by t1.id, t2.id, t3.id, t5.id, t6.id
            $queryPart4";
        }
        else{
            $query = " $queryPart1
            t5.maxmark as defaultMark, t7.id as questionId, t7.name as questionName, 
            t7.questiontext as questionText, 
            (SELECT group_concat(name SEPARATOR ',') FROM mdl_tag WHERE id IN (SELECT tagid from mdl_tag_instance where itemid = t7.id and itemtype in ('question') )) as tags 
            $queryPart2
            inner join mdl_question as t7 on t5.questionid = t7.id 
            $queryPart3
            group by t1.id, t2.id, t3.id, t5.id, t6.id, t7.id
            $queryPart4";
        }

        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);
        
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
                $obj->gradeWeight = $item->defaultMark * Utils::divide($item->quizMaxGrade, $item->quizSumGrades);
                
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