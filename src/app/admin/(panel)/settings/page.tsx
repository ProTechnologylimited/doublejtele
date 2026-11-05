import SettingsForm from "@/components/SettingsForm";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export default async function Settings() { return <><h1 className="mb-4 text-2xl font-bold">Store settings</h1><SettingsForm s={await getSettings()} /></>; }
