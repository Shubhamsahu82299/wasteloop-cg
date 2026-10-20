import { SignIn } from "@clerk/nextjs";

export default function CitizenSignInPage() {
  return (
    <main className="portal-auth-page portal-auth-citizen">
      <div className="portal-auth-intro">
        <span className="portal-auth-kicker">WasteLoop · Citizen portal</span>
        <h1>Report what needs fixing in your neighbourhood.</h1>
        <p>Sign in to submit complaints, attach evidence, and follow every resolution step.</p>
      </div>
      <SignIn path="/citizen/sign-in" routing="path" signUpUrl="/citizen/sign-up" forceRedirectUrl="/" />
    </main>
  );
}
