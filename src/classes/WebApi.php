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

require_once(dirname(__FILE__).'../../../../config.php');
require_once(dirname(__FILE__)."/recitcommon/WebApi.php");
require_once dirname(__FILE__).'/recitcommon/ReportDiagTag.php';
require_once(dirname(__FILE__).'/PersistCtrl.php');
require_once(dirname(__FILE__).'/../lib.php');

use Exception;
use stdClass;

class WebApi extends MoodleApi
{
    public function __construct($DB, $COURSE, $USER){
        parent::__construct($DB, $COURSE, $USER);
        PersistCtrl::getInstance($DB, $USER);
    }
    /**
     * $level [a = admin | s = student]
     */
    public function canUserAccess($level, $cmId = 0, $userId = 0, $courseId = 0){
        global $DB;
        $userId = $this->signedUser->id;
        $isTeacher = $DB->record_exists_sql('select id from {role_assignments} where userid=:userid and roleid in (select roleid from {role_capabilities} where capability=:name1)', ['userid' => $userId, 'name1' => RECITDASHBOARD_ACCESS_CAPABILITY]);

        
         // if the level is admin then the user must have access to CAPABILITY
        if(($level == 'a') && $isTeacher){
            return true;
        }
        // if the user is student then it has access only if it is accessing its own stuff
        else if(($level == 's') && ($userId == $this->signedUser->id)){
            return true;
        }
        else{
            throw new Exception(get_string('accessdenied'));
        }
    }
    
    public function getUserOptions($request){
        try{
            $result = new stdClass();
            $result->options = PersistCtrl::getInstance()->getUserOptions($this->signedUser->id);	
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->options);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }
    }
    
    public function setUserOption($request){
        try{
            $result = new stdClass();
            $result->options = PersistCtrl::getInstance()->setUserOption($this->signedUser->id, $request['key'], $request['value']);	
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->options);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }
    }

    public function getGroupsOverview($request){
        try{
            $courseId = intval($request['courseId']);
            $groupId = intval($request['groupId']);

            $this->canUserAccess('a', 0, 0, $courseId);
            
            $result = new stdClass();
            $result->details = PersistCtrl::getInstance()->getGroupsOverview($courseId, $groupId);
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } 

    public function getWorkFollowup($request){
        try{
            $courseId = intval($request['courseId']);
            $groupId = intval($request['groupId']);

            $this->canUserAccess('a', 0, 0, $courseId);
            
            $result = new stdClass();
            $result->details = PersistCtrl::getInstance()->getWorkFollowup($courseId, $groupId);
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } 

    public function getStudentFollowup($request){
        try{
            $courseId = intval($request['courseId']);
            $groupId = intval($request['groupId']);

            $this->canUserAccess('a', 0, 0, $courseId);
            
            $result = new stdClass();
            $result->details = PersistCtrl::getInstance()->getStudentFollowUp($courseId, $groupId, 1);
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } 

    public function reportSectionResults($request){
        try{
            $courseId = intval($request['courseId']);
            $groupId = intval($request['groupId']);
            $output = (isset($request['output']) ? $request['output'] : 'json');

            $this->canUserAccess('a', 0, 0, $courseId);
            
            switch($output){
                case 'json':
                    $result = new stdClass();
                    $result->details = PersistCtrl::getInstance()->reportSectionResults($courseId, $groupId);
                    $this->prepareJson($result);
                    break;
                case 'csv':
                    $data = PersistCtrl::getInstance()->reportSectionResults($courseId, $groupId);
                    return $this->reportSectionResultsAsCSV($data);
            }
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } 

    protected function reportSectionResultsAsCSV($data){
        try{                
            // header
            $arr = array(get_string('firstname'), get_string('lastname'));

            $student = current($data);
            foreach($student->grades as $grade){ 
                $arr[] = $grade->itemName;
            }

            $fileContent[] = $arr;

            foreach($data as $student){
                $arr = array($student->firstName, $student->lastName);

                foreach($student->grades as $grade){ 
                    $arr[] = sprintf("%s/%s", number_format($grade->finalGrade, 1, ",", ""), number_format($grade->gradeMax, 1, ",", ""));
                }
                $fileContent[] = $arr;
            }

            $filename = sys_get_temp_dir() . '/'.get_string('report', 'local_recitdashboard').'.csv';
            $file = $this->createCSVFile($filename, $fileContent);
            return new WebApiResult(true, $file, "", 'application/csv');
            
        }
        catch(Exception $ex){
            throw $ex;
        }     
    }   

    public function reportActivityCompletion($request){
        try{
            $courseId = intval($request['courseId']);
            $groupId = intval($request['groupId']);
            $output = (isset($request['output']) ? $request['output'] : 'json');

            $this->canUserAccess('a', 0, 0, $courseId);
            
            switch($output){
                case 'json':
                    $result = new stdClass();
                    $result->details = PersistCtrl::getInstance()->reportActivityCompletion($courseId, $groupId);
                    $this->prepareJson($result);
                break;
                case 'csv':
                    $data = PersistCtrl::getInstance()->reportActivityCompletion($courseId, $groupId);
                    return $this->reportActivityCompletionAsCSV($data);
            }
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } 

    protected function reportActivityCompletionAsCSV($data){
        try{                
            // header
            $arr = array(get_string('firstname'), get_string('lastname'));

            $student = current($data);
            foreach($student->activityList as $item){ 
                $desc = $item->cmName;
                if(!empty($item->completionExpected)){
                    $desc = sprintf("%s (%s)", $desc, $item->completionExpected->format("Y-m-d"));
                }
                $arr[] = $desc;
            }

            $fileContent[] = $arr;

            foreach($data as $student){
                $arr = array($student->firstName, $student->lastName);

                foreach($student->activityList as $item){ 
                    $arr[] = $item->completionState;
                }
                $fileContent[] = $arr;
            }

            $filename = sys_get_temp_dir() . '/'.get_string('report', 'local_recitdashboard').'.csv';
            $file = $this->createCSVFile($filename, $fileContent);
            return new WebApiResult(true, $file, "", 'application/csv');
        }
        catch(Exception $ex){
            throw $ex;
        }     
    }   

    public function reportQuiz($request){
        try{
            $courseId = intval($request['courseId']);
            $groupId = intval($request['groupId']);
            $cmId = intval($request['cmId']);
            $output = (isset($request['output']) ? $request['output'] : 'json');

            $this->canUserAccess('a', 0, 0, $courseId);
            
            switch($output){
                case 'json':
                    $result = new stdClass();
                    $result->details = PersistCtrl::getInstance()->reportQuiz($courseId, $cmId, $groupId);
                    $this->prepareJson($result);
                break;
                case 'csv':
                    $data = PersistCtrl::getInstance()->reportQuiz($courseId, $cmId, $groupId);
                    return $this->reportQuizAsCSV($data);
            }
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } 
    
    protected function reportQuizAsCSV($data){
        try{                
            // header
            $arr = array(get_string('firstname'), get_string('lastname'));
            $arr[] = get_string('attempts', 'local_recitdashboard');
            $arr[] = get_string('state', 'local_recitdashboard');
            $arr[] = get_string('beganat', 'local_recitdashboard');
            $arr[] = get_string('end', 'local_recitdashboard');
            $arr[] = get_string('timeconsumed', 'local_recitdashboard');
            $arr[] = get_string('grade', 'local_recitdashboard')."/". number_format($data->quizMaxGrade, 2);

            foreach($data->questions as $item){ 
                $arr[] = "Q.{$item->slot}/" . round($item->gradeWeight,2);
            }

            $fileContent[] = $arr;
            
            $arr = array(get_string('tags', 'local_recitdashboard'), "", "", "", "", "", "", "");

            foreach($data->questions as $item){ 
                $arr[] = implode(",", $item->tags);
            }

            $fileContent[] = $arr;

            foreach($data->students as $student){
                foreach($student->quizAttempts as $quizAttempt){
                    $row = array($student->firstName, $student->lastName);
                    $row[] = $quizAttempt->attempt;
                    $row[] = $quizAttempt->attempState;
                    $row[] = ($quizAttempt->attemptTimeStart instanceof DateTime ? $quizAttempt->attemptTimeStart->format("Y-m-d H:i:s") : $quizAttempt->attemptTimeStart);
                    $row[] = ($quizAttempt->attemptTimeFinish instanceof DateTime ? $quizAttempt->attemptTimeFinish->format("Y-m-d H:i:s") : $quizAttempt->attemptTimeFinish);
                    $row[] = "{$quizAttempt->elapsedTime}";
                    $row[] = number_format($quizAttempt->finalGrade, 2);
                
                    foreach($quizAttempt->questions as $question){
                        $row[] = number_format($question->weightedGrade, 2);
                    }
                    $fileContent[] = $row;
                }
            }

            $filename = sys_get_temp_dir() . '/'.get_string('quiz', 'local_recitdashboard').'-'.get_string('report', 'local_recitdashboard').'.csv';
            $file = $this->createCSVFile($filename, $fileContent);
            return new WebApiResult(true, $file, "", 'application/csv');
        }
        catch(Exception $ex){
            throw $ex;
        }     
    }   

    public function getReportDiagTag($request){
        try{
            $courseId = (isset($request['courseId']) ? intval($request['courseId']) : 0);
            $cmId = (isset($request['cmId']) ? intval($request['cmId']) : 0);
            $sectionId = (isset($request['sectionId']) ? intval($request['sectionId']) : 0);
            $userId = (isset($request['userId']) ? intval($request['userId']) : 0);
            $options = (isset($request['options']) ? explode(",", $request['options']) : array());
            $output = (isset($request['output']) ? $request['output'] : 'json');
            $groupId = (isset($request['groupId']) ? intval($request['groupId']) : 0);

            $this->canUserAccess('s', $cmId, $userId, $courseId);

            $result = new ReportDiagTagContent($this->dbConn);
            $result->loadContent($courseId, $cmId, $userId, $options, $groupId, $sectionId);

            if($output == "csv"){
                $result->courseName = $this->course->fullname;
                
                if(in_array('question', $options)){
                    $result->reportName = get_string('question', 'local_recitdashboard');
                }
                else{
                    $result->reportName = get_string('report', 'local_recitdashboard');
                }

                $writer = new ReportDiagTagCSVWriter($result, 'local_recitdashboard');
                $writer->writeReport();
                $data = new stdClass();
                $data->filename = $writer->getFilename();
                $data->charset = 'ISO-8859-1';
                return new WebApiResult(true, $data, "", 'application/csv');
            }
            else{
                $this->prepareJson($result);
                return new WebApiResult(true, $result);
            }
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }  
}