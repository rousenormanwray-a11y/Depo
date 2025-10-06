# 🌿 Git Feature Branch Workflow Guide

**Your Professional Development Workflow**  
**Last Updated:** October 6, 2025

---

## 🎯 **THE WORKFLOW (4 SIMPLE STEPS)**

### **Step 1: Start New Feature**
```bash
# Always start from latest main
git checkout main
git pull origin main

# Create feature branch (descriptive name!)
git checkout -b cursor/feature-name

# Examples:
# git checkout -b cursor/add-payment-gateway
# git checkout -b cursor/fix-notification-bug
# git checkout -b cursor/improve-leaderboard
```

---

### **Step 2: Develop & Commit**
```bash
# Make changes to files...
# ... code code code ...

# Check what changed
git status
git diff

# Stage your changes
git add .
# or specific files
git add chaingive-backend/src/controllers/payment.controller.ts

# Commit with clear message
git commit -m "feat: Add Flutterwave payment integration"

# Commit often! Small commits are better
git commit -m "fix: Handle edge case in payment validation"
git commit -m "docs: Update payment API documentation"
```

---

### **Step 3: Push to GitHub**
```bash
# First push - creates remote branch
git push -u origin cursor/feature-name

# Subsequent pushes
git push

# Push after each significant change or end of day
```

---

### **Step 4: Create Pull Request & Merge**
```bash
# Option A: Via GitHub UI
1. Go to https://github.com/rousenormanwray-a11y/Depo
2. Click "Pull requests" → "New pull request"
3. Select your branch
4. Add description
5. Click "Create pull request"
6. Review → "Merge pull request"

# Option B: Via GitHub CLI (faster!)
gh pr create --title "Add payment gateway integration" \
  --body "## Summary
- Integrated Flutterwave
- Added payment validation
- Updated API docs

## Testing
- Tested with test API keys
- Verified webhook handling"

# Then merge
gh pr merge --squash
```

---

### **Step 5: Clean Up & Repeat**
```bash
# After merge, switch back to main
git checkout main
git pull origin main

# Delete old feature branch
git branch -d cursor/feature-name

# Delete remote branch (optional)
git push origin --delete cursor/feature-name

# Start next feature
git checkout -b cursor/next-feature
```

---

## 📋 **BRANCH NAMING CONVENTIONS**

### **Format:** `cursor/category-short-description`

**Categories:**
- `feat/` - New feature
- `fix/` - Bug fix
- `refactor/` - Code improvement (no new features)
- `docs/` - Documentation only
- `test/` - Adding tests
- `perf/` - Performance improvement
- `chore/` - Maintenance tasks

**Examples:**
```bash
cursor/feat-flutterwave-payment
cursor/fix-notification-crash
cursor/refactor-matching-algorithm
cursor/docs-api-reference
cursor/test-donation-flow
cursor/perf-database-indexing
cursor/chore-update-dependencies
```

---

## 💡 **COMMIT MESSAGE BEST PRACTICES**

### **Format:** `type: Short description`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

**Good Examples:**
```bash
git commit -m "feat: Add Paystack payment integration"
git commit -m "fix: Resolve race condition in escrow release"
git commit -m "docs: Update API authentication guide"
git commit -m "refactor: Simplify matching algorithm logic"
git commit -m "test: Add unit tests for referral system"
git commit -m "perf: Add database indexes for faster queries"
```

**Bad Examples:**
```bash
git commit -m "updates"           ❌ Too vague
git commit -m "fixed stuff"       ❌ Not descriptive
git commit -m "asdfasdf"          ❌ Meaningless
git commit -m "final final v2"    ❌ Confusing
```

---

## 🚨 **IMPORTANT RULES**

### **1. NEVER Commit to Main Directly**
```bash
# ❌ WRONG
git checkout main
git add .
git commit -m "changes"
git push

# ✅ RIGHT
git checkout -b cursor/my-feature
git add .
git commit -m "feat: Add new feature"
git push -u origin cursor/my-feature
# Then create PR
```

### **2. ALWAYS Pull Before Creating Branch**
```bash
# ✅ RIGHT ORDER
git checkout main
git pull origin main          # ← Get latest!
git checkout -b cursor/new-feature

# ❌ WRONG - Creating from old main
git checkout -b cursor/new-feature  # ← Old code!
```

### **3. ALWAYS Test Before Pushing**
```bash
# Before git push, do:
cd chaingive-backend
npm run build       # Check for errors
npm test            # Run tests (if any)
npm start           # Verify server starts

# Then push
git push
```

### **4. Keep Branches Small & Focused**
```bash
# ✅ GOOD - One feature per branch
cursor/add-flutterwave-payment

# ❌ BAD - Too many things
cursor/add-payments-and-fix-bugs-and-update-docs-and-refactor
```

### **5. Update from Main Regularly**
```bash
# If working on long feature, sync with main weekly:
git checkout cursor/long-feature
git fetch origin
git merge origin/main
# Fix any conflicts
git push
```

---

## 🔄 **HANDLING CONFLICTS**

### **When You See:**
```
CONFLICT (content): Merge conflict in file.ts
```

### **Do This:**
```bash
# 1. Open conflicted file
# Look for:
<<<<<<< HEAD
Your changes
=======
Their changes
>>>>>>> main

# 2. Decide what to keep
# Edit to final version

# 3. Mark as resolved
git add file.ts
git commit -m "fix: Resolve merge conflict in file.ts"
git push
```

---

## 📊 **DAILY WORKFLOW EXAMPLE**

### **Morning:**
```bash
git checkout main
git pull origin main
git checkout -b cursor/todays-work
```

### **During Day:**
```bash
# Work... commit often
git add .
git commit -m "feat: Add X"

git add .
git commit -m "fix: Fix Y"

git add .
git commit -m "test: Add tests for Z"

# Push periodically
git push
```

### **End of Day:**
```bash
# Final push
git push

# Create PR
gh pr create --title "Today's improvements"

# OR continue tomorrow on same branch
```

---

## 🎯 **CURRENT BRANCH STATUS**

**You are now on:**
```
cursor/post-merge-improvements
```

**This branch is for:**
- ✅ Testing the merged backend
- ✅ Running database migrations
- ✅ Fixing any post-merge issues
- ✅ Small improvements

---

## 🚀 **QUICK REFERENCE COMMANDS**

```bash
# See current branch
git branch

# See all branches
git branch -a

# Switch branches
git checkout branch-name

# Create & switch
git checkout -b cursor/new-feature

# See status
git status

# See changes
git diff

# Commit everything
git add . && git commit -m "message"

# Push
git push

# Pull latest main
git checkout main && git pull

# Delete branch
git branch -d branch-name

# View history
git log --oneline -10
```

---

## ✅ **YOU'RE ALL SET!**

**Current Setup:**
- ✅ On feature branch: `cursor/post-merge-improvements`
- ✅ Main is up to date
- ✅ Ready to work safely

**Next Steps:**
1. Make your changes
2. Commit often
3. Push regularly
4. Create PR when done
5. Merge & repeat!

---

**Happy Coding!** 🚀💚
