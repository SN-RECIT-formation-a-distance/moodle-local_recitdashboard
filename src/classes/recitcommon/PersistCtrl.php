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


abstract class APersistCtrl
{
    protected $mysqlConn;    
    protected $signedUser;
    protected $prefix = "";
   
    protected function __construct($mysqlConn, $signedUser){
        $this->mysqlConn = $mysqlConn;
        $this->signedUser = $signedUser;
    }

    public function getRecordsSQL($sql, $params = array()){
        $result = $this->mysqlConn->get_records_sql($sql, $params);
        
        foreach($result as $item){
            foreach((array)$item as $k => $v){
                if (strpos($k, '_') != false){
                    $key = preg_replace_callback("/_[a-z]?/", function($matches) {return strtoupper(ltrim($matches[0], "_"));}, $k);
                    $item->$key = $v;
                    unset($item->$k);
                }
            }
        }
        return array_values($result);
    }

    /**
     * Return SQL for performing group concatenation on given field/expression
     *
     * @param string $field
     * @param string $separator
     * @param string $sort
     * @return string
     */
    public function sql_group_concat(string $field, string $separator = ',', string $sort = ''): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            $fieldsort = $sort ? "ORDER BY {$sort}" : '';
            return "STRING_AGG(CAST({$field} AS VARCHAR), '{$separator}' {$fieldsort})";
        }else{
            $fieldsort = $sort ? "ORDER BY {$sort}" : '';
            return "GROUP_CONCAT({$field} {$fieldsort} SEPARATOR '{$separator}')";
        }
    }
    
    public function sql_uniqueid(): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            return "gen_random_uuid()";
        }else{
            return "uuid()";
        }
    }
    
    public function sql_from_unixtime($field): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            return "to_char(to_timestamp($field), 'yyyy-mm-dd HH24:MI:SS')";
        }else{
            return "FROM_UNIXTIME($field)";
        }
    }
    
    public function sql_to_time($field): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            return "to_timestamp($field)";
        }else{
            return "FROM_UNIXTIME($field)";
        }
    }
    
    public function sql_datediff($field, $field2): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            return "EXTRACT(DAY FROM $field - $field2)";
        }else{
            return "DATEDIFF($field, $field2)";
        }
    }
    
    public function sql_caststring($field): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            return "CAST($field AS STRING)";
        }else{
            return "$field";
        }
    }
    
    public function sql_castutf8($field): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            return "CAST($field AS STRING)";
        }else{
            return "CONVERT($field USING utf8)";
        }
    }
    
    public function sql_tojson(): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            return "jsonb_build_object";
        }else{
            return "JSON_OBJECT";
        }
    }
    
    public function sql_sectotime($field): string {
        global $CFG;
        if ($CFG->dbtype == 'pgsql'){
            return "to_char( ($field ||' seconds')::interval, 'HH24:MM:SS' )";
        }else{
            return "SEC_TO_TIME($field)";
        }
    }
}

abstract class MoodlePersistCtrl extends APersistCtrl{
    public function getCourseList(){
        $courses = enrol_get_users_courses($this->signedUser->id);
        $result = array();
        foreach ($courses as $c) {
            $ccontext = \context_course::instance($c->id);
            if (has_capability(RECITDASHBOARD_TEACHER_CAPABILITY, $ccontext)) {
                $result[] = array('courseId' => $c->id, 'courseName' => $c->fullname);
            }
        }

        return $result;
    }

    public function getSectionActivityList($courseId){
        $query = "select * from
        (select ". $this->sql_uniqueid() ." uniqueId, t2.section section, t2.id section_id, (case when length(coalesce(t2.name, '')) = 0 then concat('Section ', t2.section) else t2.name end) section_name, t3.id cm_id, t4.name module_name, 
            (case t4.name 	 
                when 'page' then (select name from {page} where id = t3.instance)
                when 'quiz' then (select name from {quiz} where id = t3.instance)
                when 'book' then (select name from {book} where id = t3.instance)
                when 'lesson' then (select name from {lesson} where id = t3.instance)
                when 'assign' then (select name from {assign} where id = t3.instance)
                when 'scorm' then (select ". $this->sql_castutf8('name')." from {scorm} where id = t3.instance)
                when 'h5pactivity' then (select ". $this->sql_castutf8('name')." from {h5pactivity} where id = t3.instance)
                else 'none' end) cm_name
        from {course_sections} t2 
        left join {course_modules} t3 on t2.id = t3.section
        left join {modules} t4 on t4.id = t3.module
        where t2.course = :course) tab
        where cm_name != 'none'
        order by section asc, module_name asc";

        $result = $this->getRecordsSQL($query, ['course' => $courseId]);


        return $result;
    }

    public function getEnrolledUserList($cmId = 0, $userId = 0, $courseId = 0){
        $cmStmt = " true ";
        $vars = array();
        if($cmId > 0){
            $cmStmt = "(t1.courseid = (select course from {course_modules} where id = $cmId))";
        }

        $userStmt =  " true ";
        if($userId > 0){
            $userStmt = " (t3.id = $userId)";
        }

        $courseStmt = " true ";
        if($courseId > 0){
            $courseStmt = "(t1.courseid = $courseId)";
        }

        // This query fetch all students with their groups. The groups belong to the course according to the parameter.
        // In case a student has no group, the left join in the first query add them to the result with groupId = 0.
        // In case there are no groups in the course, the second query adds (by union set) the students without group.

        $vars['str'] = get_string("nogroup", 'local_recitdashboard');
        $vars['str2'] = get_string("nogroup", 'local_recitdashboard');
        $query = "(select ". $this->sql_uniqueid() ." uniqueId, t1.id, t1.enrol, t1.courseid course_id, t3.id user_id, concat(t3.firstname, ' ', t3.lastname) user_name, coalesce(t5.id,-1) group_id, 
            coalesce(t5.name, :str) group_name 
            from {enrol} t1
        inner join {user_enrolments} t2 on t1.id = t2.enrolid
        inner join {user} t3 on t2.userid = t3.id and t3.suspended = 0 and t3.deleted = 0
        left join {groups_members} t4 on t3.id = t4.userid
        left join {groups} t5 on t4.groupid = t5.id
        where (t1.courseid = t5.courseid) and $cmStmt and $userStmt and $courseStmt
        order by group_name asc, user_name asc)
        union
        (select ". $this->sql_uniqueid() ." uniqueId, t1.id, t1.enrol, t1.courseid course_id, t3.id user_id, concat(t3.firstname, ' ', t3.lastname) user_name, -1 group_id, :str2 group_name 
        from {enrol} t1
        inner join {user_enrolments} t2 on t1.id = t2.enrolid
        inner join {user} t3 on t2.userid = t3.id and t3.suspended = 0 and t3.deleted = 0
        where $cmStmt and $userStmt and $courseStmt
        order by user_name asc)";
        
        $tmp = $this->getRecordsSQL($query, $vars);

        $result = array();
        foreach($tmp as $item){
            $result[$item->groupName][] = $item;
        }

        return $result;
    }
}

/**
 * Singleton class
 */
class DiagTagPersistCtrl extends MoodlePersistCtrl
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
    
    public function getTagRateList($tagId, $userId, $courseId){
        return $this->getReportDiagTagQuestion(0, $userId, $tagId, $courseId);
    }

    public function getReportDiagTagQuestion($activityId = 0, $userId = 0, $tagId = 0, $courseId = 0, $groupId = 0, $sectionId = 0){
        $userStmt = "true";
        if($userId > 0){
            $userStmt = " t6.id = $userId";
        }

        $groupStmt = "true";
        if($groupId > 0){
            $groupStmt = " t6_2.id = $groupId";
        }

        $activityStmt = "true";
        if($activityId > 0){
            $activityStmt = " t2.id = $activityId";
        }

        $tagStmt = "true";
        if($tagId > 0){
            $tagStmt = " t9.id = $tagId";
        }
		
		$courseStmt = "true";
        if($courseId > 0){
            $courseStmt = " t1.id = $courseId";
        }

        $sectionStmt = "true";
        if($sectionId > 0){
            $sectionStmt = " t2.section = $sectionId";
        }

        $query = "SELECT ". $this->sql_uniqueid() ." uniqueId, t1.id course_id, t1.shortname course, t2.id activity_id, t3.id quiz_id, t3.name quiz, 
        min(t4.lastattempt) last_attempt, 
        coalesce((select fraction from {question_attempt_steps} t5_1 where t5.id = t5_1.questionattemptid order by sequencenumber desc limit 1),0) grade,
        t6.id user_id, t6.firstname first_name, t6.lastname last_name, t6.email, 
        ". $this->sql_group_concat('coalesce(t6_2.name, \'na\')', ',', 't6_2.name') ." group_name,
        t7.defaultmark grade_weight, t7.id question_id, 
        t9.id tag_id, t9.name tag_name
        FROM {course} t1 
        inner join {course_modules} t2 on t1.id= t2.course
		inner join {modules} t2_1 on t2.module = t2_1.id
        inner join {quiz} t3 on t2.instance = t3.id
        inner join (select max(attempt) lastAttempt, max(id) id, max(uniqueid) uniqueid, quiz, userid from {quiz_attempts} group by quiz, userid) t4 on t3.id = t4.quiz
        inner join {question_attempts} t5 on t4.uniqueid = t5.questionusageid 
        inner join {user} t6 on t4.userid = t6.id
        left join {groups_members} t6_1 on t6.id = t6_1.userid
        left join {groups} t6_2 on t6_1.groupid = t6_2.id 
        inner join {question} t7 on t5.questionid = t7.id
        inner join {tag_instance} t8 on t7.id = t8.itemid and t8.itemtype in ('question')
        inner join {tag} t9 on t8.tagid = t9.id
        where t2_1.name = 'quiz' and $activityStmt and $userStmt and $tagStmt and $courseStmt and $groupStmt and $sectionStmt
        group by t1.id, t2.id, t3.id, t5.id, t6.id, t7.id, t8.tagid, t9.id";

        $tmp = $this->getRecordsSQL($query);
        return (empty($tmp) ? array() : $tmp);
    }
    
    public function getReportDiagTagQuiz($courseId, $userId = 0, $groupId = 0){
        $userStmt = "true";
        if($userId > 0){
            $userStmt = " t4.id = $userId";
        }

        $groupStmt = "true";
        if($groupId > 0){
            $groupStmt = "  t4_2.id = $groupId";
        }

        $query = "SELECT ". $this->sql_uniqueid() ." uniqueId, t1.course course_id, t1.id activity_id, t1.name activity_name, t5.id cm_id, max(t2.attempt) last_quiz_attempt, 
        t2.timestart time_start, t2.timefinish time_end, t4.id user_id, t4.firstname first_name, t4.lastname last_name,
        t4.email, coalesce(max(t3.grade),0) / 10 grade, 1 grade_weight, t7.id tag_id, t7.name tag_name,
        ". $this->sql_group_concat('coalesce(t4_2.name, \'na\')', ',', 't4_2.name') ." group_name
        from {quiz} t1 
        inner join {quiz_attempts} t2 on t1.id = t2.quiz
        inner join {quiz_grades} t3 on t1.id = t3.quiz and t2.userid = t3.userid
        inner join {user} t4 on t2.userid = t4.id
        left join {groups_members} t4_1 on t4.id = t4_1.userid
        left join {groups} t4_2 on t4_1.groupid = t4_2.id 
        inner join {course_modules} t5 on t1.id = t5.instance and t5.module = (select id from {modules} where name = 'quiz')
        inner join {tag_instance} t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {tag} t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timestart, t2.timefinish, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->getRecordsSQL($query);
        return (empty($tmp) ? array() : $tmp);
    }   

    public function getReportDiagTagAssignment($courseId, $userId = 0, $groupId = 0){
        $userStmt = "true";
        if($userId > 0){
            $userStmt = " t4.id = $userId";
        }

        $groupStmt = "true";
        if($groupId > 0){
            $groupStmt = " t4_2.id = $groupId";
        }

        $query = "SELECT ". $this->sql_uniqueid() ." uniqueId, t1.course course_id, t1.id activity_id, t1.name activity_name, t5.id cm_id,
        t2.timecreated time_start, t2.timemodified time_end, 
        t4.id user_id, t4.firstname first_name, t4.lastname last_name, t4.email, 
        coalesce(max(t3.grade),0) / 100 grade, 1 gradeWeight, t7.id tag_id, t7.name tag_name,
        ". $this->sql_group_concat('coalesce(t4_2.name, \'na\')', ',', 't4_2.name') ." group_name
        from {assign} t1 
        inner join {assign_submission} t2 on t1.id = t2.assignment
        inner join {assign_grades} t3 on t1.id = t3.assignment and t2.userid = t3.userid
        inner join {user} t4 on t2.userid = t4.id
        left join {groups_members} t4_1 on t4.id = t4_1.userid
        left join {groups} t4_2 on t4_1.groupid = t4_2.id 
        inner join {course_modules} t5 on t1.id = t5.instance and t5.module = (select id from {modules} where name = 'assign')
        inner join {tag_instance} t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {tag} t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timecreated, t2.timemodified, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->getRecordsSQL($query);
        return (empty($tmp) ? array() : $tmp);
    }  
    
    public function getReportDiagTagLesson($courseId,  $userId = 0, $groupId = 0){
        $userStmt = "true";
        if($userId > 0){
            $userStmt = " t4.id = $userId";
        }

        $groupStmt = "true";
        if($groupId > 0){
            $groupStmt = " t4_2.id = $groupId";
        }

        $query = "SELECT ". $this->sql_uniqueid() ." uniqueId, t1.course course_id, t1.id activity_id, t1.name activity_name, t5.id cm_id, 
        t2.timeseen time_start, coalesce(t3.completed, 0) time_end, 
        t4.id user_id, t4.firstname first_name, t4.lastname last_name,
        t4.email, coalesce(max(t3.grade),0) / 100 grade, 1 grade_weight, 
        ". $this->sql_group_concat('coalesce(t4_2.name, \'na\')', ',', 't4_2.name') ." group_name,
        t7.id tag_id, t7.name tag_name
        from {lesson} t1 
        inner join {lesson_attempts} t2 on t1.id = t2.lessonid
        left join {lesson_grades} t3 on t1.id = t3.lessonid and t2.userid = t3.userid
        inner join {user} t4 on t2.userid = t4.id
        left join {groups_members} t4_1 on t4.id = t4_1.userid
        left join {groups} t4_2 on t4_1.groupid = t4_2.id 
        inner join {course_modules} t5 on t1.id = t5.instance and t5.module = (select id from {modules} where name = 'lesson')
        inner join {tag_instance} t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {tag} t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timeseen, time_end, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->getRecordsSQL($query);
        return (empty($tmp) ? array() : $tmp);
    }
}