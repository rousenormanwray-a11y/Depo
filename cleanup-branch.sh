#!/bin/bash

echo "🧹 Cleaning up redundant documentation files..."
echo ""

# Platform level interim docs
echo "Removing platform interim docs..."
rm -f ALL-FEATURES-COMPLETE-SUMMARY.md
rm -f BACKEND-MISSING-FEATURES-ANALYSIS.md
rm -f BACKEND-PROGRESS-UPDATE.md
rm -f FINAL-7-FEATURES-IMPLEMENTATION.md
rm -f FINAL-IMPLEMENTATION-SUMMARY.md
rm -f IMPLEMENTATION-COMPLETE-SUMMARY.md
rm -f MERGE-CONFLICT-SOLUTION.md

# Backend interim docs
echo "Removing backend interim docs..."
rm -f chaingive-backend/ALL-GAPS-FIXED-FINAL.md
rm -f chaingive-backend/FINAL-FIXES-SUMMARY.md
rm -f chaingive-backend/FINAL-PLATFORM-COMPLETE.md
rm -f chaingive-backend/IMPLEMENTATION-GAPS-ANALYSIS.md
rm -f chaingive-backend/MERGE-CONFLICTS-RESOLVED.md
rm -f chaingive-backend/MERGE-READY-FINAL.md
rm -f chaingive-backend/ULTIMATE-COMPLETE-SUMMARY.md

# Mobile interim docs
echo "Removing mobile interim docs..."
rm -f chaingive-mobile/IMMEDIATE-ACTION-ITEMS.md
rm -f chaingive-mobile/MOBILE-APP-ANALYSIS-REPORT.md

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Files removed: 16"
echo "Files remaining for merge: ~110"
echo ""
echo "Next steps:"
echo "1. git add -A"
echo "2. git commit -m 'chore: Remove redundant interim documentation'"
echo "3. git push origin cursor/post-merge-improvements --force-with-lease"
echo "4. Create PR to main"
