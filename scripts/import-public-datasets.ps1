$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($env:DATASET_IMPORT_TOKEN)) {
    throw 'Set DATASET_IMPORT_TOKEN in this PowerShell session before importing datasets.'
}

$apiBaseUrl = if ([string]::IsNullOrWhiteSpace($env:API_BASE_URL)) {
    'http://localhost:8080'
} else {
    $env:API_BASE_URL.TrimEnd('/')
}
$apiUri = [uri]$apiBaseUrl
if ($apiUri.Scheme -ne 'https' -and $apiUri.Host -notin @('localhost', '127.0.0.1', '::1')) {
    throw 'Use HTTPS when importing datasets into a remote API.'
}
$workingDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ('biomed-datasets-' + [guid]::NewGuid())
$ecgDirectory = Join-Path $workingDirectory 'mitdb'
$ecgArchive = Join-Path $workingDirectory 'mit-bih-arrhythmia.zip'
$proteinArchive = Join-Path $workingDirectory 'human-reference-proteome.fasta.gz'

function Send-Dataset {
    param(
        [string]$Type,
        [string]$Title,
        [string]$SourceUrl,
        [string]$License,
        [string]$FilePath,
        [string]$ContentType
    )

    & curl.exe --fail --silent --show-error --request POST "$apiBaseUrl/api/datasets" `
        --header "X-Dataset-Import-Token: $env:DATASET_IMPORT_TOKEN" `
        --form "type=$Type" `
        --form "title=$Title" `
        --form "sourceUrl=$SourceUrl" `
        --form "license=$License" `
        --form "file=@$FilePath;type=$ContentType"
    if ($LASTEXITCODE -ne 0) {
        throw "Could not import the $Type dataset through the application API."
    }
}

try {
    New-Item -ItemType Directory -Path $ecgDirectory -Force | Out-Null
    $recordsUrl = 'https://physionet.org/files/mitdb/1.0.0/RECORDS'
    $recordsFile = Join-Path $workingDirectory 'RECORDS'
    Invoke-WebRequest -Uri $recordsUrl -OutFile $recordsFile

    $recordNames = @(Get-Content $recordsFile | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    if ($recordNames.Count -ne 48) {
        throw "Expected 48 MIT-BIH records but received $($recordNames.Count)."
    }

    foreach ($record in $recordNames) {
        foreach ($extension in @('hea', 'dat', 'atr')) {
            $fileName = "$record.$extension"
            Invoke-WebRequest `
                -Uri "https://physionet.org/files/mitdb/1.0.0/$fileName" `
                -OutFile (Join-Path $ecgDirectory $fileName)
        }
        Write-Output "Downloaded MIT-BIH record $record"
    }

    Compress-Archive -Path (Join-Path $ecgDirectory '*') -DestinationPath $ecgArchive -CompressionLevel Fastest
    Send-Dataset `
        -Type 'ECG' `
        -Title 'MIT-BIH Arrhythmia Database (48 records)' `
        -SourceUrl 'https://physionet.org/content/mitdb/1.0.0/' `
        -License 'PhysioNet open-access dataset; follow its current reuse terms and cite the database.' `
        -FilePath $ecgArchive `
        -ContentType 'application/zip'

    $proteinUrl = 'https://rest.uniprot.org/uniprotkb/stream?compressed=true&format=fasta&query=proteome%3AUP000005640'
    Invoke-WebRequest -Uri $proteinUrl -OutFile $proteinArchive
    Send-Dataset `
        -Type 'PROTEIN' `
        -Title 'UniProt human reference proteome (FASTA)' `
        -SourceUrl $proteinUrl `
        -License 'CC BY 4.0; preserve UniProt attribution and comply with its reuse terms.' `
        -FilePath $proteinArchive `
        -ContentType 'application/gzip'
} finally {
    if (Test-Path -LiteralPath $workingDirectory) {
        Remove-Item -LiteralPath $workingDirectory -Recurse -Force
    }
}
