$fixes = @(
    @{ file = 'src/app/(pos)/purchase/list/page.tsx'; find = 'statusColors[detailData.status] || "default"'; replace = 'statusColors[detailData.status] as any || "default"' },
    @{ file = 'src/app/(pos)/sale/returns/page.tsx'; find = 'statusColors\[v as string\] \|\| "default"'; replace = 'statusColors[v as string] as any || "default"' },
    @{ file = 'src/app/(pos)/sale/returns/page.tsx'; find = 'statusColors\[detailData\.status\] \|\| "default"'; replace = 'statusColors[detailData.status] as any || "default"' }
)
foreach ($f in $fixes) {
    $c = Get-Content $f.file -Raw
    $c = $c -replace [regex]::Escape($f.find), $f.replace
    Set-Content $f.file $c
}

# Fix stock-in page - remove leftIcon Search and fix creator property
$si = Get-Content 'src/app/(pos)/inventory/stock-in/page.tsx' -Raw
$si = $si -replace 'leftIcon=\{Search\}', ''
$si = $si -replace '\(row as any\)\.creator', '(row as any).creatorName || (row as any).createdBy || "-"'
Set-Content 'src/app/(pos)/inventory/stock-in/page.tsx' $si

# Fix master/items page render - wrap with type cast
$mi = Get-Content 'src/app/(pos)/master/items/page.tsx' -Raw
$mi = $mi -replace 'render: \(v: unknown, row: any\) => \n\s+\(row\.productStocks\?.\[0\]', 'render: (v: unknown, row: any): any => (row.productStocks'
$mi = $mi -replace '\(row\.productStocks\?.\[0\]', '(row.productStocks'
$mi = $mi -replace 'render: \(v: unknown, row: any\): Element => \n\s+\(row\.productStocks\?.\[0\]', 'render: (v: unknown, row: any): Element => (row.productStocks'
Set-Content 'src/app/(pos)/master/items/page.tsx' $mi

# Fix sale/list page
$sl = Get-Content 'src/app/(pos)/sale/list/page.tsx' -Raw
$sl = $sl -replace 'render: \(v: unknown, row: any\): Element => \n\s+\(row\.customer', 'render: (v: unknown, row: any): Element => (row.customer'
Set-Content 'src/app/(pos)/sale/list/page.tsx' $sl

Write-Output "Done"
