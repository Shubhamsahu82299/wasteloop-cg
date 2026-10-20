import { SignUp } from "@clerk/nextjs";

export default function CitizenSignUpPage() {
  return (
    <main className="portal-auth-page portal-auth-citizen">
      <div className="portal-auth-intro">
        <span className="portal-auth-kicker">WasteLoop · Citizen portal</span>
        <h1>Create your citizen account.</h1>
        <p>Keep your complaints, locations, and resolution updates in one secure place.</p>
      </div>
      <SignUp path="/citizen/sign-up" routing="path" signInUrl="/citizen/sign-in" forceRedirectUrl="/" />
    </main>
  );
}
