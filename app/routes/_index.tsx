import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hueAuth, isValidIPv4, sleep } from "@/lib/util";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, useActionData, useFetcher } from "@remix-run/react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Zapdos" },
    { name: "description", content: "Welcome to Zapdos!" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await hueAuth.parse(cookieHeader)) || {};

  await sleep(500);
  const formData = await request.formData();
  const url = formData.get("hueBridgeIP")?.toString() as string;

  if (!isValidIPv4(url)) {
    return { error: "Invalid IP address" };
  }

  const username = formData.get("hueBridgeToken");

  try {
    const hue_group_api_url = `http://${url}/api/${username}`;
    const response = await fetch(`${hue_group_api_url}/groups`);

    cookie.url = hue_group_api_url;

    if (response.ok) {
      return redirect("/rooms", {
        headers: { "Set-Cookie": await hueAuth.serialize(cookie) },
      });
    }
    return json({
      error: "Server responed with an error.",
    });
  } catch (error) {
    if (typeof error === "string") {
      return json({ error: error });
    }
    if (error instanceof Error) {
      return json({ error: error.message });
    }
  }
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();
  const [ip, setIP] = useState("");
  const [token, setToken] = useState("");

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container grid items-center justify-center gap-8 px-4 md:px-6">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Welcome to Zapdos!
          </h1>
          <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Enter the URL of your Hue bridge and test the connection to proceed
            to the next step.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md space-y-4">
          <fetcher.Form className="grid gap-4" method="post">
            <div>
              <Label htmlFor="hueBridgeIP">Hue Bridge IP</Label>
              <Input
                id="hueBridgeIP"
                name="hueBridgeIP"
                placeholder="127.0.0.1"
                required
                type="text"
                value={ip}
                onChange={(e) => setIP(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hueBridgeToken">Hue Bridge User Token</Label>
              <Input
                id="hueBridgeToken"
                name="hueBridgeToken"
                required
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={fetcher.state === "submitting"}
                id="connectButton"
                type="submit"
              >
                {fetcher.state === "submitting" ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </fetcher.Form>
        </div>
        {actionData && (
          <div className="mx-auto max-w-[800px] md:text-lg/relaxed lg:text-lg/relaxed">
            <p className="text-red-500 dark:text-red-500">
              {`Connection failed: ${actionData.error}`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
