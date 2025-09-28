1. Branch Strategy

You should use a branching strategy to keep your code organized:

main (or master) → Production-ready code only
├── develop → Integration branch for features
├── feature/email-confirmation → Feature branches
├── fix/redirect-issue → Bug fix branches
└── test/user-acceptance → Testing branches

2. For Your Current Testing Phase

Option A: Feature Branch Workflow (Recommended)

# Create a testing branch

git checkout -b test/email-confirmation-flow

# Make your changes and test

git add .
git commit -m "test: email confirmation redirect flow"
git push origin test/email-confirmation-flow

# Vercel will auto-deploy this branch to a preview URL

# Test thoroughly on the preview URL

# Once confirmed working, merge to main

git checkout main
git merge test/email-confirmation-flow
git push origin main

3. Vercel Preview Deployments

Vercel automatically creates preview deployments for every branch:

- main branch → Production URL (ai-jobs-australia-v1.vercel.app)
- Other branches → Preview URLs (ai-jobs-australia-v1-[branch-hash].vercel.app)

4. Best Practices for Testing Phase

DO:

- Create feature/test branches for experimental changes
- Use descriptive branch names (test/jobseeker-profile-redirect)
- Test on preview URLs before merging to main
- Keep main branch stable and working
- Use pull requests for code review

DON'T:

- Push experimental changes directly to main
- Test in production
- Mix multiple features in one branch

5.  Typical Testing Workflow

# 1. Start a new test feature

git checkout -b test/new-feature

# 2. Make changes and commit frequently

git add .
git commit -m "test: trying new approach for X"

# 3. Push to GitHub (triggers Vercel preview)

git push origin test/new-feature

# 4. Test on preview URL

# If it works → Create PR and merge

# If it doesn't → Fix or abandon branch

# 5. Clean up after merging

git checkout main
git pull origin main
git branch -d test/new-feature

6. Environment Variables

For different environments:

- Local: .env.local (not committed)
- Preview: Set in Vercel dashboard for preview deployments
- Production: Set in Vercel dashboard for production

7. Your Current Situation

Since you've been testing email confirmation:

# Create a branch for the current work

git checkout -b feature/email-confirmation-redirect

# Commit the working solution

git add .
git commit -m "feat: add email confirmation redirect to profile page"

# Push to GitHub

git push origin feature/email-confirmation-redirect

# Create a Pull Request on GitHub

# Review the changes

# Merge to main when ready
