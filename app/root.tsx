import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  json,
  redirect,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { GlobalPendingIndicator } from "@/components/global-pending-indicator";
import { Header } from "@/components/header";
import {
  ThemeSwitcherSafeHTML,
  ThemeSwitcherScript,
} from "@/components/theme-switcher";

import "./globals.css";
import { LoaderFunctionArgs } from "@remix-run/node";
import { hueAuth } from "./lib/util";
import { HueContextProvider } from "./context/hue-bridge-context";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await hueAuth.parse(cookieHeader)) || {};

  const requestUrl = new URL(request.url);
  const currentPath = requestUrl.pathname;
  console.log(currentPath);

  if (cookie.url) {
    if (currentPath === "/") {
      return redirect("/rooms", {
        headers: { "Set-Cookie": await hueAuth.serialize(cookie) },
      });
    }
    return json({ hueUrl: cookie.url as string });
  }
  if (currentPath === "/rooms") {
    return redirect("/", {
      headers: { "Set-Cookie": await hueAuth.serialize(cookie) },
    });
  }
  return json({ hueUrl: cookie.url as string });
}

function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeSwitcherSafeHTML lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ThemeSwitcherScript />
      </head>
      <body>
        <GlobalPendingIndicator />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </ThemeSwitcherSafeHTML>
  );
}

export default function Root() {
  const { hueUrl } = useLoaderData<typeof loader>();

  return (
    <App>
      <HueContextProvider value={hueUrl}>
        <Outlet />
      </HueContextProvider>
    </App>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let status = 500;
  let message = "An unexpected error occurred.";
  if (isRouteErrorResponse(error)) {
    status = error.status;
    switch (error.status) {
      case 404:
        message = "Page Not Found";
        break;
    }
  } else {
    console.error(error);
  }

  return (
    <App>
      <div className="container prose py-8">
        <h1>{status}</h1>
        <p>{message}</p>
      </div>
    </App>
  );
}
