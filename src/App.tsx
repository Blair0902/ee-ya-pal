import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Story from "./pages/Story";
import Sleep from "./pages/Sleep";
import Pokedex from "./pages/Pokedex";
import Me from "./pages/Me";
import Thinking from "./pages/Thinking";
import Science from "./pages/Science";
import Feelings from "./pages/Feelings";
import Games from "./pages/Games";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Home />} />
          <Route path="/story" element={<Story />} />
          <Route path="/sleep" element={<Sleep />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/me" element={<Me />} />
          <Route path="/thinking" element={<Thinking />} />
          <Route path="/science" element={<Science />} />
          <Route path="/feelings" element={<Feelings />} />
          <Route path="/games" element={<Games />} />
          {/* 旧路由兼容 */}
          <Route path="/chat" element={<Navigate to="/home" replace />} />
          <Route path="/quiz" element={<Navigate to="/story" replace />} />
          <Route path="/backpack" element={<Navigate to="/pokedex" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
