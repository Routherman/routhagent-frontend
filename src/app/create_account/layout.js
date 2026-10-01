import ThemeWrapper from "@/components/dashboard/ThemeWrapper";
import Panel from "@/components/dashboard/Panel";

export default function CreateAccountLayout({ children }) {
    return (
        <ThemeWrapper>
            <Panel>
                {children}
            </Panel>
        </ThemeWrapper>
    );
}
