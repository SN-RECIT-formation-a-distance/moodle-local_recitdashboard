$from = "moodle-local_recitdashboard/src/*"
$to = "shared/recitfad4/public/local/recitdashboard"
$source = "./src";

try {
    . ("..\sync\watcher.ps1")
}
catch {
    Write-Host "Error while loading sync.ps1 script." 
}