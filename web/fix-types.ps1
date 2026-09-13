$files = @(
    'src/app/(pos)/accounting/cash-in/page.tsx',
    'src/app/(pos)/accounting/cash-out/page.tsx',
    'src/app/(pos)/accounting/journals/page.tsx',
    'src/app/(pos)/master/brands/page.tsx',
    'src/app/(pos)/master/categories/page.tsx',
    'src/app/(pos)/master/customers/page.tsx',
    'src/app/(pos)/master/items/page.tsx',
    'src/app/(pos)/master/sale-points/page.tsx',
    'src/app/(pos)/master/sales-persons/page.tsx',
    'src/app/(pos)/master/suppliers/page.tsx',
    'src/app/(pos)/master/units/page.tsx',
    'src/app/(pos)/master/warehouses/page.tsx',
    'src/app/(pos)/inventory/stock-out/page.tsx',
    'src/app/(pos)/settings/roles/page.tsx',
    'src/app/(pos)/settings/users/page.tsx'
)
foreach ($f in $files) {
    $c = Get-Content $f -Raw
    # Fix api.delete(`endpoint/${id}`) -> api.delete(`endpoint`, id)
    $c = $c -replace 'api\.delete\(`([^`]+)/\$\{([^}]+)\}`\)', 'api.delete(`$1`, $2)'
    # Also fix api.delete(`endpoint/${id}`) without template literal vars
    $c = $c -replace 'api\.delete\(`([^`]+)/([^`]+)`\)', 'api.delete(`$1`, `$2`)'
    Set-Content $f $c
}

# Fix api.put for company page
$companyFile = 'src/app/(pos)/settings/company/page.tsx'
$cc = Get-Content $companyFile -Raw
$cc = $cc -replace 'api\.put\("company", form\)', 'api.put("company", "", form)'
Set-Content $companyFile $cc

Write-Output "Done"
