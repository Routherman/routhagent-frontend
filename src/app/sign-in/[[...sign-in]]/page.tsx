import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <SignIn fallbackRedirectUrl="/dashboard" />
    </main>
  )
}

