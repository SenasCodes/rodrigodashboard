import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AppProvider } from "../lib/app-context";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LeadFlow — Gestão de Leads Imobiliários" },
      { name: "description", content: "Dashboard inteligente para gestão de leads imobiliários" },
      { property: "og:title", content: "LeadFlow — Gestão de Leads Imobiliários" },
      { name: "twitter:title", content: "LeadFlow — Gestão de Leads Imobiliários" },
      { property: "og:description", content: "Dashboard inteligente para gestão de leads imobiliários" },
      { name: "twitter:description", content: "Dashboard inteligente para gestão de leads imobiliários" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b003d2c1-2abd-4437-91ec-b7d17a0ae081/id-preview-0d964b8d--3bd44427-1b99-4964-bbe0-98d4a72fe9f6.lovable.app-1778169895435.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b003d2c1-2abd-4437-91ec-b7d17a0ae081/id-preview-0d964b8d--3bd44427-1b99-4964-bbe0-98d4a72fe9f6.lovable.app-1778169895435.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Outlet />
      </AppProvider>
    </QueryClientProvider>
  );
}
