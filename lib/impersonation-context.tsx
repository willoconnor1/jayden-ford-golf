"use client";

import { createContext, useContext } from "react";

export const ImpersonatingContext = createContext(false);
export const useImpersonating = () => useContext(ImpersonatingContext);
