Tasker - Smart Task Management

A simple, client-side to-do list app focused on productivity. Tasks are categorized and can be filtered, backed up, and managed automatically based on their category.

Features

Category Filter: View tasks by category or see all at once.

ALL: Show every task.

EVENTS: Show only Event tasks.

DAILY: Show only Daily tasks.

PERSONAL: Show only Personal tasks.

PROJECT: Show only Project tasks.

Backup & Restore

Export all tasks as a JSON file named tasker-backup-<YYYY-MM-DD>.json.

Import a JSON file to restore tasks from a previous backup.

Daily Task Auto-Cleanup

At midnight (local time), all Daily category tasks are removed automatically.

Upon cleanup, the same Daily tasks are re-generated for the new day.

Option in UI to permanently remove a Daily task before or after cleanup.

Installation

Clone or download the repository.

Serve the index.html and app.js files from a local web server (e.g., http-server, python -m http.server).

Open index.html in your browser.

Usage

Add a Task

Click the + button.

Select a category from the dropdown.

Fill out the form fields that appear for that category.

Click Add Task.

Filter Tasks

Use the filter buttons at the top (All, Events, Daily, Personal, Project) to show only the tasks you need.

Backup Tasks

Click Export to download a JSON backup file named tasker-backup-<date>.json.

Click Import and select a previously saved JSON file to restore tasks.

Daily Auto-Cleanup

Daily tasks are automatically cleared at midnight and re-created for the new day.

To permanently remove a Daily task, click the Done button and choose Remove Forever in the confirmation.

Development

All data is stored in localStorage under the key tasks.

The backup feature serializes this array to JSON for download.

A scheduled check (e.g., using setTimeout/setInterval) triggers the Daily cleanup at midnight.

License

MIT © Alan Leenhotus

