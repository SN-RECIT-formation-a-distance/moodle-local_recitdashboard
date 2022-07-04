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
 * This file defines the quiz Diagnostic Tag Question report class.
 *
 * @copyright  2019 RÉCIT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace recitdashboard;

require_once __DIR__ . '/PersistCtrl.php';

use stdClass;
use Exception;

class ReportDiagTagContent
{
    public $courseName = "";
    //public $module = "";
    public $reportName = "";
    public $students = array();
    public $groups = array();
    public $groupList = array();
	public $tagList = array();
    public $htmlCellContext = null;

    protected $rawData = array();
    protected $DB;

    public function __construct($DB){
        $this->DB = $DB;
        $this->htmlCellContext = new HtmlCellContext();
    }

    public function loadContent($courseId, $cmId = 0, $userId = 0, array $options = null, $groupId = 0, $sectionId = 0){
        if(empty($options)){
            $options = array('quiz', 'question', 'assignment', 'lesson');
        }

        $this->loadDataFromDB($courseId, $cmId, $userId, $options, $groupId, $sectionId);
        $this->loadTagList();
        $this->loadStudentsResult();
        $this->loadGroupList();
        $this->loadGroupsResult();
    }

    protected function loadDataFromDB($courseId, $cmId = 0, $userId = 0, array $options = null, $groupId = 0, $sectionId = 0){
        $tmp = array();
        $this->rawData = array();

        if(in_array('quiz', $options)){
            $tmp = DiagTagPersistCtrl::getInstance($this->DB)->getReportDiagTagQuiz($courseId, $userId, $groupId);
        }

        if(in_array('question', $options)){
            $tmp = array_merge($tmp, DiagTagPersistCtrl::getInstance($this->DB)->getReportDiagTagQuestion($cmId, $userId, 0, $courseId, $groupId, $sectionId));
        }

        if(in_array('assignment', $options)){
            $tmp = array_merge($tmp, DiagTagPersistCtrl::getInstance($this->DB)->getReportDiagTagAssignment($courseId, $userId, $groupId));
        }

        if(in_array('lesson', $options)){
            $tmp = array_merge($tmp, DiagTagPersistCtrl::getInstance($this->DB)->getReportDiagTagLesson($courseId, $userId, $groupId));
        }

        foreach($tmp as $item){
            $item->groupName = explode(",", $item->groupName);
            $obj = new ReportDiagTagRawItem();
            $obj->copyFrom($item);
            $this->rawData[] = $obj;
        }
    }

    protected function loadTagList(){
        $this->tagList = array();

        foreach($this->rawData as $rawItem){
			$this->tagList[$rawItem->tagName] = $rawItem->tagName;
        }
		
		$this->tagList = array_values($this->tagList);
    }

    protected function loadStudentsResult(){
        $this->students = array();
        foreach($this->rawData as $rawItem){
            if(!isset($this->students[$rawItem->userId])){
                $this->students[$rawItem->userId] = new ReportDiagTagStudentItem($rawItem);
            }
            else{
                $this->students[$rawItem->userId]->addTag($rawItem);
            }
        }

        /*foreach($this->students as $data){
            $data->normalizeTagList($this->tagList);
        }*/

        foreach($this->students as $data){
            $data->setTagSuccessRate();
        }

        // reset the array keys (this is important when creating a json array)
        $this->students = array_values($this->students); 

        usort($this->students, array($this, "sortStudents"));
    }

    public function getData(){
        $data = new stdClass();
        
        $data->reportName = $this->reportName;
        $data->students = $this->students;
        $data->groups = $this->groups;
        $data->groupList = $this->groupList;
        $data->tagList = $this->tagList;
        $data->htmlCellContext = $this->htmlCellContext;
        return $data;
    }

    protected function sortStudents($a, $b){
        $str1 = $a->firstName . " " . $a->lastName;
        $str2 = $b->firstName . " " . $b->lastName;
        return strcmp($str1, $str2);
    }

    protected function loadGroupsResult(){
        $this->groups = array();
        
        foreach($this->groupList as $groupName){
            foreach($this->rawData as $rawItem){
                if(!in_array($groupName, $rawItem->groupName)){ continue;}
                
                if(!isset($this->groups[$groupName])){
                    $this->groups[$groupName] = new ReportDiagTagGroupItem($rawItem, $groupName);
                }
                else{
                    $this->groups[$groupName]->addTag($rawItem);
                }
            }
        }
        
       /* foreach($this->groups as $data){
            $data->normalizeTagList($this->tagList);
        }*/

        foreach($this->groups as $data){
            $data->setTagSuccessRate();
        }

        // reset the array keys (this is important when creating a json array)
        $this->groups = array_values($this->groups); 
    }

    protected function loadGroupList(){
        $this->groupList = array();

        foreach($this->rawData as $rawItem){
            foreach($rawItem->groupName as $group){
                if(!in_array($group, $this->groupList)){
                    $this->groupList[] = $group;
                }
            }
        }

        sort($this->groupList);
    }
}

class ReportDiagTagRawItem
{
    public $tagId = 0;
    public $tagName = "";
    public $itemType = "";
    public $itemId = 0;
    public $cmId = 0;
    public $activityId = 0;
    public $activityName  = "";
    public $timeStart = 0;
    public $timeEnd = 0;
    public $userId = 0;
    public $firstName = "";
    public $lastName = "";
    public $groupName = array();
    public $email = "";
    public $grade = 0;
    public $gradeWeight = 1;

    public function copyFrom($fromObj){
        $properties = get_object_vars($fromObj);
        foreach($properties as $prop => $value){
            if(property_exists("recitdashboard\ReportDiagTagRawItem", $prop)){
                $this->$prop = $value;
            }
        }
    }
}

abstract class ReportDiagTagItem
{
    
    public $tags = array();

    protected $tagRawList = array();

    public function addTag(ReportDiagTagRawItem $rawItem){
        $item = new stdClass();
        $item->tagId = $rawItem->tagId;
        $item->tagName = $rawItem->tagName;
        $item->grade = $rawItem->grade;
        $item->gradeWeight = $rawItem->gradeWeight;
        $this->tagRawList[$rawItem->tagId][] = $item;
    }

   /* public function normalizeTagList(array $tagList){
        foreach($tagList as $item1){
            $added = false;
            foreach($this->tagRawList as $tagId => $items){
                // the tag already exists then keep going
                if($item1->tagId == $tagId){ 
                    $added = true;
                    continue;
                }
            }

            if(!$added){
                $this->addTag($item1);
            }
        }
    }*/

    public function setTagSuccessRate(){
        foreach($this->tagRawList as $tagList){
            $item = new stdClass();
            $item->tagId = current($tagList)->tagId;
            $item->tagName = current($tagList)->tagName;
            $item->value = self::getTagSuccessRate($tagList);
            $this->tags[] = $item;
        }

        usort($this->tags, array($this, "sortTags"));
    }

    protected function sortTags($a, $b){
        return strcmp($a->tagName, $b->tagName);
    }

    
    static public function getTagSuccessRate($tagList){
        $result = 0;
        $divisor = 0;

        foreach($tagList as $tag){
            $result += $tag->grade * $tag->gradeWeight;
            $divisor += 1 * $tag->gradeWeight;
        }

        return ($divisor > 0 ? $result / $divisor : 0) * 100;
    }
}

class ReportDiagTagStudentItem extends ReportDiagTagItem
{
    public $firstName = "";
    public $lastName = "";
    public $email = "";
    public $groupName = array();

    public function __construct(ReportDiagTagRawItem $rawItem){
        $this->firstName = $rawItem->firstName;
        $this->lastName = $rawItem->lastName;
        $this->groupName = $rawItem->groupName;
        $this->email = $rawItem->email;
        $this->addTag($rawItem);
    }
}

class ReportDiagTagGroupItem extends ReportDiagTagItem
{
    public $groupName = "";

    public function __construct(ReportDiagTagRawItem $rawItem, $groupName){
        $this->groupName = $groupName;
        $this->addTag($rawItem);
    }
}

class ReportDiagTagWriter
{
    protected $content;
    protected $pluginName;

    public function __construct(ReportDiagTagContent $content, $pluginName) {
        $this->content = $content;
        $this->pluginName = $pluginName;
    }

    public function hasData(){
        return (empty($this->content->students) ? false : true);            
    }
}

class ReportDiagTagHtmlWriter extends ReportDiagTagWriter
{
    protected $cellContext = null;

    public function __construct(ReportDiagTagContent $content, $pluginName){
        parent::__construct($content, $pluginName);

        $this->cellContext = new HtmlCellContext();
    }

    public function setCellContext($obj){
        $this->cellContext = $obj;
    }

    public function getContentAsTile($showName = true){
        $result = "<div>";

        foreach($this->content->students as $student){
            $result .= "<div style='display:flex; flex-wrap: wrap; padding: 5px;'>";
            if($showName){
                $result .= "<span style='display: block; width: 100%; font-weight: 500; font-size: 18px; background-color: #f9f9f9; padding: 8px; border-radius: 4px; margin-bottom: 5px;'>";
                $result .= "$student->firstName $student->lastName ($student->email)";
                $result .= "</span>";
            }
            
            foreach($student->tags as $tag){ 
                $result .= "<div data-context='".$this->getCellContext($tag->value)."' style='padding: 10px; margin: 10px; border: 1px solid #efefef; border-radius: 4px; text-align: center; flex-grow: 1;'>";
                $result .= "<span style='display: block; font-weight: 500; font-size: 15px;'>$tag->tagName</span>";   
                $result .= "<span>".number_format($tag->value, 1)."%</span>";   
                $result .= "</div>";   
            }
            $result .= "</div><br/>";
        }
        
        
        $result .= "</div>";

        return $result;
    }

    protected function getCellContext($grade){
        if($grade >= $this->cellContext->minSuccess && $grade <= $this->cellContext->maxSuccess){
            return 'success';
        }
        else if($grade >= $this->cellContext->minWarning && $grade < $this->cellContext->maxWarning){
            return 'warning';
        }
        else if($grade >= $this->cellContext->minDanger && $grade < $this->cellContext->maxDanger){
            return 'danger';
        }
        else{
            return "";
        }
    }
}

class HtmlCellContext
{
    public $minSuccess = 80;
    public $maxSuccess = 100;
    public $minWarning = 60;
    public $maxWarning = 80;
    public $minDanger = 0;
    public $maxDanger = 60;
}

/**
 * CSV file writer. It receives the data and generates the CSV file.
 *
 * @copyright  2019 RECIT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class ReportDiagTagCSVWriter extends ReportDiagTagWriter
{
    private $filename;
       
    public function __construct(ReportDiagTagContent $content, $pluginName) {
        parent::__construct($content, $pluginName);
        
        $this->filename = sys_get_temp_dir() . '/'. $this->content->reportName . '.csv';
    }
    
    public function writeReport()
    {
        if($this->hasData()){
            $this->writeCSV();
        }
    }

    public function getFilename(){
        return $this->filename;
    }
    
    protected function writeCSV()
    {
        try{
            $delimiter = ";";

            $fileContent = array();
            $fileContent[] = array(get_string('course', $this->pluginName), $this->content->courseName);
            //$fileContent[] = array(get_string('module', $this->pluginName), $this->content->cmName);
            $fileContent[] = array(get_string('report', $this->pluginName), $this->content->reportName);
            $fileContent[] = array();

            // header
            $arr = array(get_string("firstname"), get_string("lastname"), get_string("email"));

            $student = current($this->content->students);
            foreach($student->tags as $tag){ 
                $arr[] = $tag->tagName;
            }

            $fileContent[] = $arr;

            foreach($this->content->students as $student){
                $arr = array($student->firstName, $student->lastName, $student->email);

                foreach($student->tags as $tag){ 
                    $arr[] = number_format($tag->value, 1, ",", "");
                }
                $fileContent[] = $arr;
            }

            $fileContent[] = array();

            foreach($this->content->groups as $group){
                $fileContent[] = array($group->groupName);

                $arr1 = array();
                $arr2 = array();
                foreach($group->tags as $tag){ 
                    $arr1[] = $tag->tagName;
                    $arr2[] = number_format($tag->value, 1, ",", "");
                }
                $fileContent[] = $arr1;
                $fileContent[] = $arr2;
            }

            $fp = fopen($this->filename, 'w');
            if(!$fp){ throw new Exception("FAILED: It was not possible to create the temporary file.");}

            foreach($fileContent as $row){
                $nbCols = count($row);
                for($iCol = 0; $iCol < $nbCols; $iCol++){
                    $row[$iCol] = utf8_decode($row[$iCol]);
                }
                fputcsv($fp, $row, $delimiter);
            }
            
            fclose($fp);
        }
        catch (Exception $e){
            die($e->getMessage());
        }
    }
}