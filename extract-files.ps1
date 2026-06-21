$inputFile = "All_Project_Files.txt"

$content = Get-Content $inputFile -Raw

$parts = $content -split "(?=FILE:\s+)"

foreach ($part in $parts) {

    if ($part -match "^FILE:\s+([^\r\n]+)") {

        $filePath = $matches[1].Trim()

        $body = $part -replace "^FILE:\s+[^\r\n]+\r?\n", ""

        $directory = Split-Path $filePath -Parent

        if ($directory -and !(Test-Path $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }

        Set-Content -Path $filePath -Value $body
    }
}

Write-Host "Done! Files created."