"use client";

import { FormEvent, useState } from "react";

type AgentSetup = {
  name: string;
  email: string;
  webhookUrl: string;
  privateKey: string;
  setupUrl: string;
  phrase: string;
  dailyLimit: number;
};

export function ConnectSiri() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [setup, setSetup] = useState<AgentSetup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [testPrompt, setTestPrompt] = useState("");
  const [testAnswer, setTestAnswer] = useState("");
  const [testing, setTesting] = useState(false);

  async function createAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create your agent.");
      setSetup(data);
      window.location.href = data.setupUrl;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create your agent.");
    } finally {
      setLoading(false);
    }
  }

  async function copyWebhook() {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.privateKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function testAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!setup || !testPrompt.trim()) return;
    setTesting(true);
    setError("");
    setTestAnswer("");

    try {
      const response = await fetch(setup.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${setup.privateKey}` },
        body: JSON.stringify({ query: testPrompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Your agent could not answer.");
      setTestAnswer(data.answer);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your agent could not answer.");
    } finally {
      setTesting(false);
    }
  }

  if (!setup) {
    return (
      <div className="connect-card">
        <span className="connect-status"><i /> LIVE TEST</span>
        <h3>Create your Siri agent</h3>
        <p>Get your private Agent link, start a free day, and add the ready-made Shortcut to your iPhone.</p>
        <form className="connect-form" onSubmit={createAgent}>
          <label htmlFor="agent-name">What should your agent call you?</label>
          <div>
            <input
              id="agent-name"
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
              value={name}
            />
          </div>
          <label htmlFor="agent-email">Where should we send account and billing updates?</label>
          <input
            id="agent-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
          <button className="create-agent-button" disabled={loading} type="submit">{loading ? "Creating…" : "Create my Agent"}</button>
        </form>
        {error && <p className="connect-error">{error}</p>}
        <small>1 day free · Card required · Then $5/month · Cancel anytime</small>
      </div>
    );
  }

  return (
    <div className="setup-panel">
      <div className="setup-header">
        <span className="connect-status"><i /> AGENT ONLINE</span>
        <h3>{setup.name}&apos;s agent is ready.</h3>
        <p>Test it here, then use the one-tap iPhone installer on your private setup page.</p>
      </div>

      <form className="live-test" onSubmit={testAgent}>
        <label htmlFor="test-prompt">Talk to your live agent</label>
        <div>
          <input
            id="test-prompt"
            onChange={(event) => setTestPrompt(event.target.value)}
            placeholder="Ask me anything…"
            value={testPrompt}
          />
          <button disabled={testing} type="submit">{testing ? "Thinking…" : "Ask"}</button>
        </div>
        {testAnswer && <blockquote><span>✦</span>{testAnswer}</blockquote>}
      </form>

      <div className="shortcut-steps">
        <h4>Connect Apple Shortcuts</h4>
        <ol>
          <li><b>Tap the installer</b><span>Your private setup page copies the secure key and opens Apple Shortcuts for you.</span></li>
          <li><b>Paste and add</b><span>Tap Paste when Apple asks, then tap Add Shortcut.</span></li>
          <li><b>Talk naturally</b><span>Say “Hey Siri, {setup.phrase}”, then say what you need.</span></li>
        </ol>
      </div>

      <div className="webhook-box">
        <span>PRIVATE KEY — TREAT LIKE A PASSWORD</span>
        <code>{setup.privateKey}</code>
        <button onClick={copyWebhook} type="button">{copied ? "Copied ✓" : "Copy private key"}</button>
      </div>
      {error && <p className="connect-error">{error}</p>}
    </div>
  );
}
