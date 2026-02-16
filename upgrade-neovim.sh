#!/bin/bash
# Upgrade Neovim for LazyVim compatibility

echo "Upgrading Neovim to v0.11.2+..."

# Remove old neovim
sudo apt remove -y neovim 2>/dev/null || true

# Create bin directory
mkdir -p ~/.local/bin

# Download latest appimage
cd /tmp
curl -LO --retry 3 --retry-delay 5 https://github.com/neovim/neovim/releases/download/v0.11.2/nvim-linux-x86_64.appimage
chmod +x nvim-linux-x86_64.appimage

# Extract appimage (more reliable than running directly)
./nvim-linux-x86_64.appimage --appimage-extract 2>/dev/null || true

# Install to local bin
if [ -d squashfs-root ]; then
    rm -rf ~/.local/share/nvim-appimage
    mv squashfs-root ~/.local/share/nvim-appimage
    ln -sf ~/.local/share/nvim-appimage/AppRun ~/.local/bin/nvim
else
    # Fallback: just use the appimage directly
    mv nvim-linux-x86_64.appimage ~/.local/bin/nvim
fi

# Add to PATH
if ! grep -q "\.local/bin" ~/.bashrc; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi

export PATH="$HOME/.local/bin:$PATH"

echo "✅ Neovim upgraded!"
~/.local/bin/nvim --version | head -1
