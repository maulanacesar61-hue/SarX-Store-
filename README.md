
SAR Store — Safe for GitHub
==========================

This package contains a simple static store and admin panel designed to be safe for publishing on GitHub.

How it keeps secrets off-repo:
- Admin credentials are NOT stored in the repository.
- Admin account is set by the admin in the browser UI and saved locally (localStorage) as a SHA-256 hash.
- All order data in this demo is stored in localStorage.

Files:
- index.html — store front
- admin.html — admin panel (setup + login + order management)
- styles.css — minimal styles
- store.js — product catalog and pricing rules (pulsa/game/robux fees)
- order-check.js — auto-detect order code input behavior
- admin.js — secure local admin setup and login logic

Default admin username: Sar (you will set password at first run)
