import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <SignUp fallbackRedirectUrl="/dashboard" />
    </main>
  )
}

