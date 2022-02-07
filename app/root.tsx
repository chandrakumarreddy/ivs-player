import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useMatches,
} from "remix";
import type { MetaFunction } from "remix";
import globalStyles from "~/styles/global.css";
import { Fragment } from "react";

export const meta: MetaFunction = () => {
  return { title: "Remix Learn", description: "description" };
};

export const links = () => {
  return [{ rel: "stylesheet", href: globalStyles }];
};

export default function Root() {
  const { pathname } = useLocation();
  const matches = useMatches();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {matches
          .filter((match) => match.handle && match.handle.scripts)
          .map((match, index) => (
            <Fragment key={index}>{match.handle.scripts(match)}</Fragment>
          ))}
      </head>
      <body>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/player">Player</Link>
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {pathname !== "/player" && (
          <script
            src="https://player.live-video.net/1.1.2/amazon-ivs-player.min.js"
            defer
          />
        )}
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
