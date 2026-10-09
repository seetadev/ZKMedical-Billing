import { Topbar }    from "./components/layout/Topbar";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: "#fafaf8",
            color: "#1a1a1a",
        }}>
            <Topbar />
            <Dashboard />
        </div>
    );
}
