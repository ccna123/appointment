#!/bin/sh
# Path to the index.html file
INDEX_HTML="/usr/share/nginx/html/index.html"

# Check if the file exists
if [ ! -f "$INDEX_HTML" ]; then
    echo "Error: $INDEX_HTML not found!"
    exit 1
fi

# Inject environment variables into index.html
for i in $(env | grep REACT_APP_); do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2- | sed -e 's/[\/&]/\\&/g' -e 's/"/\\"/g')

    echo "Replacing: $key -> $value"

    # Replace placeholders in index.html
    sed -i "s|__${key}__|${value}|g" "$INDEX_HTML"
done

echo 'Environment variables injected successfully!'
