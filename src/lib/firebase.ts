// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVyJ11baYuYP5R8wFUmPqSnqG7o8-Sc2E",
  authDomain: "kitsune-e4979.firebaseapp.com",
  projectId: "kitsune-e4979",
  storageBucket: "kitsune-e4979.firebasestorage.app",
  messagingSenderId: "377457464883",
  appId: "1:377457464883:web:6f9ff1495821a2ec963546"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', snapshot => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (setProgress) setProgress(progress);
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            }, error => {
                reject(error);
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
                    resolve(downloadURL as string);
                })
            })
        } catch (error) {
            
        }
    })
}