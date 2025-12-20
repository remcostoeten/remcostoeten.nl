# Vim-Style Authentication & Status Bar

This project includes a Vim-inspired command interface for authentication and a status bar that appears when you press semicolon (`;`).

## Features

### 1. Vim Status Bar
- **Trigger**: Press `;` (semicolon) anywhere on the page
- **Close**: Press `ESC` or backspace when input is empty
- **Commands**:
  - `:signin` - Opens OAuth modal for GitHub authentication
  - `:signout` - Signs out the current user

### 2. OAuth Modal
- Opens a **modal dialog** before redirecting to OAuth provider
- Clean, modern UI with loading states
- Error handling and user feedback
- Redirects to GitHub/Google for authentication, then back to your site

### 3. Authentication Indicator
- Small green dot in the bottom-right corner when authenticated
- Pulsing glow effect
- Hover to see username

## Usage

### Sign In
1. Press `;` to open the status bar
2. Type `:signin` and press `Enter`
3. A modal will appear
4. Click "Continue with GitHub"
5. Complete authentication in the popup window
6. The page will refresh with your session

### Sign Out
1. Press `;` to open the status bar
2. Type `:signout` and press `Enter`
3. You'll be signed out immediately

## Components

### `VimStatusBar`
Located at: `src/components/vim-status-bar.tsx`

A bottom-aligned status bar that shows:
- Command input with cursor
- Current authentication status
- Available commands

### `OAuthModal`
Located at: `src/components/auth/oauth-modal.tsx`

A modal dialog that:
- Uses better-auth's `signIn.social()` with `newWindow: true`
- Displays provider icon and branding
- Shows loading states during authentication
- Handles errors gracefully

### `VimAuthProvider`
Located at: `src/components/auth/vim-auth-provider.tsx`

The main provider that:
- Wraps your app to enable Vim commands
- Manages authentication state
- Shows the status bar and modal
- Displays the authentication indicator

## Technical Details

### Better-Auth Configuration
The authentication uses [better-auth](https://better-auth.com) with:
- GitHub OAuth provider
- Popup-based authentication (`newWindow: true`)
- Custom callback URL: `/auth/callback`

### Keyboard Handling
- Global keyboard listener (ignores input fields)
- 2-second timeout for command buffer
- Escape key clears the buffer
- Enter key executes commands

## Customization

### Adding More Commands
Edit `src/components/vim-status-bar.tsx` and add new command handlers in the `handleCommand` function.

### Changing Providers
Edit `src/components/auth/vim-auth-provider.tsx` to change from GitHub to Google or add multiple providers.

### Styling
All components use Tailwind CSS. Modify the `className` props to customize the appearance.

## Security

- Only the user `remcostoeten` is allowed to authenticate
- Unauthorized users are automatically signed out
- OAuth uses secure popup windows
- Callback URLs are validated
