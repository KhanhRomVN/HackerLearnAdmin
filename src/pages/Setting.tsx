import { useEffect } from "react";

export default function SettingPage() {
    useEffect(() => {
        document.title = "Setting | HackerLearn Admin";
    }, []);
    return <div>Setting</div>;
}
