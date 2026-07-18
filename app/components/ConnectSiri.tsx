"use client";

import { FormEvent, useState } from "react";

type AgentSetup = {
  name: string;
  webhookUrl: string;
  phrase: string;
  dailyLimit: number;
};

export function ConnectSiri() {
  const [name, setName] = useState("");
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
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create your agent.");
      setSetup(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create your agent.");
    } finally {
      setLoading(false);
    }
  }

  async function copyWebhook() {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.webhookUrl);
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
        headers: { "Content-Type": "application/json" },
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
        <p>Get a private webhook, test the live AI, then connect it to Apple Shortcuts.</p>
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
            <button disabled={loading} type="submit">{loading ? "Creating…" : "Create agent"}</button>
          </div>
        </form>
        {error && <p className="connect-error">{error}</p>}
        <small>No card required · 30 test conversations per day</small>
      </div>
    );
  }

  return (
    <div className="setup-panel">
      <div className="setup-header">
        <span className="connect-status"><i /> AGENT ONLINE</span>
        <h3>{setup.name}&apos;s agent is ready.</h3>
        <p>Test it here, then complete the six steps in Apple Shortcuts.</p>
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
          <li><b>Open Shortcuts</b><span>Create a shortcut named “{setup.phrase}”.</span></li>
          <li><b>Add “Dictate Text”</b><span>This captures your question after Siri launches it.</span></li>
          <li><b>Add “Get Contents of URL”</b><span>Set Method to POST and paste your private URL.</span></li>
          <li><b>Add JSON field</b><span>Set the request body field <code>query</code> to Dictated Text.</span></li>
          <li><b>Read the result</b><span>Add “Get Dictionary Value” and enter <code>answer</code>.</span></li>
          <li><b>Speak it</b><span>Add “Speak Text”, then say “Hey Siri, {setup.phrase}”.</span></li>
        </ol>
      </div>

      <div className="webhook-box">
        <span>PRIVATE WEBHOOK — TREAT LIKE A PASSWORD</span>
        <code>{setup.webhookUrl}</code>
        <button onClick={copyWebhook} type="button">{copied ? "Copied ✓" : "Copy webhook"}</button>
      </div>
      {error && <p className="connect-error">{error}</p>}
    </div>
  );
}
