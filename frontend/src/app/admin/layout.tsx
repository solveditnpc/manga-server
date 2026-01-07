import AdminHeader from "@/components/layout/admin/AdminHeader";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background fg-primary">
      {/* Admin Header */}
      <AdminHeader />

      {/* Admin Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
