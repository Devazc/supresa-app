<a href="http://supresa.site">
  <img alt="Supresa – Upscale your Images to Super-Resolution" src="http://supresa.site/api/og">
  <h1 align="center">Supresa</h1>
</a>

<p align="center">
  Upscale your Images to Super-Resolution
</p>

<p align="center">
  <a href="https://twitter.com/zcdeva">
    <img src="https://img.shields.io/twitter/follow/zcdeva?style=flat&label=zcdeva&logo=twitter&color=0bf&logoColor=fff" alt="Devazc Twitter follower count" />
  </a>
  <a href="https://github.com/Devazc/supresa.app">
    <img src="https://img.shields.io/github/stars/Devazc/supresa.app?label=Devazc%2Fsupresa-app" alt="Supresa repo star count" />
  </a>
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#author"><strong>Author</strong></a>
</p>
<br/>

## Introduction

Supresa is an app for you to Upscale your Images to Super-Resolution with Artificial Intelligence. 100% free and privacy friendly.

## Features

### REAL-ESRGAN
- Real-ESRGAN with optional face correction and adjustable upscale

### Run time and cost
- Predictions run on Nvidia T4 GPU hardware. Predictions typically complete within 8 seconds.

### Readme
- This is the latest version of Real-ESRGAN with GFPGAN and outscale options exposed.
- Store & retrieve photos from [Cloudflare R2](https://www.cloudflare.com/lp/pg-r2/) using Workers
- Photos auto-delete after 24 hours (via [Upstash](https://upstash.com) qStash)

## Deploy Your Own

You can deploy this template to Vercel with the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-title=Extrapolate%20%E2%80%93%C2%A0See%20how%20well%20you%20age%20with%20AI&demo-description=Age%20transformation%20AI%20app%20powered%20by%20Next.js%2C%20Replicate%2C%20Upstash%2C%20and%20Cloudflare%20R2%20%2B%20Workers.&demo-url=https%3A%2F%2Fextrapolate.app%2F&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4B2RUQ7DTvPgpf3Ra9jSC2%2Fda2571b055081a670ac9649d3ac0ac7a%2FCleanShot_2023-01-20_at_12.04.08.png&project-name=Extrapolate%20%E2%80%93%C2%A0See%20how%20well%20you%20age%20with%20AI&repository-name=extrapolate&repository-url=https%3A%2F%2Fgithub.com%2Fsteven-tey%2Fextrapolate&from=templates&integration-ids=oac_V3R1GIpkoJorr6fqyiwdhl17&env=REPLICATE_API_TOKEN%2CREPLICATE_WEBHOOK_TOKEN%2CCLOUDFLARE_WORKER_SECRET%2CPOSTMARK_TOKEN&envDescription=How%20to%20get%20these%20env%20variables%3A%20&envLink=https%3A%2F%2Fgithub.com%2Fsteven-tey%2Fextrapolate%2Fblob%2Fmain%2F.env.example)

Note that you'll need to:

- Set up a [ReplicateHQ](https://replicate.com) account to get the `REPLICATE_API_TOKEN` env var.
- Set up an [Upstash](https://upstash.com) account to get the Upstash Redis and QStash env vars.
- Create a [Cloudflare R2 instance](https://www.cloudflare.com/lp/pg-r2/) and set up a [Cloudflare Worker](https://workers.cloudflare.com/) to handle uploads & reads (instructions below).

### Cloudflare R2 setup instructions

1. Go to Cloudflare and create an [R2 bucket](https://www.cloudflare.com/lp/pg-r2/).
2. Create a [Cloudflare Worker](https://workers.cloudflare.com/) using the code snippet below.
3. Bind your worker to your R2 instance under **Settings > R2 Bucket Bindings**.
4. For extra security, set an `AUTH_KEY_SECRET` variable under **Settings > Environment Variables** (you can generate a random secret [here](https://generate-secret.vercel.app/)).
5. Replace all instances of `images.supresa.workers.dev` in the codebase with your Cloudflare Worker endpoint.

<details>
<summary>Cloudflare Worker Code</summary>

```ts
// Check requests for a pre-shared secret
const hasValidHeader = (request, env) => {
  return request.headers.get("X-CF-Secret") === env.AUTH_KEY_SECRET;
};

function authorizeRequest(request, env, key) {
  switch (request.method) {
    case "PUT":
    case "DELETE":
      return hasValidHeader(request, env);
    case "GET":
      return true;
    default:
      return false;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!authorizeRequest(request, env, key)) {
      return new Response("Forbidden", { status: 403 });
    }

    switch (request.method) {
      case "PUT":
        await env.MY_BUCKET.put(key, request.body);
        return new Response(`Put ${key} successfully!`);
      case "GET":
        const object = await env.MY_BUCKET.get(key);

        if (object === null) {
          return new Response("Object Not Found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);

        return new Response(object.body, {
          headers,
        });
      case "DELETE":
        await env.MY_BUCKET.delete(key);
        return new Response("Deleted!");

      default:
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            Allow: "PUT, GET, DELETE",
          },
        });
    }
  },
};
```

</details>

## Author

- Deva Chandragiri ([@Devazc](https://twitter.com/zcdeva))

## Source

- Steven Tey ([@steventey](https://twitter.com/steventey))
