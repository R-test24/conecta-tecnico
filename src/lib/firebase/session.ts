"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseConfigured, getFirebaseClient } from "./client";

export function useFirebaseSession() {
  const [user, setUser] = useState<User | null | undefined>();

  useEffect(() => {
    const client = getFirebaseClient();
    if (client) return onAuthStateChanged(client.auth, setUser);
  }, []);

  return firebaseConfigured ? user : null;
}
