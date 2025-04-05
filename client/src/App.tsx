import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MainMenu from "@/pages/main-menu";
import PlayPage from "@/pages/play";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainMenu} />
      <Route path="/play" component={PlayPage} />
      <Route>
        {/* 404 fallback */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a0f0b] to-[#2a1a14] text-amber-100">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-amber-400 mb-4">404</h1>
            <p className="text-xl mb-8">Page not found</p>
            <a href="/" className="px-6 py-3 bg-amber-800 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors">
              Return to Main Menu
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
