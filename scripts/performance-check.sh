#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Performance Check Script
# Boutique Phygitale 1885
#
# Usage:
#   chmod +x scripts/performance-check.sh
#   ./scripts/performance-check.sh
#
# Features:
# - Build size analysis
# - Bundle chunk breakdown
# - Performance recommendations
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Icons
CHECK="✅"
WARN="⚠️"
ERROR="❌"
INFO="ℹ️"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Performance Check - Boutique Phygitale 1885${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Step 1: Check if .next exists ──────────────────────────

if [ ! -d ".next" ]; then
  echo -e "${YELLOW}${WARN} No .next directory found. Building...${NC}"
  npm run build
  echo ""
fi

# ── Step 2: Analyze Bundle Sizes ───────────────────────────

echo -e "${BLUE}📦 Analyzing JavaScript Bundles...${NC}"
echo ""

# Get total chunks size
TOTAL_CHUNKS=$(du -sh .next/static/chunks/ 2>/dev/null | awk '{print $1}')
echo -e "Total Chunks Size: ${GREEN}${TOTAL_CHUNKS}${NC}"

# Get total server size
TOTAL_SERVER=$(du -sh .next/server/ 2>/dev/null | awk '{print $1}')
echo -e "Total Server Size: ${YELLOW}${TOTAL_SERVER}${NC}"
echo ""

# ── Step 3: List Top 10 Largest Chunks ─────────────────────

echo -e "${BLUE}📊 Top 10 Largest JavaScript Chunks:${NC}"
echo ""

printf "%-10s %-50s\n" "SIZE" "FILE"
printf "%-10s %-50s\n" "────" "────────────────────────────────────────────────"

du -sh .next/static/chunks/*.js 2>/dev/null | \
  sort -hr | \
  head -10 | \
  while read size file; do
    # Color code based on size
    if [[ $size == *M* ]] || (( $(echo $size | sed 's/K//') > 200 )); then
      printf "${RED}%-10s${NC} %-50s\n" "$size" "$(basename $file)"
    elif (( $(echo $size | sed 's/K//') > 100 )); then
      printf "${YELLOW}%-10s${NC} %-50s\n" "$size" "$(basename $file)"
    else
      printf "${GREEN}%-10s${NC} %-50s\n" "$size" "$(basename $file)"
    fi
  done

echo ""

# ── Step 4: Check Critical Bundle Sizes ────────────────────

echo -e "${BLUE}🎯 Critical Bundle Analysis:${NC}"
echo ""

# Find polyfill file
POLYFILL_SIZE=$(find .next/static/chunks -name "*.js" -type f -exec ls -lh {} \; | \
  awk '{print $5, $9}' | \
  grep -E "polyfill|a6dad97d" | \
  awk '{print $1}' | \
  head -1)

if [ ! -z "$POLYFILL_SIZE" ]; then
  POLYFILL_KB=$(echo $POLYFILL_SIZE | sed 's/K//')
  if (( $(echo "$POLYFILL_KB > 50" | bc -l) )); then
    echo -e "${WARN} Polyfill Size: ${YELLOW}${POLYFILL_SIZE}${NC} (Target: < 50KB)"
    echo -e "   ${INFO} Recommendation: Update .browserslistrc to target modern browsers"
  else
    echo -e "${CHECK} Polyfill Size: ${GREEN}${POLYFILL_SIZE}${NC} (Good!)"
  fi
else
  echo -e "${INFO} Polyfill: Not found or merged into main bundle"
fi

# Check largest chunk (likely framework)
LARGEST_CHUNK=$(du -sh .next/static/chunks/*.js 2>/dev/null | \
  sort -hr | \
  head -1 | \
  awk '{print $1}')

LARGEST_KB=$(echo $LARGEST_CHUNK | sed 's/K//')
if (( $(echo "$LARGEST_KB > 200" | bc -l) )); then
  echo -e "${WARN} Largest Chunk: ${YELLOW}${LARGEST_CHUNK}${NC} (Target: < 200KB)"
  echo -e "   ${INFO} Recommendation: Implement dynamic imports for heavy components"
else
  echo -e "${CHECK} Largest Chunk: ${GREEN}${LARGEST_CHUNK}${NC} (Good!)"
fi

echo ""

# ── Step 5: Production Dependencies ─────────────────────────

echo -e "${BLUE}📚 Production Dependencies Analysis:${NC}"
echo ""

# Count production dependencies
PROD_DEPS=$(npm ls --depth=0 --production 2>/dev/null | grep -c "├\|└" || echo "0")
echo -e "Total Production Dependencies: ${YELLOW}${PROD_DEPS}${NC}"

# Check for heavy dependencies
echo ""
echo -e "Heavy Dependencies Detected:"

if npm ls framer-motion --depth=0 &>/dev/null; then
  echo -e "${WARN} framer-motion: ~80KB"
  echo -e "   ${INFO} Consider: Dynamic import for animations"
fi

if npm ls @stripe/stripe-js --depth=0 &>/dev/null; then
  echo -e "${INFO} @stripe/stripe-js: ~50KB (route-based, OK)"
fi

if npm ls lucide-react --depth=0 &>/dev/null; then
  echo -e "${WARN} lucide-react: ~40KB"
  echo -e "   ${INFO} Consider: Import only used icons individually"
fi

echo ""

# ── Step 6: Image Optimization Check ───────────────────────

echo -e "${BLUE}🖼️  Image Optimization Check:${NC}"
echo ""

# Count next/image usage
IMAGE_USAGE=$(grep -r "from 'next/image'" src/ --include="*.tsx" 2>/dev/null | wc -l | xargs)
echo -e "next/image Usage: ${GREEN}${IMAGE_USAGE} files${NC}"

# Check for regular <img> tags
IMG_TAGS=$(grep -r "<img " src/ --include="*.tsx" 2>/dev/null | wc -l | xargs)
if [ "$IMG_TAGS" -gt 0 ]; then
  echo -e "${WARN} Regular <img> tags found: ${YELLOW}${IMG_TAGS}${NC}"
  echo -e "   ${INFO} Recommendation: Replace with next/image"
else
  echo -e "${CHECK} No regular <img> tags (Good!)"
fi

echo ""

# ── Step 7: Dynamic Imports Check ──────────────────────────

echo -e "${BLUE}⚡ Code Splitting Check:${NC}"
echo ""

# Count dynamic imports
DYNAMIC_IMPORTS=$(grep -r "dynamic(" src/ --include="*.tsx" 2>/dev/null | wc -l | xargs)

if [ "$DYNAMIC_IMPORTS" -eq 0 ]; then
  echo -e "${ERROR} No dynamic imports found!"
  echo -e "   ${INFO} Recommendation: Implement dynamic imports for heavy components"
  echo -e "   ${INFO} See: performance-fixes/WEEK_1_CRITICAL.md"
else
  echo -e "${CHECK} Dynamic Imports: ${GREEN}${DYNAMIC_IMPORTS}${NC}"
fi

echo ""

# ── Step 8: Performance Score Estimate ─────────────────────

echo -e "${BLUE}🎯 Estimated Performance Score:${NC}"
echo ""

SCORE=100

# Deduct points based on issues
LARGEST_KB_NUM=$(echo $LARGEST_KB | cut -d'.' -f1)

if (( $LARGEST_KB_NUM > 200 )); then
  SCORE=$((SCORE - 20))
  echo -e "${WARN} Large bundle detected (-20 points)"
fi

if [ "$DYNAMIC_IMPORTS" -eq 0 ]; then
  SCORE=$((SCORE - 15))
  echo -e "${WARN} No code splitting (-15 points)"
fi

if [ "$IMG_TAGS" -gt 0 ]; then
  SCORE=$((SCORE - 10))
  echo -e "${WARN} Unoptimized images (-10 points)"
fi

# Polyfill check
if [ ! -z "$POLYFILL_KB" ] && (( $(echo "$POLYFILL_KB > 50" | bc -l) )); then
  SCORE=$((SCORE - 10))
  echo -e "${WARN} Large polyfill (-10 points)"
fi

echo ""

if [ $SCORE -ge 90 ]; then
  echo -e "Estimated Score: ${GREEN}${SCORE}/100${NC} ${CHECK} Excellent!"
elif [ $SCORE -ge 70 ]; then
  echo -e "Estimated Score: ${YELLOW}${SCORE}/100${NC} ${WARN} Good, but can improve"
else
  echo -e "Estimated Score: ${RED}${SCORE}/100${NC} ${ERROR} Needs optimization"
fi

echo ""

# ── Step 9: Recommendations ─────────────────────────────────

echo -e "${BLUE}💡 Recommendations:${NC}"
echo ""

if [ $SCORE -lt 90 ]; then
  echo -e "1. ${INFO} Review PERFORMANCE_AUDIT_REPORT.md"
  echo -e "2. ${INFO} Implement Week 1 critical fixes: performance-fixes/WEEK_1_CRITICAL.md"
  echo -e "3. ${INFO} Run bundle analyzer: ANALYZE=true npm run build"
  echo -e "4. ${INFO} Test with Lighthouse: npx lighthouse http://localhost:3000 --view"
else
  echo -e "${CHECK} Your application is well-optimized!"
  echo -e "${INFO} Continue monitoring with Vercel Analytics"
fi

echo ""

# ── Step 10: Next Steps ─────────────────────────────────────

echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo -e "• Install bundle analyzer: ${YELLOW}npm install --save-dev @next/bundle-analyzer${NC}"
echo -e "• Run analysis: ${YELLOW}ANALYZE=true npm run build${NC}"
echo -e "• Test production: ${YELLOW}npm run build && npm start${NC}"
echo -e "• Run Lighthouse: ${YELLOW}npx lighthouse http://localhost:3000 --view${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Performance check complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
