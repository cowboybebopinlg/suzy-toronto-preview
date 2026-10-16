# PowerShell script to fetch products from Suzy Toronto site
$url = "https://suzytoronto.com/wp-json/wc/store/v1/products?per_page=100"
$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "Found $($response.Count) products via Store API"
    $response | ForEach-Object {
        Write-Host "ID: $($_.id) | Title: $($_.name) | Price: $($_.prices.price / 100) | Categories: $(($_.categories | Select-Object -ExpandProperty name) -join ', ')"
    }
    $response | ConvertTo-Json -Depth 5 | Out-File -FilePath "store_products.json" -Encoding utf8
} catch {
    Write-Host "Store API Error: $_"
}
