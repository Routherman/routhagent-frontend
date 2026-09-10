import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Panel from "@/components/dashboard/Panel";

export default function Dashboard() {
    return (
        <>
            <Sidebar />
            <Panel>
                <Header />
                <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    {/* Aquí irán los widgets (Portfolio, Assets, Market, etc.) */}
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 mt-4">
                        Contenido principal (Widgets, Gráficos)
                    </div>
                </div>
            </Panel>
        </>
    );
}