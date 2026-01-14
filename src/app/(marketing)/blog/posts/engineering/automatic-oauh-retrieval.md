---
title: "Automating GitHub OAuth Apps with Playwright"
publishedAt: "2024-12-30"
updatedAt: "2026-01-05"
summary: "Learn how to bypass the missing GitHub OAuth creation API using Playwright, persistent sessions, and robust automation patterns."
tags: ["playwright", "automation", "python", "github", "devops"]
author: "Remco Stoeten"
canonicalUrl: "https://remcostoeten.nl/blog/engineering/automatic-oauth-app-creation"
slug: "automatic-oauth-app-creation"
draft: true
---

For some reason the GitHub REST API does not have, or deprecated the API for creating OAuth apps. Which might be the most hated task next to folding the laundry. 

BLALBBLBL CHANGE
I don't know about you, but I am actively working on 5-7 projects where most of them end up in the graveyard because I just came up with a new million-dollar idea that typically requires authentication. I've left my stubbornness aside and swapped my [own rolled auth](https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication) for BetterAuth. Having full auth in my own database setup under five minutes is nice. But then comes the most annoying part. OAuth.

 I got sick of it, and I don't value my time, and I value yours, hence I made this tool that creates OAuth apps in a split second.


## The Strategy: Playwright + Persistent Auth
Since I've been using GitHub the OAuth portal hasn't changed so a tool like ChromeDriver, Puppeteer or Selenium would do the job, worst case I change out some top level constants which are DOM pointers. Standard automation (Selenium/Puppeteer) is often "headless" and "ephemeral," meaning you'd have to log in and handle 2FA every single time. That defeats the entire purpose, so after some digging I got persistence working.
<small>Which I also implemented in my [instagram follower tracker](https://github.com/remcostoeten/instagram-unfollow-tracker-dashboard) where I might write about.</small>

### 1. Reusing Your Session 
I originally built this to save a local session folder. You'd log in once, and it would save the cookies.

**But then I realized:** Why log in at all?

I updated the tool to attach directly to your **existing Brave or Chrome profile**.
```python title="github_oauth_automator.py"
# From github_oauth_automator.py
context = playwright.chromium.launch_persistent_context(
    user_data_dir="${HOME}/.config/BraveSoftware/Brave-Browser/Default", # <-- Your actual browser!
    executable_path="/usr/bin/brave-browser",
    headless=False
)
```
This means if you're logged into GitHub in your daily browser, the script is **instantly authenticated**. No login screens, no 2FA fatigue. It just works.

*(Note: You do have to close your browser first, as Playwright needs exclusive file locks. That's why I use Chrome as Brave is my default browser)*

### 2. Handling "Sudo Mode"
GitHub wants you to verify your password here and there. The script simply waits until it finds the "Confirm password" prompt. 

It then **automatically fills your password** (if you put it in `.env`) or **pauses** for you to type it manually in the open browser window.

```python title="handle-sudo-mode.py"
if page.query_selector("text='Confirm password'"):
    if user_password:
        # Option A: Auto-fill if configured
        page.fill("input[name='password']", user_password)
        page.click("button:has-text('Confirm')")
    else:
        # Option B: Wait for you to type it manually
        print("Please enter your password in the browser...")
        page.wait_for_selector("input[name='password']", state="detached")
```
After that the oauth app is created and the client is generated. Last thing to do is capture the secret as that sits behind a button that is hidden by default. Same principle as before, we wait for the button to appear and click it.

```python title="generate-secret.py"
if page.query_selector("text='Generate secret'"):
    page.click("button:has-text('Generate secret')")
```

Now the client and secret are exposed in the DOM and we can capture them like this:

```python title="capture-credentials.py"
client_id = page.query_selector("text='Client ID'").text_content()
client_secret = page.query_selector("text='Client Secret'").text_content()
```

And finally we write the captured client and secret via FS to the `.env` file.

Furthermore I've added couple of features to the tool for bulk (prod and dev) creation, and easy deletion or re-generation of existing apps. I'm a JavaScript andy and have only done a little Django and built some scrapers. But this works. Could've also built it in Node now that I think of it.

```bash title="run-script.sh"
❯ time ./run.sh
[INFO] Launching GitHub OAuth Automator...

╔═════════════════════════════════════════════════╗
║                                                 ║
║   🔐      GitHub OAuth App Creator              ║
║       Automated OAuth application setup         ║
║                                                 ║
╚═════════════════════════════════════════════════╝


┌─────────────────────────────────────┐
│  What would you like to do?         │
├─────────────────────────────────────┤
│  1. Create new OAuth app            │
│  2. Verify existing credentials     │
│  3. View saved credentials          │
│  4. Delete OAuth app from GitHub    │
│  5. Clear browser session           │
│  6. Exit                            │
└─────────────────────────────────────┘

➤ Enter choice (1-6): 1

📝 Create New OAuth Application
────────────────────────────────────────

➤ Application name [poop]: 
➤ Homepage URL [http://localhost:3000]: 
➤ Callback URL [http://localhost:3000/api/auth/callback/github]: 
➤ GitHub password (for sudo mode): (loaded from .env)
➤ Save to .env file? [Y/n]: 
➤ Verify credentials after creation? [Y/n]: 

────────────────────────────────────────
📋 Configuration Summary:
   • App Name:     poop
   • Homepage:     http://localhost:3000
   • Callback:     http://localhost:3000/api/auth/callback/github
   • Password:     ••••••••
   • Write .env:   Yes
   • Verify:       Yes
────────────────────────────────────────

➤ Proceed with these settings? [Y/n]: 
20:44:43 | Using custom browser profile: /home/remcostoeten/.config/google-chrome/Default

20:44:43 | Using configured browser: /usr/bin/google-chrome
20:44:43 | Launching browser with profile: /home/remcostoeten/.config/google-chrome/Default

20:44:44 | ✅ Already logged in (session restored)
20:44:44 | 📝 Navigate to create app: poop
20:44:46 |    Filling form details...
20:44:46 |    Submitting form...
20:44:47 |    Extracting Client ID...
20:44:47 |    ✅ Client ID: 0000000000000000000000
20:44:47 |    Generating Client Secret...
20:44:48 |    Clicked via selector: input[type="submit"][value*="client secret" i]
20:44:50 |    ✅ Client Secret captured successfully!

────────────────────────────────────────────────────────────
 SUCCESS: Application Created Successfully
────────────────────────────────────────────────────────────

GITHUB_CLIENT_ID="0000000000000000000000"
GITHUB_CLIENT_SECRET="0000000000000000000000"

20:44:50 | ✅ Saved to .env file
20:44:50 | 🔍 Verifying OAuth credentials...
20:44:50 |    ✅ Client ID is recognized by GitHub
20:44:50 |    ✅ Client secret format is valid
20:44:50 |    ✅ Credentials verified successfully!
20:44:50 | 🎉 All checks passed!

┌─────────────────────────────────────┐
│  What would you like to do?         │
├─────────────────────────────────────┤
│  1. Create new OAuth app            │
│  2. Verify existing credentials     │
│  3. View saved credentials          │
│  4. Delete OAuth app from GitHub    │
│  5. Clear browser session           │
│  6. Exit                            │
└─────────────────────────────────────┘

➤ Enter choice (1-6): 6

👋 Goodbye!
________________________________________________________
Executed in   11.70 secs    fish           external
   usr time    1.61 secs  220.00 micros    1.61 secs
   sys time    0.41 secs   82.00 micros    0.41 secs
```
Little over 10 seconds, not bad.

**Project Link**: [View the full script in the repository](https://github.com/remcostoeten/automatic-oauth-github-creator)
