#!/bin/bash

# Get the current directory
current_dir=$(pwd)

if [ -f "$current_dir/src/sme.json" ]; then
	cp "$current_dir/src/sme.json" "$current_dir/dist"
	echo "src/sme.json copied to dist"
else
	cp "$current_dir/.config/sme.json" "$current_dir/dist"
	echo ".config/sme.json copied to dist"
fi
