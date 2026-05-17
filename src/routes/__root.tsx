import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { BlogProvider } from "@/lib/blog-context";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-extrabold text-gradient-brand">404</h1>
        <h2 className="mt-4 font-display text-2xl font-bold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This URL doesn't exist in the editorial.</p>
        <Link to="/" className="mt-6 inline-flex rounded-2xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-brand">Back to home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-2xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-brand">
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ddumba.AI · Editorial on Production AI Infrastructure" },
      { name: "description", content: "Premium engineering essays on AI platforms, RAG systems, vLLM, Kubernetes, and inference optimization by Ddumba AK." },
      { property: "og:title", content: "Ddumba.AI Editorial" },
      { property: "og:description", content: "Engineering essays on production AI infrastructure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "icon", href: "/favicon.png" }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
      <BlogProvider>
        <Outlet />
        <Toaster theme="dark" position="bottom-right" />
      </BlogProvider>
    </QueryClientProvider>
  );
}
