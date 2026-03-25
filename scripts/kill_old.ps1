$pids = @(56992, 38432, 57700, 57720, 57804, 58100, 34060, 18208, 57744, 49784)
foreach ($id in $pids) {
    $p = Get-Process -Id $id -ErrorAction SilentlyContinue
    if ($p) {
        Stop-Process -Id $id -Force
        Write-Host "Killed $id ($($p.Name))"
    } else {
        Write-Host "$id not found"
    }
}
