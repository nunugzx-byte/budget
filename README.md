# £ Budget Tracker

A simple interactive monthly budget tracker designed as a standalone website.

## What it includes

- Projected vs actual monthly income
- Projected vs actual expenses
- Categories based on the supplied personal monthly budget workbook
- Automatic totals, balances and differences
- Monthly data storage in the browser
- Savings goals
- Monthly reflection/review
- CSV export
- Responsive phone/tablet/desktop layout
- GBP (£) formatting throughout

## Put it on GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, and `app.js` to the repository root.
3. Commit the files.
4. Open the repository's **Settings**.
5. Choose **Pages**.
6. Under **Build and deployment**, select **Deploy from a branch**.
7. Choose your main branch and `/ (root)`, then save.
8. GitHub will provide the public website address after deployment.

## Important note about saved data

This first version uses browser `localStorage`. That means the budget data stays on the device/browser where it is entered. It does not create user accounts or sync across devices yet.

## Editing

You can change the title, wording, categories, colours, or default example figures later. The site is plain HTML/CSS/JavaScript, so no build system is required.
