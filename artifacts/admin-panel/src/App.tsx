import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { SettingsPage } from "@/pages/settings";
import { SectionsPage } from "@/pages/sections";
import { ContactPage } from "@/pages/contact";
import { ColorsPage } from "@/pages/colors";
import { WpSettingsPage } from "@/pages/wp-settings";
import { WpPagesPage } from "@/pages/wp-pages";
import { WpPostsPage } from "@/pages/wp-posts";
import { PluginsPage } from "@/pages/plugins";
import { ParkingProPage } from "@/pages/parkingpro";
import { LogoPage } from "@/pages/logo";

const queryClient = new QueryClient();

function ProtectedRouter() {
  const { token, isChecking } = useAuth();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!token) {
    return <LoginPage />;
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/sections" component={SectionsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/colors" component={ColorsPage} />
        <Route path="/wp-settings" component={WpSettingsPage} />
        <Route path="/wp-pages" component={WpPagesPage} />
        <Route path="/wp-posts" component={WpPostsPage} />
        <Route path="/plugins" component={PluginsPage} />
        <Route path="/parkingpro" component={ParkingProPage} />
        <Route path="/logo" component={LogoPage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ProtectedRouter />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
