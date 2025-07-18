#!/bin/bash

# Create README.md if it doesn't exist
if [ ! -f "README.md" ]; then
    echo "# $(basename $(pwd))

## Description

Brief description of your project.

## Installation

\`\`\`bash
npm install # or your installation command
\`\`\`

## Usage

Add usage instructions here.

## License

MIT
" > README.md
fi

# Create LICENSE file if it doesn't exist
if [ ! -f "LICENSE" ]; then
    gh api /licenses/mit -q .body > LICENSE
fi

# Apply repository settings
gh repo-config apply

echo "Repository setup complete!"
echo "Don't forget to:"
echo "1. Update the README.md with your project details"
echo "2. Commit and push the changes"
