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

        $this->mysqlConn = $mysqlConn;
        $this->signedUser = $signedUser;
    }

	public function checkSession(){
        return (isset($this->signedUser) && $this->signedUser->id > 0);
    }

    public function getRecordsSQL($sql, $params = array()){

        $this->mysqlConn->execute("set @uniqueId = 0");
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
}

abstract class MoodlePersistCtrl extends APersistCtrl{
    public function getCourseList($enrolled = null){
        $whereStmt = "";
        $vars = array();
        if($enrolled == 1){
            $whereStmt = "if(t5.userid is null, 0, 1) = :enrolled";
            $vars['enrolled'] = $enrolled;
        }

        $query = "select (@uniqueId := @uniqueId + 1) AS uniqueId, t1.id as course_id, t1.fullname as course_name, if(t5.userid is null, 0, 1) as enrolled
        from {course} as t1
        left join {enrol} as t6 on t6.courseid = t1.id
        left join {user_enrolments} as t5 on t5.enrolid = t6.id and t5.userid = :user
        where $whereStmt
        order by course_name asc";
        $vars['user'] = $this->signedUser->id;

        $result = $this->getRecordsSQL($query, $vars);

        return $result;
    }

    public function getSectionActivityList($courseId){
        $query = "select * from
        (select (@uniqueId := @uniqueId + 1) AS uniqueId, t2.id as section_id, if(length(coalesce(t2.name, '')) = 0, concat('Section ', t2.section), t2.name) as section_name, t3.id as cm_id, t4.name as module_name, 
            (case t4.name 	 
                when 'page' then (select name from {page} where id = t3.instance)
                when 'quiz' then (select name from {quiz} where id = t3.instance)
                when 'book' then (select name from {book} where id = t3.instance)
                when 'lesson' then (select name from {lesson} where id = t3.instance)
                when 'assignment' then (select name from {assign} where id = t3.instance)
                when 'scorm' then (select CONVERT(name USING utf8) from {scorm} where id = t3.instance)
                when 'h5pactivity' then (select CONVERT(name USING utf8) from {h5pactivity} where id = t3.instance)
                else 'none' end) as cm_name
        from {course_sections} as t2 
        left join {course_modules} as t3 on t2.id = t3.section
        left join {modules} as t4 on t4.id = t3.module
        where t2.course = :course) as tab
        where cm_name != 'none'
        order by section_name asc, module_name asc";

        $result = $this->getRecordsSQL($query, ['course' => $courseId]);


        return $result;
    }

    public function getEnrolledUserList($cmId = 0, $userId = 0, $courseId = 0){
        $cmStmt = " 1 ";
        $vars = array();
        if($cmId > 0){
            $cmStmt = "(t1.courseid = (select course from {course_modules} where id = $cmId))";
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

        $vars['str'] = get_string("nogroup");
        $vars['str2'] = get_string("nogroup");
        $query = "(select (@uniqueId := @uniqueId + 1) AS uniqueId, t1.enrol, t1.courseid as course_id, t3.id as user_id, concat(t3.firstname, ' ', t3.lastname) as user_name, coalesce(t5.id,-1) as group_id, 
            coalesce(t5.name, :str) as group_name 
            from {enrol} as t1
        inner join {user_enrolments} as t2 on t1.id = t2.enrolid
        inner join {user} as t3 on t2.userid = t3.id and t3.suspended = 0 and t3.deleted = 0
        left join {groups_members} as t4 on t3.id = t4.userid
        left join {groups} as t5 on t4.groupid = t5.id
        where (t1.courseid = t5.courseid) and $cmStmt and $userStmt and $courseStmt
        order by group_name asc, user_name asc)
        union
        (select (@uniqueId := @uniqueId + 1) AS uniqueId, t1.enrol, t1.courseid as course_id, t3.id as user_id, concat(t3.firstname, ' ', t3.lastname) as user_name, -1 as group_id, :str2 as group_name 
        from {enrol} as t1
        inner join {user_enrolments} as t2 on t1.id = t2.enrolid
        inner join {user} as t3 on t2.userid = t3.id and t3.suspended = 0 and t3.deleted = 0
        where $cmStmt and $userStmt and $courseStmt
        order by user_name asc)";
        
        $tmp = $this->getRecordsSQL($query, $vars);

        $result = array();
        foreach($tmp as $item){
            $result[$item->groupName][] = $item;
        }

        return $result;
    }

    protected function getStmtStudentRole($userId, $courseId){
        // contextlevel = 50 = course context
        // user has role student and it is enrolled in the course
        $stmt = "(exists(select st1.id from {role} st1 inner join {role_assignments} st2 on st1.id = st2.roleid
        where st2.userid = $userId and st2.contextid in (select id from {context} where instanceid = $courseId and contextlevel = 50) and st1.shortname in ('student'))
        and exists(select st1.id from {enrol} st1 inner join {user_enrolments} st2 on st1.id = st2.enrolid where st1.courseid = $courseId and st2.userid = $userId limit 1))";

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
            $activityStmt = " t2.id = $activityId";
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

        $query = "SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t1.id as course_id, t1.shortname as course, t2.id as activity_id, t3.id as quiz_id, t3.name as quiz, 
        t4.lastattempt as last_attempt, 
        coalesce((select fraction from {question_attempt_steps} as t5_1 where t5.id = t5_1.questionattemptid order by sequencenumber desc limit 1),0) as grade,
        t6.id as user_id, t6.firstname as first_name, t6.lastname as last_name, t6.email, 
        group_concat(distinct coalesce(t6_2.name, 'na') order by t6_2.name) as group_name,
        t7.defaultmark as grade_weight, t7.id as question_id, 
        t9.id as tag_id, t9.name as tag_name
        FROM {course} as t1 
        inner join {course_modules} as t2 on t1.id= t2.course
		inner join {modules} as t2_1 on t2.module = t2_1.id
        inner join {quiz} as t3 on t2.instance = t3.id
        inner join (select max(attempt) as lastAttempt, max(id) as id, max(uniqueid) uniqueid, quiz, userid from {quiz_attempts} group by quiz, userid) as t4 on t3.id = t4.quiz
        inner join {question_attempts} as t5 on t4.uniqueid = t5.questionusageid 
        inner join {user} as t6 on t4.userid = t6.id
        left join {groups_members} as t6_1 on t6.id = t6_1.userid
        left join {groups} as t6_2 on t6_1.groupid = t6_2.id 
        inner join {question} as t7 on t5.questionid = t7.id
        inner join {tag_instance} as t8 on t7.id = t8.itemid and t8.itemtype in ('question')
        inner join {tag} as t9 on t8.tagid = t9.id
        where t2_1.name = 'quiz' and $activityStmt and $userStmt and $tagStmt and $courseStmt and $groupStmt and $sectionStmt
        group by t1.id, t2.id, t3.id, t5.id, t6.id, t7.id, t8.tagid, t9.id";

        $tmp = $this->getRecordsSQL($query);
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

        $query = "SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t1.course as course_id, t1.id as activity_id, t1.name as activity_name, t5.id as cm_id, max(t2.attempt) as last_quiz_attempt, 
        t2.timestart as time_start, t2.timefinish as time_end, t4.id as user_id, t4.firstname as first_name, t4.lastname as last_name,
        t4.email, coalesce(max(t3.grade),0) / 10 as grade, 1 as grade_weight, t7.id as tag_id, t7.name as tag_name,
        group_concat(distinct coalesce(t4_2.name, 'na') order by t4_2.name) as group_name
        from {quiz} as t1 
        inner join {quiz_attempts} as t2 on t1.id = t2.quiz
        inner join {quiz_grades} as t3 on t1.id = t3.quiz and t2.userid = t3.userid
        inner join {user} as t4 on t2.userid = t4.id
        left join {groups_members} as t4_1 on t4.id = t4_1.userid
        left join {groups} as t4_2 on t4_1.groupid = t4_2.id 
        inner join {course_modules} as t5 on t1.id = t5.instance and t5.module = (select id from {modules} where name = 'quiz')
        inner join {tag_instance} as t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {tag} as t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timestart, t2.timefinish, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->getRecordsSQL($query);
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

        $query = "SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t1.course as course_id, t1.id as activity_id, t1.name as activity_name, t5.id as cm_id,
        t2.timecreated as time_start, t2.timemodified as time_end, 
        t4.id as user_id, t4.firstname as first_name, t4.lastname as last_name, t4.email, 
        coalesce(max(t3.grade),0) / 100 as grade, 1 as gradeWeight, t7.id as tag_id, t7.name as tag_name,
        group_concat(distinct coalesce(t4_2.name, 'na') order by t4_2.name) as group_name
        from {assign} as t1 
        inner join {assign_submission} as t2 on t1.id = t2.assignment
        inner join {assign_grades} as t3 on t1.id = t3.assignment and t2.userid = t3.userid
        inner join {user} as t4 on t2.userid = t4.id
        left join {groups_members} as t4_1 on t4.id = t4_1.userid
        left join {groups} as t4_2 on t4_1.groupid = t4_2.id 
        inner join {course_modules} as t5 on t1.id = t5.instance and t5.module = (select id from {modules} where name = 'assign')
        inner join {tag_instance} as t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {tag} as t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timecreated, t2.timemodified, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->getRecordsSQL($query);
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

        $query = "SELECT (@uniqueId := @uniqueId + 1) AS uniqueId, t1.course as course_id, t1.id as activity_id, t1.name as activity_name, t5.id as cm_id, 
        t2.timeseen as time_start, coalesce(t3.completed, unix_timestamp()) as time_end, 
        t4.id as user_id, t4.firstname as first_name, t4.lastname as last_name,
        t4.email, coalesce(max(t3.grade),0) / 100 as grade, 1 as grade_weight, 
        group_concat(distinct coalesce(t4_2.name, 'na') order by t4_2.name) as group_name,
        t7.id as tag_id, t7.name as tag_name
        from {lesson} as t1 
        inner join {lesson_attempts} as t2 on t1.id = t2.lessonid
        left join {lesson_grades} as t3 on t1.id = t3.lessonid and t2.userid = t3.userid
        inner join {user} as t4 on t2.userid = t4.id
        left join {groups_members} as t4_1 on t4.id = t4_1.userid
        left join {groups} as t4_2 on t4_1.groupid = t4_2.id 
        inner join {course_modules} as t5 on t1.id = t5.instance and t5.module = (select id from {modules} where name = 'lesson')
        inner join {tag_instance} as t6 on t6.itemid = t5.id and t6.itemtype = 'course_modules'
        inner join {tag} as t7 on t6.tagid = t7.id
        where t1.course = $courseId and $userStmt and $groupStmt
        group by t1.id, t1.name, t2.timeseen, timeEnd, t4.id, t4.firstname, t4.lastname, t5.id, t7.id, t7.name";

        $tmp = $this->getRecordsSQL($query);
        return (empty($tmp) ? array() : $tmp);
    }
}