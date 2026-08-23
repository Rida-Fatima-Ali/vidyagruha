import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { UserManager } from "@/components/admin/user-manager";

export default function AdminUsersPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="VidyaGruha · Administration"
          title="Users"
          description="Every account across the institution — students, faculty and administrators."
        />
        <UserManager />
      </div>
    </PageTransition>
  );
}
