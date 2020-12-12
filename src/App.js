//  --ALL REACT & FIREBASE IMPORTS--
import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/App';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';



//  --LINK PROJECT TO FIREBASE CREDENTIALS --
firebase.initializeApp({
  apiKey: "AIzaSyAnF0cwLdCQsumFImp2C03KecnkUTie77s",
  authDomain: "chatbox-ee36d.firebaseapp.com",
  projectId: "chatbox-ee36d",
  storageBucket: "chatbox-ee36d.appspot.com",
  messagingSenderId: "991768334821",
  appId: "1:991768334821:web:e85337a1ab67732456df0c",
  measurementId: "G-VG6NR6FTLC"
})

//    --FIREBASE LOGIN AUTH AND DATABASE--
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  //  Checks if user is currently signed-in with Google
  const [user] = useAuthState(auth); 

  return (

    //    --HEADER CONTENT--
    <div className="App">
      <header className="App-header">
      <h1>HEADER</h1>
      <SignOut />
      </header>

      {/*__If user IS signed-in: show chatroom component,
      _____If user IS NOT signed-in: SHOW LOGIN BUTTON */}
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}
//    --SIGN IN COMPONENT--
function SignIn() {
  //  Pop-up window for Google sign-in authentication
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    //  Sign-in button
    <button class="sign-in" onClick={signInWithGoogle}>Sign In With Google</button>
  )
}

//    --SIGN-OUT COMPONENT--
function SignOut() {

  //  If user is signed-in, then display sign-out button component
  return auth.currentUser && (

    <button class="sign-out" onClick={() => auth.signOut()}> Sign Out</button>
  )
}

//    --CHAT ROOM COMPONENT--
function ChatRoom() {

  const dummy = useRef()
  
  //  Retrieves last 25 messages from the 'messages' collection and then sorts
  //  them according to 'createdAt' field (chronologically)
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  //  Takes the ordered messages in messageRef and deconstructs them
  //  into an individual message property
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [ formValue, setFormValue ] = useState('');
  
  //    --SEND MESSAGE FUNCTION/COMPONENT--
  const sendMessage = async(e) => {

    e.preventDefault();

    //  Deconstructs the currentUser object (logged-in user) and retrieves 
    //  the uid and photoURL
    const { uid, photoURL } = auth.currentUser;

    // Adds the message reference as a document to the messages collection in database
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL

    });

    //  Resets the formValue back to empty
    setFormValue('');

    //  Uses the dummy const as a reference to scroll page back down when
    //  a new message is sent  
    dummy.current.scrollIntoView({ behavior: 'smooth'});
    
  }

  return (
    <>
      {/* This is where the sent messages are displayed */}
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>

      </main>


      {/*   --MESSAGE ENTRY BOX AND SUMBISSION BUTTON--    */}
      <form onSubmit={sendMessage}>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

       <button type="submit">submit message</button>
      </form>
    </>
  )
}

function ChatMessage(props) {

  //  Deconstruct the props.message object into three properties
  const {text, uid, photoURL} = props.message;

  //  Validates the user that the message was sent from
  const messageClass = uid === auth.currentUser.uid ? 'sent' : "received";

  return (
    // How the validated message returns back to the chatbox, to be displayed
    <div className={'message ${messageClass}'}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;
