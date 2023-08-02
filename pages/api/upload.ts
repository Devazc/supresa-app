import { NextRequest } from "next/server";
import { ratelimit, redis, setRandomKey } from "@/lib/upstash";
import Replicate from "replicate";

export const config = {
  runtime: "edge",
};

const replicate = new Replicate({
  // get your token from https://replicate.com/account
  auth: process.env.REPLICATE_API_TOKEN || "",
});

export default async function handler(req: NextRequest) {
  const { image } = await req.json();
  if (!image) {
    return new Response("Missing image", { status: 400 });
  }
  const { success } = await ratelimit.limit("upload");
  if (!success) {
    return new Response("Don't DDoS me pls 🥺", { status: 429 });
  }
  if (req.method === "POST") {
    const { key } = await setRandomKey();
    const domain =
      process.env.NODE_ENV === "development"
        ? "https://c14c-2600-1700-b5e4-b50-4dcb-f2e2-e081-ddbe.ngrok-free.app"
        : `https://${process.env.VERCEL_URL}`;

    await Promise.allSettled([
      fetch(`${process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER}/${key}`, {
        method: "PUT",
        headers: {
          "X-CF-Secret": process.env.CLOUDFLARE_WORKER_SECRET as string,
        },
        body: Uint8Array.from(atob(image.replace(/^data[^,]+,/, "")), (v) =>
          v.charCodeAt(0),
        ),
      }),
      replicate.predictions.create({
        version:
          "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image,
          target_age: "default",
        },
        webhook: `${domain}/api/images/${key}/webhook`,
        webhook_events_filter: ["completed"],
      }),
      fetch(
        `https://qstash.upstash.io/v1/publish/${domain}/api/images/${key}/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + process.env.QSTASH_TOKEN,
            "Upstash-Delay": "1d",
          },
        },
      ),
    ]).then((results) =>
      results.map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          return result.reason;
        }
      }),
    );

    return new Response(JSON.stringify({ key }));
  } else {
    return new Response("Method Not Allowed", { status: 405 });
  }
}
