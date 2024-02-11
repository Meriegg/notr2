import { redirect } from "next/navigation";
import { Sidebar } from "~/components/application/sidebar";
import { getUserAuthData } from "~/server/utils/auth/get-user-auth-data";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const userData = await getUserAuthData();
  if (userData.error) {
    redirect("/login");
  }

  return (
    <div className="flex w-full items-start justify-start">
      <Sidebar />

      <div
        className="min-h-[100vh] flex-1"
        style={{ width: "min(1200px, 100%)" }}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
