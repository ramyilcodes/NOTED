# Guide
## Git workfllow
- main branch (stable, reviewed code)
- development branch (where all the work is done and reviewed before pushing to main).
1. Switch to development branch and pull from remote development branch to be sure your local codebase is up-to-date
    ```
    git switch development
    git pull origin development
    ```
2. For each feature, branch out from the development branch
    `git checkout -b feature/hero-section`
3. Add and commit changes
    ```
    git add index.html
    git commit -m "feat: add hero section"
    ```
    - feat (feature eg. hero sectio),
    - docs (changes to documentation),
    - chore (cleanups),
    - fix (major fixes),
    - hotfix (small/minor fixes).
4. Push changes to remote development branch
    `git push orign development`
5. Create a PR and request a review from collaborator.
    - ensure to change choose "development" as base branch for the PR.
5. Switch back to development branch and pull changes from remote to local to main
    ```
    git switch development
    git pull origin development
    ```
6. branch out again for new feature.

---

## TODOs
<!-- x marks completed items -->
- [x] Add case study summary to README.md
- [x] Add both partners' names to README.md
- [] Add links to Case Study and Design documents
### Case Study Document
- [x] Catchy Title
- [x] Problem statement
- [x] Target Audience
- [x] Core features
### Design Documentation
- [] Color Palette (romantic/affectionate hexcodes)
- [] Typography
- [] Layout Design (brief sketch of the UI)
- [] References (Links to inspiration)
### HTML Implementation (must haves)
- [] Navigation
- [] Hero Section (with a big "hook" for the project)
- [] About/Features: 3 distinct sections explaining the service
- [] CTa: Button or form
### Deployment
- [] Connect repo to vercel
- [] Ensure every push to main triggers a redeploy
- [] Add live link to the top of README.md