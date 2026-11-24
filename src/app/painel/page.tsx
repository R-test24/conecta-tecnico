import { Dashboard } from "@/components/dashboard";
import { FirebaseDashboard } from "@/components/firebase-account";
import { firebaseConfigured } from "@/lib/firebase/client";

export default function Page() {
  return firebaseConfigured ? <FirebaseDashboard/> : <Dashboard/>;
}
