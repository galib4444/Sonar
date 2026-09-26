#!/bin/bash

# Security verification script
# Checks that sensitive files are properly protected

echo "🔒 HustlerAI Security Verification"
echo "=================================="
echo ""

ISSUES_FOUND=0

# Check 1: .gitignore exists and contains .env patterns
echo "✓ Checking .gitignore..."
if [ -f ".gitignore" ]; then
  if grep -q "\.env\*\.local" .gitignore && grep -q "\.env" .gitignore; then
    echo "  ✅ .gitignore properly configured for .env files"
  else
    echo "  ❌ .gitignore missing .env patterns!"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
else
  echo "  ❌ .gitignore file not found!"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 2: .env.local exists but is not tracked
echo ""
echo "✓ Checking .env.local status..."
if [ -f ".env.local" ]; then
  echo "  ✅ .env.local exists"

  # Check if git is initialized
  if [ -d ".git" ]; then
    if git ls-files --error-unmatch .env.local 2>/dev/null; then
      echo "  ❌ CRITICAL: .env.local is tracked by git!"
      echo "     Run: git rm --cached .env.local"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
      echo "  ✅ .env.local is not tracked by git"
    fi
  else
    echo "  ℹ️  Git not initialized yet (run: git init)"
  fi
else
  echo "  ⚠️  .env.local not found (you may need to create it)"
fi

# Check 3: .env.local.template exists
echo ""
echo "✓ Checking template files..."
if [ -f ".env.local.template" ] || [ -f ".env.example" ]; then
  echo "  ✅ Template file exists for documentation"
else
  echo "  ⚠️  No template file found (.env.local.template or .env.example)"
fi

# Check 4: Scan for potential leaked secrets in git history
echo ""
echo "✓ Checking git history for leaked secrets..."
if [ -d ".git" ]; then
  if git log --all --full-history -- "*.env*" | grep -q ".env"; then
    echo "  ⚠️  .env files found in git history - may need cleanup"
    echo "     See SECURITY.md for instructions on removing secrets from history"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    echo "  ✅ No .env files in git history"
  fi
else
  echo "  ℹ️  Git not initialized yet"
fi

# Check 5: Look for API keys in tracked files
echo ""
echo "✓ Scanning tracked files for potential API keys..."
if [ -d ".git" ]; then
  if git grep -iE "(GEMINI_API_KEY|OPENROUTER_API_KEY|sk-[A-Za-z0-9]{20,})" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' 2>/dev/null | grep -v "your_"; then
    echo "  ⚠️  Potential API keys found in tracked files!"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    echo "  ✅ No API keys detected in tracked files"
  fi
fi

# Final summary
echo ""
echo "=================================="
if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ All security checks passed!"
  echo ""
  echo "Your environment is properly secured."
  exit 0
else
  echo "❌ Found $ISSUES_FOUND security issue(s)"
  echo ""
  echo "Please review the issues above and fix them before proceeding."
  echo "See SECURITY.md for detailed instructions."
  exit 1
fi
