"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SetupState = {
  name: string;
  email: string;
  billingStatus: string;
  billingConfigured: boolean;
  webhookUrl: string;
  privateKey: string;
  shortcutInstallUrl: string;
  connectionsConfigured: boolean;
  accessGranted: boolean;
  ownerAccess: boolean;
};

const apps = [
  { slug: "gmail", name: "Gmail", detail: "Read, search and send email", icon: "gmail" },
  { slug: "googlecalendar", name: "Calendar", detail: "Check and manage your schedule", icon: "googlecalendar" },
  { slug: "googledrive", name: "Drive", detail: "Find your files and documents", icon: "googledrive" },
  { slug: "slack", name: "Slack", detail: "Read channels and send messages", icon: "slack", iconUrl: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/slack-icon.svg" },
  { slug: "notion", name: "Notion", detail: "Search and update your workspace", icon: "notion" },
  { slug: "github", name: "GitHub", detail: "Work with repositories and issues", icon: "github" },
  { slug: "linear", name: "Linear", detail: "Manage projects and tasks", icon: "linear" },
  { slug: "zoom", name: "Zoom", detail: "Find and schedule meetings", icon: "zoom" },
  { slug: "hubspot", name: "HubSpot", detail: "Work with contacts and deals", icon: "hubspot" },
  { slug: "salesforce", name: "Salesforce", detail: "Access CRM records and activity", icon: "salesforce", iconUrl: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/salesforce.svg" },
  { slug: "trello", name: "Trello", detail: "Manage boards, lists and cards", icon: "trello" },
  { slug: "asana", name: "Asana", detail: "Check and update team tasks", icon: "asana" },
  { slug: "dropbox", name: "Dropbox", detail: "Find and manage cloud files", icon: "dropbox" },
  { slug: "discord", name: "Discord", detail: "Read and send server messages", icon: "discord" },
];

export function SetupAgent({ token }: { token: string }) {
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState("");
  const [appSearch, setAppSearch] = useState("");
  const [showAllApps, setShowAllApps] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/agents/status", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
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
    void fetch("/api/connections", { cache: "no-store", headers: { Authorization: `Bearer ${token}` } })
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

  async function installOnIPhone() {
    if (!setup) return;
    if (!setup.shortcutInstallUrl) {
      setError("The iPhone installer is being connected. Please try again shortly.");
      return;
    }
    setInstalling(true);
    setError("");
    await navigator.clipboard.writeText(setup.privateKey);
    setCopied(true);
    window.setTimeout(() => {
      window.location.assign(setup.shortcutInstallUrl);
    }, 450);
  }

  async function copyKeyAgain() {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.privateKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function connectApp(toolkit: string) {
    setConnecting(toolkit);
    setError("");
    try {
      const response = await fetch("/api/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, toolkit }) });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
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

  const hasAccess = setup.accessGranted;
  const matchingApps = apps.filter((app) => `${app.name} ${app.detail}`.toLowerCase().includes(appSearch.toLowerCase()));
  const visibleApps = appSearch || showAllApps ? matchingApps : matchingApps.slice(0, 3);

  return (
    <main className="setup-page">
      <div className="setup-shell">
        <Link className="brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>Siri Agent</span></Link>
        <span className="connect-status"><i /> PRIVATE SETUP</span>
        <h1>{setup.name}, let&apos;s put Agent on your iPhone.</h1>
        <p className="setup-lede">No coding and no settings. Tap one button, paste when Apple asks, then add the Shortcut.</p>
        {setup.ownerAccess && <p className="owner-pass">Owner pass active · no subscription required</p>}

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
            <div className="install-step"><b>1</b><div><h2>Your connections <small>Optional</small></h2><p>You do not have to connect everything now. Add or remove apps here anytime.</p></div></div>
            <input className="app-search" type="search" value={appSearch} onChange={(event) => setAppSearch(event.target.value)} placeholder="Search apps…" aria-label="Search connected apps" />
            <div className="app-connect-list">
              {visibleApps.map((app) => (
                <button key={app.slug} className="app-connect-row" disabled={connecting === app.slug || !setup.connectionsConfigured} onClick={() => connectApp(app.slug)}>
                  <span className="app-connect-identity"><i className="app-logo" style={{ backgroundImage: `url(${app.iconUrl ?? `https://cdn.simpleicons.org/${app.icon}`})` }} /><span><strong>{app.name}</strong><small>{app.detail}</small></span></span>
                  <em>{connections[app.slug] ? "Connected ✓" : connecting === app.slug ? "Opening…" : setup.connectionsConfigured ? "Connect" : "Coming online"}</em>
                </button>
              ))}
            </div>
            {!appSearch && <button className="show-apps-button" onClick={() => setShowAllApps((current) => !current)}>{showAllApps ? "Show fewer apps" : `Browse all ${apps.length} apps`}</button>}
          </section>
        )}

        {hasAccess && (
          <section className="install-card">
            <div className="install-step"><b>2</b><div><h2>Install Agent on your iPhone</h2><p>We copy your secure key automatically. When Apple opens, tap <strong>Paste</strong>, then <strong>Add Shortcut</strong>.</p></div></div>
            <button className="button button-dark full-button" disabled={installing || !setup.shortcutInstallUrl} onClick={installOnIPhone}>
              {installing ? "Opening Apple Shortcuts…" : setup.shortcutInstallUrl ? "Install Agent on iPhone" : "iPhone installer coming online"}
            </button>
            {copied && <p className="install-confirmation">Key copied ✓ Now tap Paste when Apple asks.</p>}
            <button className="show-apps-button" type="button" onClick={copyKeyAgain}>Copy key again</button>
            <div className="ready-phrase"><span>Then say</span><strong>“Hey Siri, Agent”</strong></div>
          </section>
        )}
        {error && <p className="connect-error">{error}</p>}
        <p className="privacy-note">Your card is handled securely by Dodo Payments. Siri Agent never sees or stores card details.</p>
      </div>
    </main>
  );
}
