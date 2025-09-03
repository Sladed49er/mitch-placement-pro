# Fix-MissingSignout.ps1
# Creates the missing signout directory and page

Write-Host "🔧 Creating signout directory and page..." -ForegroundColor Cyan

# 1. Create the signout directory first
Write-Host "📁 Creating auth/signout directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "app\auth\signout" -Force | Out-Null

# 2. Create the signout page
Write-Host "📝 Creating signout page..." -ForegroundColor Green

$signoutPageContent = @'
'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically sign out and redirect
    signOut({ 
      callbackUrl: '/auth/signin',
      redirect: false 
    }).then(() => {
      router.push('/auth/signin');
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Signing out...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
'@

$signoutPageContent | Out-File -FilePath "app\auth\signout\page.tsx" -Encoding UTF8

Write-Host "✅ Signout page created successfully!" -ForegroundColor Green
Write-Host ""

# 3. Now make yourself an admin
Write-Host "📝 To make yourself an admin, run:" -ForegroundColor Cyan
Write-Host "   node scripts/make-admin.js your-email@example.com" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Then restart your dev server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "✨ Everything should now work!" -ForegroundColor Green