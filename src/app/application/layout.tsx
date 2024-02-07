import { redirect } from "next/navigation";
import { Sidebar } from "~/components/application/sidebar";
import { getSession } from "~/server/utils/auth/get-session";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const userData = await getSession();
  if (userData.error) {
    redirect("/login");
  }

  return (
    <div className="flex w-full items-start justify-start">
      <Sidebar />

      <div className="min-h-[100vh] flex-1">{children}</div>
    </div>
  );
};

export default Layout;
