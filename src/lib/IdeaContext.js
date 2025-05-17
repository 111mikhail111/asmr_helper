// context/IdeaContext.js
"use client";

import { createContext, useContext, useState } from "react";

const IdeaContext = createContext();

export const IdeaProvider = ({ children }) => {
  const [ideaParams, setIdeaParams] = useState({
    requiredTriggers: [],
    excludedTriggers: [],
    duration: 10,
  });

  return (
    <IdeaContext.Provider value={{ ideaParams, setIdeaParams }}>
      {children}
    </IdeaContext.Provider>
  );
};

export const useIdeaContext = () => useContext(IdeaContext);
