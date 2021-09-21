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

require_once(dirname(__FILE__).'../../../../config.php');
require_once "$CFG->dirroot/local/recitcommon/php/WebApi.php";
require_once dirname(__FILE__).'/PersistCtrl.php';
require_once "$CFG->dirroot/local/recitcommon/php/ReportDiagTag.php";

use recitcommon;
use recitcommon\WebApiResult;
use recitcommon\ReportDiagTagContent;
use recitcommon\ReportDiagTagCSVWriter;
use Exception;
use stdClass;

class WebApi extends recitcommon\MoodleApi
{
    public function __construct($DB, $COURSE, $USER){
        parent::__construct($DB, $COURSE, $USER);
        PersistCtrl::getInstance($DB, $USER);
    }
    
    /*public function getCourseProgressionOverview($request){
        try{
            $courseId = intval($request['courseId']);
            $groupId = (isset($request['groupId']) ? intval($request['groupId']) : 0);

            $this->canUserAccess('a', 0, 0, $courseId);
            
            $result = new stdClass();
            $result->details = PersistCtrl::getInstance()->getCourseProgressionOverview($courseId, $groupId);				
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } */
    
    /*public function getCourseProgressionDetails($request){
        try{
            $courseId = intval($request['courseId']);
            $userId = intval($request['userId']);

            $this->canUserAccess('s', 0, $userId, $courseId);
            
            $result = new stdClass();
            $result->details = PersistCtrl::getInstance()->getCourseProgressionDetails($courseId, $userId);			
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } */
    
    /*public function getCourseAttendance($request){
        try{
            $courseId = intval($request['courseId']);
            $groupId = (isset($request['groupId']) ? intval($request['groupId']) : 0);

            $this->canUserAccess('a', 0, 0, $courseId);
            
            $result = new stdClass();
            $result->details = PersistCtrl::getInstance()->getCourseAttendance($courseId, $groupId);				
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } */

    /*public function getStudentAssiduity($request){
        try{
            $courseId = intval($request['courseId']);
            $userId = intval($request['userId']);

            $this->canUserAccess('s', 0, $userId, $courseId);
            
            $result = new stdClass();
            $result->details = PersistCtrl::getInstance()->getStudentAssiduity($courseId, $userId);				
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }    
    }*/

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

    /*public function getStudentTracking($request){
        try{
            $courseId = intval($request['courseId']);
            $userId = intval($request['userId']);
            $onlyMyGroups = (intval($request['onlyMyGroups']) == 1 ? true : false);

            $this->canUserAccess('s', 0, $userId, $courseId);
            
            $result = new stdClass();
            $result->details = PersistCtrl::getInstance()->getStudentTracking($courseId, $userId, $onlyMyGroups);
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result->details);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    } */

    /*public function getUserProfile($request){
        try{
            $courseId = intval($request['courseId']);
            $userId = intval($request['userId']);

            $this->canUserAccess('s', 0, $userId, $courseId);
            
            $result = PersistCtrl::getInstance()->getUserProfile($userId);
            $this->prepareJson($result);
            
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, false, $ex->GetMessage());
        }     
    }*/ 

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
            $result->details = PersistCtrl::getInstance()->getStudentFollowUp($courseId, $groupId);
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
            $arr = array("Prénom", "Nom");

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

            $filename = sys_get_temp_dir() . '/rapport-resultats-par-section.csv';
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
            $arr = array("Prénom", "Nom");

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

            $filename = sys_get_temp_dir() . '/rapport-achevement-activites.csv';
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
            $arr = array("Prénom", "Nom");
            $arr[] = "Tentatives";
            $arr[] = "État";
            $arr[] = "Commencé le";
            $arr[] = "Terminé";
            $arr[] = "Temps utilisé";
            $arr[] = "Note/". number_format($data->quizMaxGrade, 2);

            foreach($data->questions as $item){ 
                $arr[] = "Q.{$item->slot}/" . round($item->gradeWeight,2);
            }

            $fileContent[] = $arr;
            
            $arr = array("Tags", "", "", "", "", "", "", "");

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

            $filename = sys_get_temp_dir() . '/rapport-test.csv';
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
                    $result->reportName = get_string('recitdiagtagquestion', 'quiz_recitdiagtagquestion');
                }
                else{
                    $result->reportName = get_string('pluginname', 'report_recitdiagtag');
                }

                $writer = new ReportDiagTagCSVWriter($result, 'mod_recitcahiercanada');
                $writer->writeReport();
                //$this->downloadFile(, 'application/csv', 'ISO-8859-1');
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

///////////////////////////////////////////////////////////////////////////////////
$webapi = new WebApi($DB, $COURSE, $USER);
$webapi->getRequest($_REQUEST);
$webapi->processRequest();
$webapi->replyClient();