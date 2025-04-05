"use client"

import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import MainMenu from "./pages/main-menu"; // Added import for MainMenu
import Home from "./pages/home";
import NotFound from "./pages/not-found";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";


function App() {
  useEffect(() => {
    // You can add any global setup here
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/play" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster/>
    </QueryClientProvider>
  );
}

export default App;