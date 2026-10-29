import { initializeApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig as unknown as FirebaseOptions);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export async function saveHighScore(userId: string, username: string, score: number) {
    try {
        await addDoc(collection(db, 'scores'), {
            userId,
            username,
            score,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

export async function getTopScores(topN: number = 10) {
    try {
        const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(topN));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error fetching scores:', error);
        return [];
    }
}
