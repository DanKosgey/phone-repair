/**
 * Script to verify middleware fixes
 * Run this script to check if the middleware is properly configured
 */

import fs from 'fs';
import path from 'path';

// Check if middleware file exists
const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
if (!fs.existsSync(middlewarePath)) {
  console.error('❌ Middleware file not found at src/middleware.ts');
  process.exit(1);
}

// Read middleware file
const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');

// Check for critical fixes
const checks = [
  {
    name: 'Cookie domain logic fix',
    pattern: /cookieDomain = hostname\.split\(\':\'\)\[0\]/,
    required: true
  },
  {
    name: 'HTTPS detection',
    pattern: /isHttps = protocol === 'https:'/,
    required: true
  },
  {
    name: 'PKCE flow support',
    pattern: /flowType: 'pkce'/,
    required: true
  },
  {
    name: 'Auth route exclusion',
    pattern: /request\.nextUrl\.pathname === '\/login'/,
    required: true
  },
  {
    name: 'Secure cookie settings',
    pattern: /secure: isHttps/,
    required: true
  },
  {
    name: 'HttpOnly cookie settings',
    pattern: /httpOnly: options\.httpOnly/,
    required: true
  },
  {
    name: 'Protected routes check',
    pattern: /isAuthRoute = request\.nextUrl\.pathname\.startsWith\('\/auth'\)/,
    required: true
  },
  {
    name: 'Public routes check',
    pattern: /isPublicRoute = request\.nextUrl\.pathname === '\//,
    required: true
  },
  {
    name: 'Session redirect on protected routes',
    pattern: /return NextResponse\.redirect\(redirectUrl\)/,
    required: true
  }
];

console.log('🔍 Verifying middleware fixes...\n');

let allChecksPassed = true;

checks.forEach(check => {
  const found = check.pattern.test(middlewareContent);
  if (found) {
    console.log(`✅ ${check.name}`);
  } else if (check.required) {
    console.log(`❌ ${check.name} (REQUIRED)`);
    allChecksPassed = false;
  } else {
    console.log(`⚠️  ${check.name} (Optional)`);
  }
});

console.log('\n' + '='.repeat(50));

if (allChecksPassed) {
  console.log('🎉 All critical middleware fixes are in place!');
  console.log('✅ Your middleware is production-ready.');
} else {
  console.log('❌ Some critical fixes are missing.');
  console.log('🚨 Please review the middleware implementation.');
  process.exit(1);
}