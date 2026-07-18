"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SetupState = {
  name: string;
  email: string;
  billingStatus: string;
  billingConfigured: boolean;
  webhookUrl: string;
  shortcutInstallUrl: string;
  connectionsConfigured: boolean;
};

const apps = [
  { slug: "gmail", name: "Gmail", detail: "Read, search and send email" },
  { slug: "googlecalendar", name: "Calendar", detail: "Check and manage your schedule" },
  { slug: "googledrive", name: "Drive", detail: "Find your files and documents" },
];

export function SetupAgent({ token }: { token: string }) {
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/agents/status?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not load this setup.");
        if (!cancelled) setSetup(data);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load setup.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!setup?.connectionsConfigured) return;
    void fetch(`/api/connections?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((response) => response.json()).then((data) => setConnections(data.connections ?? {})).catch(() => undefined);
  }, [setup?.connectionsConfigured, token]);

  async function startTrial() {
    setCheckoutLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Checkout could not start.");
      window.location.href = data.checkoutUrl;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout could not start.");
      setCheckoutLoading(false);
    }
  }

  async function copyLink() {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.webhookUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function connectApp(toolkit: string) {
    setConnecting(toolkit);
    setError("");
    try {
      const response = await fetch("/api/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, toolkit }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not connect this app.");
      window.location.assign(data.redirectUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not connect this app.");
      setConnecting("");
    }
  }

  if (loading) return <main className="setup-page"><div className="setup-shell"><p>Loading your Agent…</p></div></main>;
  if (error && !setup) return <main className="setup-page"><div className="setup-shell"><h1>Setup link unavailable</h1><p>{error}</p></div></main>;
  if (!setup) return null;

  const hasAccess = setup.billingStatus === "active" || !setup.billingConfigured;

  return (
    <main className="setup-page">
      <div className="setup-shell">
        <Link className="brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>Siri Agent</span></Link>
        <span className="connect-status"><i /> PRIVATE SETUP</span>
        <h1>{setup.name}, let&apos;s put Agent on your iPhone.</h1>
        <p className="setup-lede">No coding. No JSON. Copy one private link, open the ready-made Shortcut, paste, and save.</p>

        {!hasAccess && (
          <section className="trial-card">
            <small>1 DAY FREE · CARD REQUIRED</small>
            <h2>Start your free day</h2>
            <p>$0 today, then $5/month. Cancel before the trial ends and you won&apos;t be charged.</p>
            <button className="button button-primary" disabled={checkoutLoading || !setup.billingConfigured} onClick={startTrial}>
              {checkoutLoading ? "Opening secure checkout…" : setup.billingConfigured ? "Start free trial" : "Payments connecting…"}
            </button>
          </section>
        )}

        {hasAccess && (
          <section className="install-card connected-apps-card">
            <div className="install-step"><b>1</b><div><h2>Connect what Agent can use</h2><p>Tap an app and sign in normally. No API keys or technical setup.</p></div></div>
            <div className="app-connect-list">
              {apps.map((app) => (
                <button key={app.slug} className="app-connect-row" disabled={connecting === app.slug || !setup.connectionsConfigured} onClick={() => connectApp(app.slug)}>
                  <span><strong>{app.name}</strong><small>{app.detail}</small></span>
                  <em>{connections[app.slug] ? "Connected ✓" : connecting === app.slug ? "Opening…" : setup.connectionsConfigured ? "Connect" : "Coming online"}</em>
                </button>
              ))}
            </div>
          </section>
        )}

        {hasAccess && (
          <section className="install-card">
            <div className="install-step"><b>2</b><div><h2>Copy your private link</h2><p>This safely connects only your Shortcut to your Agent.</p></div></div>
            <button className="button button-primary full-button" onClick={copyLink}>{copied ? "Copied ✓" : "Copy private link"}</button>
            <div className="install-step"><b>3</b><div><h2>Add Agent to Siri</h2><p>Paste the private link when Apple asks, then tap Add Shortcut.</p></div></div>
            <a className={`button button-dark full-button ${!setup.shortcutInstallUrl ? "is-disabled" : ""}`} href={setup.shortcutInstallUrl || undefined}>
              {setup.shortcutInstallUrl ? "Add Agent to Siri" : "Shortcut installer coming next"}
            </a>
            <div className="ready-phrase"><span>Then say</span><strong>“Hey Siri, Agent”</strong></div>
          </section>
        )}
        {error && <p className="connect-error">{error}</p>}
        <p className="privacy-note">Your card is handled securely by Dodo Payments. Siri Agent never sees or stores card details.</p>
      </div>
    </main>
  );
}
