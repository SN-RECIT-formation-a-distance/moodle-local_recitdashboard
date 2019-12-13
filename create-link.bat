echo off
set pluginPath=..\moodle\local\recitdashboard

rem remove the current link
..\outils\junction -d src

rem set the link
..\outils\junction src %pluginPath%

pause