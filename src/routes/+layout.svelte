<script lang="ts">
  import { onNavigate } from "$app/navigation";
  import "./layout.css";

  let { children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="alternate" type="application/rss+xml" title="RSS" href="https://steve.photo/rss.xml" />
  <meta name="description" content="Photography by Steve" />
  <meta property="og:site_name" content="steve.photo" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="steve.photo" />
  <meta property="og:url" content="https://steve.photo" />
  <meta property="og:description" content="Photography by Steve" />
  <meta property="og:image" content="https://steve.photo/og.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="steve.photo" />
  <meta name="twitter:description" content="Photography by Steve" />
  <meta name="twitter:image" content="https://steve.photo/og.png" />
  <link rel="canonical" href="https://steve.photo" />
</svelte:head>
{@render children()}
