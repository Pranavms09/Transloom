/**
 * historyService.ts
 *
 * Reads and writes per-user EDI analysis history to Firestore.
 * Path: users/{uid}/history/{docId}
 */
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { HistoryEntry } from "../contexts/EDIContext";

const MAX_HISTORY = 20;

function historyRef(uid: string) {
  return collection(db, "users", uid, "history");
}

/** Load the most recent MAX_HISTORY entries for a user */
export async function loadHistory(uid: string): Promise<HistoryEntry[]> {
  const q = query(historyRef(uid), orderBy("uploadedAt", "desc"), limit(MAX_HISTORY));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as HistoryEntry), _firestoreId: d.id }));
}

/** Append one new entry to Firestore history */
export async function addHistoryEntry(uid: string, entry: HistoryEntry): Promise<string> {
  const ref = await addDoc(historyRef(uid), entry);
  return ref.id;
}

/** Remove a single entry by its Firestore document ID */
export async function removeHistoryEntry(uid: string, firestoreId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "history", firestoreId));
}

/** Delete all history entries for a user */
export async function clearAllHistory(uid: string): Promise<void> {
  const snap = await getDocs(historyRef(uid));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
