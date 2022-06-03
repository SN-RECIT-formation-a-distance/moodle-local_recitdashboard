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

 /**
 * A class created to gather useful functions
 *
 * @copyright  2019 RECIT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace recitdashboard;

class Utils
{
    public static function divide($n1, $n2){
        return ($n2 > 0 ? $n1/$n2 : 0);
    }

    public static function getUserRoles($courseId, $userId){
        // get the course context (there are system context, module context, etc.)
        $context = \context_course::instance($courseId);

        return Utils::getUserRolesOnContext($context, $userId);
    }

    public static function getUserRolesOnContext($context, $userId){
        $userRoles1 = get_user_roles($context, $userId);

        $userRoles2 = array();
        foreach($userRoles1 as $item){
            $userRoles2[] = $item->shortname;
        }

        $ret = self::moodleRoles2RecitRoles($userRoles2);

        if(is_siteadmin($userId)){
            $ret[] = 'ad';
        }
        
        return $ret;
    }
    
    public static function moodleRoles2RecitRoles($userRoles){
        $ret = array();

        foreach($userRoles as $name){
            switch($name){
                case 'manager': $ret[] = 'mg'; break;
                case 'coursecreator': $ret[] = 'cc'; break;
                case 'editingteacher': $ret[] = 'et'; break;
                case 'teacher': $ret[] = 'tc'; break;
                case 'student': $ret[] = 'sd'; break;
                case 'guest': $ret[] = 'gu'; break;
                case 'frontpage': $ret[] = 'fp'; break;
            }
        }

        return $ret;
    }
    
    public static function isAdminRole($roles){
        $adminRoles = array('ad', 'mg', 'cc', 'et', 'tc');

        if(empty($roles)){ return false;}

        foreach($roles as $role){
            if(in_array($role, $adminRoles)){
                return true;
            }
        }
        return false;
    }
}
