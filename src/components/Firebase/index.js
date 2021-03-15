
import firebase from "firebase/app";
import "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCHgAkTGGWVbX2DEkyarYKeSqJep9cgP68",
    authDomain: "scm-project-1848d.firebaseapp.com",
    projectId: "scm-project-1848d",
    storageBucket: "scm-project-1848d.appspot.com",
    messagingSenderId: "970675374667",
    appId: "1:970675374667:web:e2627f3faa1e428b999bce",
    measurementId: "G-GH29VNCDH9"
  };

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export { storage, firebase as default };