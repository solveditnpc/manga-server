import AuthForm from "@/components/domain/auth/AuthForm";
import Image from "next/image";
export default function AuthPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      {/* Background image */}
      <div className="h-screen w-screen absolute">
        <Image src="/bg.jpg" alt="logo" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/87 backdrop-blur-xs"></div>{" "}
      </div>

      {/* Card */}
      <div className="w-full max-w-sm px-6">
        <div className="bg-card opacity-90 border border-default rounded-lg p-6 space-y-6">
          {/* Header */}
          <header className="space-y-1">
            <h1 className="text-xl font-medium fg-primary text-center">
              Continue reading
            </h1>
            <p className="text-sm fg-muted text-center">
              Use a username to keep track of what you read and like.
            </p>
          </header>

          {/* Children ( FORM ) */}
          <AuthForm />

          {/* Footer note */}
          <p className="text-xs fg-muted text-center italic">
            If the username exists, we’ll verify the password.
            <br />
            If it’s new, we’ll register it and continue.
          </p>
        </div>
      </div>
    </div>
  );
}
