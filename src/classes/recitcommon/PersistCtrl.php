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

require_once __DIR__ . '/MySQLiConn.php';

abstract class APersistCtrl
{
   /**
     * mysqli_native_moodle_database 
     */
    protected $mysqlConn;    
    protected $signedUser;
    protected $prefix = "";
   
    protected function __construct($mysqlConn, $signedUser){
        global $CFG;

        $this->mysqlConn = new RecitMySQLConn($mysqlConn);
        $this->signedUser = $signedUser;
        $this->prefix = $CFG->prefix;
    }

	public function checkSession(){
        return (isset($this->signedUser) && $this->signedUser->id > 0);
    }
}

abstract class MoodlePersistCtrl extends APersistCtrl{
    public function getCourseList($enrolled = null){
        $whereStmt = "";
        if($enrolled == 1){
            $whereStmt = "if(t5.userid is null, 0, 1) = $enrolled";
        }

        $query = "select t1.id as courseId, t1.fullname as courseName, if(t5.userid is null, 0, 1) as enrolled
        from {$this->prefix}course as t1
        left join {$this->prefix}enrol as t6 on t6.courseid = t1.id
        left join {$this->prefix}user_enrolments as t5 on t5.enrolid = t6.id and t5.userid = {$this->signedUser->id}
        where $whereStmt
        order by courseName asc";

        $result = $this->mysqlConn->execSQLAndGetObjects($query);

        return $result;
    }

    public function getSectionActivityList($courseId){
        $query = "select * from
        (select t2.id as sectionId, if(length(coalesce(t2.name, '')) = 0, concat('Section ', t2.section), t2.name) as sectionName, t3.id as cmId, t4.name as moduleName, 
            (case t4.name 	 
                when 'page' then (select name from {$this->prefix}page where id = t3.instance)
                when 'quiz' then (select name from {$this->prefix}quiz where id = t3.instance)
                when 'book' then (select name from {$this->prefix}book where id = t3.instance)
                when 'lesson' then (select name from {$this->prefix}lesson where id = t3.instance)
                when 'assignment' then (select name from {$this->prefix}assign where id = t3.instance)
                when 'scorm' then (select CONVERT(name USING utf8) from {$this->prefix}scorm where id = t3.instance)
                when 'h5pactivity' then (select CONVERT(name USING utf8) from {$this->prefix}h5pactivity where id = t3.instance)
                else 'none' end) as cmName
        from {$this->prefix}course_sections as t2 
        left join {$this->prefix}course_modules as t3 on t2.id = t3.section
        left join {$this->prefix}modules as t4 on t4.id = t3.module
        where t2.course = $courseId) as tab
        where cmName != 'none'
        order by sectionName asc, moduleName asc";

        $result = $this->mysqlConn->execSQLAndGetObjects($query);


        return $result;
    }

    public function getEnrolledUserList($cmId = 0, $userId = 0, $courseId = 0){
        $cmStmt = " 1 ";
        if($cmId > 0){
            $cmStmt = "(t1.courseid = (select course from {$this->prefix}course_modules where id = $cmId))";
        }

        $userStmt =  " 1 ";
        if($userId > 0){
            $userStmt = " (t3.id = $userId)";
        }

        $courseStmt = " 1 ";
        if($courseId > 0){
            $courseStmt = "(t1.courseid = $courseId)";
        }

        // This query fetch all students with their groups. The groups belong to the course according to the parameter.
        // In case a student has no group, the left join in the first query add them to the result with groupId = 0.
        // In case there are no groups in the course, the second query adds (by union set) the students without group.

        $str = "(Pas de groupe)";
        $query = "(select t1.enrol, t1.courseid as courseId, t3.id as userId, concat(t3.firstname, ' ', t3.lastname) as userName, coalesce(t5.id,-1) as groupId, 
            coalesce(t5.name, '$str') as groupName 
            from {$this->prefix}enrol as t1
        inner join {$this->prefix}user_enrolments as t2 on t1.id = t2.enrolid
        inner join {$this->prefix}user as t3 on t2.userid = t3.id and t3.suspended = 0 and t3.deleted = 0
        left join {$this->prefix}groups_members as t4 on t3.id = t4.userid
        left join {$this->prefix}groups as t5 on t4.groupid = t5.id
        where (t1.courseid = t5.courseid) and $cmStmt and $userStmt and $courseStmt
        order by groupName asc, userName asc)
        union
        (select t1.enrol, t1.courseid as courseId, t3.id as userId, concat(t3.firstname, ' ', t3.lastname) as userName, -1 as groupId, '$str' as groupName 
        from {$this->prefix}enrol as t1
        inner join {$this->prefix}user_enrolments as t2 on t1.id = t2.enrolid
        inner join {$this->prefix}user as t3 on t2.userid = t3.id and t3.suspended = 0 and t3.deleted = 0
        where $cmStmt and $userStmt and $courseStmt
        order by userName asc)";
        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);    

        $result = array();
        foreach($tmp as $item){
            $result[$item->groupName][] = $item;
        }

        return $result;
    }

    protected function getStmtStudentRole($userId, $courseId){
        // contextlevel = 50 = course context
        // user has role student and it is enrolled in the course
        $stmt = "(exists(select st1.id from {$this->prefix}role as st1 inner join {$this->prefix}role_assignments as st2 on st1.id = st2.roleid
        where st2.userid = $userId and st2.contextid in (select id from {$this->prefix}context where instanceid = $courseId and contextlevel = 50) and st1.shortname in ('student'))
        and exists(select st1.id from {$this->prefix}enrol as st1 inner join {$this->prefix}user_enrolments as st2 on st1.id = st2.enrolid where st1.courseid = $courseId and st2.userid = $userId limit 1))";

        return $stmt;
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
        //$query = "SELECT * FROM `recit_vw_quiz_tag_result` where tagId = $tagId and userId = $userId";
        //return $this->mysqlConn->execSQLAndGetObjects($query);
        return $this->getReportDiagTagQuestion(0, $userId, $tagId, $courseId);
    }

    public function getReportDiagTagQuestion($activityId = 0, $userId = 0, $tagId = 0, $courseId = 0, $groupId = 0, $sectionId = 0){
        $userStmt = "1";
        if($userId > 0){
            $userStmt = " t6.id = $userId";
        }

        $groupStmt = "1";
        if($groupId > 0){
            $groupStmt = " t6_2.id = $groupId";
        }

        $activityStmt = "1";
        if($activityId > 0){
            $activityStmt = "  t2.id = $activityId";
        }

        $tagStmt = "1";
        if($tagId > 0){
            $tagStmt = " t9.id = $tagId";
        }
		
		$courseStmt = "1";
        if($courseId > 0){
            $courseStmt = " t1.id = $courseId";
        }

        $sectionStmt = "1";
        if($sectionId > 0){
            $sectionStmt = " t2.section = $sectionId";
        }

        $query = "SELECT t1.id as courseId, t1.shortname as course, t2.id as activityId, t3.id as quizId, t3.name as quiz, 
        t4.lastAttempt, 
        coalesce((select fraction from {$this->prefix}question_attempt_steps as t5_1 where t5.id = t5_1.questionattemptid order by sequencenumber desc limit 1),0) as grade,
        t6.id as userId, t6.firstname as firstName, t6.lastname as lastName, t6.email, 
        group_concat(distinct coalesce(t6_2.name, 'na') order by t6_2.name) as groupName,
        t7.defaultmark as gradeWeight, t7.id as questionId, 
        t9.id as tagId, t9.name as tagName
        FROM {$this->prefix}course as t1 
        inner join {$this->prefix}course_modules as t2 on t1.id= t2.course
		inner join {$this->prefix}modules as t2_1 on t2.module = t2_1.id
        inner join {$this->prefix}quiz as t3 on t2.instance = t3.id
        inner join (select max(attempt) as lastAttempt, max(id) as id, max(uniqueid) uniqueid, quiz, userid from {$this->prefix}quiz_attempts group by quiz, userid) as t4 on t3.id = t4.quiz
        inner join {$this->prefix}question_attempts as t5 on t4.uniqueid = t5.questionusageid 
        inner join {$this->prefix}user as t6 on t4.userid = t6.id
        left join {$this->prefix}groups_members as t6_1 on t6.id = t6_1.userid
        left join {$this->prefix}groups as t6_2 on t6_1.groupid = t6_2.id 
        inner join {$this->prefix}question as t7 on t5.questionid = t7.id
        inner join {$this->prefix}tag_instance as t8 on t7.id = t8.itemid and t8.itemtype in ('question')
        inner join {$this->prefix}tag as t9 on t8.tagid = t9.id
        where t2_1.name = 'quiz' and $activityStmt and $userStmt and $tagStmt and $courseStmt and $groupStmt and $sectionStmt
        group by t1.id, t2.id, t3.id, t5.id, t6.id, t7.id, t8.tagid, t9.id";

        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);
        return (empty($tmp) ? array() : $tmp);
    }
    
    public function getReportDiagTagQuiz($courseId, $userId = 0, $groupId = 0){
        $userStmt = "1";
        if($userId > 0){
            $userStmt = " t4.id = $userId";
        }

        $groupStmt = "1";
        if($groupId > 0){
            $groupStmt = "  t4_2.id = $groupId";
        }

        $query = "SELECT t1.course as courseId, t1.id as activityId, t1.name as activityName, t5.id as cmId, max(t2.attempt) as lastQuizAttempt, 
        t2.timestart as timeStart, t2.timefinish as timeEnd, t4.id as userId, t4.firstname as firstName, t4.lastname as lastName,
        t4.email, coalesce(max(t3.grade),0) / 10 as grade, 1 as gradeWeight, t7.id as tagId, t7.name as tagName,
        group_concat(distinct coalesce(t4_2.name, 'na') order by t4_2.name) as groupName
        from {$this->prefix}quiz as t1 
        inner join {$this->prefix}quiz_attempts as t2 on t1.id = t2.quiz
        inner join {$this->prefix}quiz_grades as t3 on t1.id = t3.quiz and t2.userid = t3.userid
        inner join {$this->prefix}user as t4 on t2.userid = t4.id
        left join {$this->prefix}groups_members as t4_1 on t4.id = t4_1.userid
        left join {$this->prefix}groups as t4_2 on t4_1.groupid = t4_2.id 
        inner join {$this->prefix}course_modules as t5 on t1.id = t5.instance and t5.module = (select id from {$this->prefix}modules where name = 'quiz')
        inner join {$this->prefix}tag_instance as t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {$this->prefix}tag as t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timestart, t2.timefinish, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);
        return (empty($tmp) ? array() : $tmp);
    }   

    public function getReportDiagTagAssignment($courseId, $userId = 0, $groupId = 0){
        $userStmt = "1";
        if($userId > 0){
            $userStmt = " t4.id = $userId";
        }

        $groupStmt = "1";
        if($groupId > 0){
            $groupStmt = "  t4_2.id = $groupId";
        }

        $query = "SELECT t1.course as courseId, t1.id as activityId, t1.name as activityName,  t5.id as cmId,
        t2.timecreated as timeStart, t2.timemodified as timeEnd, 
        t4.id as userId, t4.firstname as firstName, t4.lastname as lastName, t4.email, 
        coalesce(max(t3.grade),0) / 100 as grade, 1 as gradeWeight, t7.id as tagId, t7.name as tagName,
        group_concat(distinct coalesce(t4_2.name, 'na') order by t4_2.name) as groupName
        from {$this->prefix}assign as t1 
        inner join {$this->prefix}assign_submission as t2 on t1.id = t2.assignment
        inner join {$this->prefix}assign_grades as t3 on t1.id = t3.assignment and t2.userid = t3.userid
        inner join {$this->prefix}user as t4 on t2.userid = t4.id
        left join {$this->prefix}groups_members as t4_1 on t4.id = t4_1.userid
        left join {$this->prefix}groups as t4_2 on t4_1.groupid = t4_2.id 
        inner join {$this->prefix}course_modules as t5 on t1.id = t5.instance and t5.module = (select id from {$this->prefix}modules where name = 'assign')
        inner join {$this->prefix}tag_instance as t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {$this->prefix}tag as t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timecreated, t2.timemodified, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);
        return (empty($tmp) ? array() : $tmp);
    }  
    
    public function getReportDiagTagLesson($courseId,  $userId = 0, $groupId = 0){
        $userStmt = "1";
        if($userId > 0){
            $userStmt = " t4.id = $userId";
        }

        $groupStmt = "1";
        if($groupId > 0){
            $groupStmt = "  t4_2.id = $groupId";
        }

        $query = "SELECT t1.course as courseId, t1.id as activityId, t1.name as activityName, t5.id as cmId, 
        t2.timeseen as timeStart, coalesce(t3.completed, unix_timestamp()) as timeEnd, 
        t4.id as userId, t4.firstname as firstName, t4.lastname as lastName,
        t4.email, coalesce(max(t3.grade),0) / 100 as grade, 1 as gradeWeight, 
        group_concat(distinct coalesce(t4_2.name, 'na') order by t4_2.name) as groupName,
        t7.id as tagId, t7.name as tagName
        from {$this->prefix}lesson as t1 
        inner join {$this->prefix}lesson_attempts as t2 on t1.id = t2.lessonid
        left join {$this->prefix}lesson_grades as t3 on t1.id = t3.lessonid and t2.userid = t3.userid
        inner join {$this->prefix}user as t4 on t2.userid = t4.id
        left join {$this->prefix}groups_members as t4_1 on t4.id = t4_1.userid
        left join {$this->prefix}groups as t4_2 on t4_1.groupid = t4_2.id 
        inner join {$this->prefix}course_modules as t5 on t1.id = t5.instance and t5.module = (select id from {$this->prefix}modules where name = 'lesson')
        inner join {$this->prefix}tag_instance as t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {$this->prefix}tag as t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timeseen, timeEnd, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);
        return (empty($tmp) ? array() : $tmp);
    }
}