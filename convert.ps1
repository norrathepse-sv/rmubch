$sql = [System.IO.File]::ReadAllText("D:\NextJs\rmubch\csv\riskmain.sql", [System.Text.Encoding]::UTF8)
$sql = $sql -replace '`', '"'
$sql = $sql -replace '(?i)INSERT INTO "riskmain"', 'INSERT INTO "riskmain"'
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("D:\NextJs\rmubch\csv\riskmain_pg.sql", $sql, $utf8NoBom)
Write-Host "Done!"
