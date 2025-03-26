# Script to update button colors from indigo to black
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.jsx"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace background colors
    $content = $content -replace "bg-indigo-600", "bg-black"
    $content = $content -replace "hover:bg-indigo-700", "hover:bg-gray-800"
    
    # Replace focus ring colors
    $content = $content -replace "focus:ring-indigo-500", "focus:ring-gray-500"
    $content = $content -replace "focus:ring-indigo-600", "focus:ring-gray-600"
    
    # Replace text colors for buttons
    $content = $content -replace "text-indigo-600(?!\w)", "text-black"
    $content = $content -replace "hover:text-indigo-500", "hover:text-gray-800"
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Button colors updated successfully!"
