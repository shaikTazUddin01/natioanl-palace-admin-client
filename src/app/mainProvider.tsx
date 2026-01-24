"use client";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";


const MainProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {children}
        <Toaster />
      </PersistGate>
    </Provider>
  );
};

export default MainProvider;
