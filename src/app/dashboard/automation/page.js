import Sidebar from "@/components/dashboard/Sidebar";
import DashboardPanel from "@/components/dashboard/Panel";
import AutomationPanel from "@/components/automation/Panel";

export default function AutomationPage() {
    return (
        <>
            <Sidebar />
            <DashboardPanel>
                <AutomationPanel />
            </DashboardPanel>
        </>
    );
}
