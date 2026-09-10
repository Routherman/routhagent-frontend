import Sidebar from "@/components/dashboard/Sidebar";
import DashboardPanel from "@/components/dashboard/Panel";
import UserPanel from "@/components/user/Panel";

export default function UserPage() {
    return (
        <>
            <Sidebar />
            <DashboardPanel>
                {/* Omitimos el Header general aquí porque UserPanel tiene sus propios headers */}
                <UserPanel />
            </DashboardPanel>
        </>
    );
}
