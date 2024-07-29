import { useState } from "react";

import { Chat } from "./chat.js";

function App() {
  //const [currentUser, setCurrentUser] = useState(null);

  return (
    <div className="app">
      <Chat />
    </div>
  );
}

export default App;