import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, Timestamp, onSnapshot,
  DocumentData, QueryConstraint, DocumentReference, WithFieldValue
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const createFirebaseService = <T extends DocumentData>(collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  
  return {
    // Récupérer tous les documents
    getAll: async () => {
      const snapshot = await getDocs(collectionRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    },
    
    // Récupérer un document par ID
    getById: async (id: string) => {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as unknown as T;
      }
      return null;
    },
    
    // Créer un nouveau document
    create: async (data: Omit<T, 'id'>) => {
      const docRef = await addDoc(collectionRef, data as WithFieldValue<DocumentData>);
      return { id: docRef.id, ...data } as unknown as T;
    },
    
    // Mettre à jour un document
    update: async (id: string, data: Partial<T>) => {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data as WithFieldValue<DocumentData>);
      return { id, ...data } as Partial<T>;
    },
    
    // Supprimer un document
    delete: async (id: string) => {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return id;
    },
    
    // Requête personnalisée
    query: async (constraints: QueryConstraint[]) => {
      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    },
    
    // Écouter les changements en temps réel
    subscribe: (constraints: QueryConstraint[], callback: (data: T[]) => void) => {
      const q = query(collectionRef, ...constraints);
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
        callback(data);
      });
    },

    // Compter les documents
    count: async (constraints: QueryConstraint[] = []) => {
      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.size;
    }
  };
};
