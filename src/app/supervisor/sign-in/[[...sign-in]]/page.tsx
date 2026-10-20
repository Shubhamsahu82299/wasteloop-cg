import { SignIn } from "@clerk/nextjs";

export default function SupervisorSignInPage() {
  return (
    <main className="portal-auth-page portal-auth-supervisor">
      <div className="portal-auth-intro">
        <span className="portal-auth-kicker">WasteLoop · Authority console</span>
        <h1>Municipal response, at a glance.</h1>
        <p>Sign in with your approved supervisor account to review, assign, and verify citizen complaints.</p>
      </div>
      <SignIn path="/supervisor/sign-in" routing="path" withSignUp={false} forceRedirectUrl="/supervisor" />
    </main>
  );
}
