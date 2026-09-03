import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const app = initializeApp({
  apiKey:"AIzaSyD0g2B4CGcfeDByfsZhTijDLM5sMN0nILs",
  authDomain:"takamatsutrip.firebaseapp.com",
  projectId:"takamatsutrip",
  storageBucket:"takamatsutrip.firebasestorage.app",
  messagingSenderId:"529566160290",
  appId:"1:529566160290:web:5bc6c21713c4cbae7f0efb"
});
const auth=getAuth(app), db=getFirestore(app), tripRef=doc(db,"trips","setouchi-2026");
const EDITOR_ACCOUNT="trip-editor@takamatsutrip.local";
setPersistence(auth,browserLocalPersistence).catch(()=>{});

export const watchEditor=(callback)=>onAuthStateChanged(auth,user=>callback(!!user));
export const watchTrip=(onData,onError)=>onSnapshot(tripRef,snap=>onData(snap.exists()?snap.data():null),onError);
export const loginEditor=(password)=>signInWithEmailAndPassword(auth,EDITOR_ACCOUNT,password);
export const logoutEditor=()=>signOut(auth);
export const saveTrip=(days)=>setDoc(tripRef,{days,updatedAt:serverTimestamp()},{merge:true});
