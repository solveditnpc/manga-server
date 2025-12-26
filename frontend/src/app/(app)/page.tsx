import LoginLogoutButton from "@/features/auth/components/LoginLogoutButton";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-medium fg-primary">Manga Library</h1>
        {/* Note */}
        <p className="text-sm fg-secondary italic -mt-3">
          {" "}
          ( Under development )
        </p>

        {/* Intro */}
        <p className="text-sm fg-muted">
          This is a simple manga reading site. Browse chapters, read
          comfortably, and keep track of what you like.
        </p>

        {/* Action */}
        <LoginLogoutButton className="w-full" />
      </div>
    </main>
  );
}
