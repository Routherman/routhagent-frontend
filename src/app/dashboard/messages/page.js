import Sidebar from "@/components/dashboard/Sidebar";
import DashboardPanel from "@/components/dashboard/Panel";
import MessagesPanel from "@/components/messages/Panel";

export default function MessagesPage() {
    return (
        <>
            <Sidebar />
            <DashboardPanel>
                {/* Omitimos el Header general aquí porque Messages tiene sus propios headers */}
                <MessagesPanel />
            </DashboardPanel>
        </>
    );
}
