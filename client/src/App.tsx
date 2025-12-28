import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ClickRippleProvider } from "./components/ClickRipple";
import { MouseStalker } from "./components/MouseStalker";
import { LoadingScreen } from "./components/LoadingScreen";

// Pages
import Home from "./pages/Home";
import Works from "./pages/Works";
import WorkDetail from "./pages/WorkDetail";
import WorkNew from "./pages/WorkNew";
import WorkEdit from "./pages/WorkEdit";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import Links from "./pages/Links";
import Tools from "./pages/Tools";
import Philosophy from "./pages/Philosophy";
import Services from "./pages/Services";
import Notifications from "./pages/Notifications";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/works" component={Works} />
      <Route path="/works/new" component={WorkNew} />
      <Route path="/works/:id" component={WorkDetail} />
      <Route path="/works/:id/edit" component={WorkEdit} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/likes" component={Profile} />
      <Route path="/contact" component={Contact} />
      <Route path="/links" component={Links} />
      <Route path="/tools" component={Tools} />
      <Route path="/philosophy" component={Philosophy} />
      <Route path="/services" component={Services} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isContentReady, setIsContentReady] = useState(false);

  // コンテンツの読み込み完了を検知
  useEffect(() => {
    // DOMContentLoadedとwindow.loadの両方を監視
    const checkReadyState = () => {
      if (document.readyState === 'complete') {
        setIsContentReady(true);
      }
    };

    // 既に読み込み完了している場合
    if (document.readyState === 'complete') {
      setIsContentReady(true);
      return;
    }

    // まだ読み込み中の場合はイベントリスナーを設定
    window.addEventListener('load', checkReadyState);
    document.addEventListener('readystatechange', checkReadyState);

    return () => {
      window.removeEventListener('load', checkReadyState);
      document.removeEventListener('readystatechange', checkReadyState);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        {isLoading && (
          <LoadingScreen
            onLoadingComplete={() => setIsLoading(false)}
            minDisplayTime={1500}
            isContentReady={isContentReady}
          />
        )}
        <ClickRippleProvider>
          <MouseStalker />
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ClickRippleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
