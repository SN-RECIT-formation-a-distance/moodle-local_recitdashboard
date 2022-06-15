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

defined('MOODLE_INTERNAL') || die();

/**
 * Upgrade script for dashboard
 *
 * @param int $oldversion the version we are upgrading from
 * @return bool result
 */
function xmldb_local_recitdashboard_upgrade($oldversion) {
    global $DB;
    $dbman = $DB->get_manager();

    $newversion = 2022020901;
    if($oldversion < $newversion){
        $table = new xmldb_table('recitdashboard_options');

        if (!$dbman->table_exists($table)) {
            $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
            $table->add_key('primary', XMLDB_KEY_PRIMARY, array('id'));
            $dbman->create_table($table);
        }

        $fields = array(
            new xmldb_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, 0),
            new xmldb_field('name', XMLDB_TYPE_CHAR, '40', null, XMLDB_NOTNULL, null, null),
            new xmldb_field('value', XMLDB_TYPE_TEXT, null, null, XMLDB_NOTNULL, null, null),
        );

        // Conditionally launch add field jsoncontent.
        foreach ($fields as $field){
            if (!$dbman->field_exists($table, $field)) {
                $dbman->add_field($table, $field);
            }
        }

        $table->add_key('unique_option', XMLDB_KEY_UNIQUE, array('userid', 'name'));

        upgrade_plugin_savepoint(true,  $newversion, 'local', 'recitdashboard');
    }


    return true;
}
