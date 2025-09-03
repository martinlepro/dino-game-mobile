import { getFirestore, collection, doc, getDoc, writeBatch, updateDoc, getDocs } from "firebase/firestore";

const db = getFirestore();

/**
 * Fonction à appeler à l'ouverture de l'app
 * Vérifie la date du dernier reset et réinitialise le leaderboard si nécessaire
 */
async function resetLeaderboardIfNeeded() {
  const metaRef = doc(db, "leaderboardMeta", "meta"); // document metadata
  const metaSnap = await getDoc(metaRef);
  const today = new Date().toISOString().slice(0,10); // yyyy-mm-dd

  // Vérifie si un reset est nécessaire
  if (!metaSnap.exists() || metaSnap.data().lastReset !== today) {
    console.log("Reset du leaderboard...");

    // Reset des scores
    const leaderboardSnapshot = await getDocs(collection(db, "leaderboard"));
    const batch = writeBatch(db);
    leaderboardSnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { score: 0 });
    });
    await batch.commit();

    // Met à jour la date du dernier reset
    if (metaSnap.exists()) {
      await updateDoc(metaRef, { lastReset: today });
    } else {
      await setDoc(metaRef, { lastReset: today });
    }

    console.log("Leaderboard réinitialisé ✅");
  } else {
    console.log("Pas besoin de reset aujourd'hui.");
  }
}
