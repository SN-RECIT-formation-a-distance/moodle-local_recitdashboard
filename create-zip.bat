echo off
set zipName=local_recitdashboard
set pluginName=recitdashboard

rem remove the current 
del %zipName%

rem zip the folder
"c:\Program Files\7-Zip\7z.exe" a -mx "%zipName%.zip" "src\*" -mx0 -xr!"src\react\.cache" -xr!"src\react\node_modules"

rem set the plugin name
"c:\Program Files\7-Zip\7z.exe" rn "%zipName%.zip" "src\" "%pluginName%\"

pause