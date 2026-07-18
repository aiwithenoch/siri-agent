import type { Metadata } from "next";
import { ConnectSiri } from "./components/ConnectSiri";
import { BrandStrip, SiriSimulation } from "./components/SiriSimulation";

export const metadata: Metadata = {
  title: "Siri Agent — Turn Siri into your personal AI agent",
  description:
    "Connect the Siri already on your iPhone to an AI agent that can reason, remember, and take action across your apps.",
};

const tools = ["Gmail", "Calendar", "WhatsApp", "Notion", "Slack", "Drive"];

const useCases = [
  {
    number: "01",
    command: "Hey Siri, check my important emails.",
    result: "Your agent reads, prioritizes, and summarizes what needs your attention.",
  },
  {
    number: "02",
    command: "Hey Siri, move my 3 PM meeting.",
    result: "Your agent checks availability, updates the event, and notifies attendees.",
  },
  {
    number: "03",
    command: "Hey Siri, remind Kojo about his class.",
    result: "Your agent remembers the context and sends through the right connected tool.",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Siri Agent home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>Siri Agent</span>
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#actions">What it can do</a>
          <a className="nav-cta" href="#connect">Connect Siri</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Built for the Siri already in your pocket</div>
          <h1>Don&apos;t replace Siri.<br /><em>Make it powerful.</em></h1>
          <p className="hero-lede">
            Connect your real iPhone Siri to an AI agent that can reason,
            remember, and take action across your apps.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#connect">Connect your Siri <span>↗</span></a>
            <a className="button button-ghost" href="#demo">See how it works <span>↓</span></a>
          </div>
          <div className="trust-line">
            <span className="avatar-stack"><b>E</b><b>K</b><b>A</b></span>
            <span>One shortcut. Your apps. Your memory.</span>
          </div>
        </div>

        <div className="hero-visual" id="demo" aria-label="Interactive Siri conversation">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <SiriSimulation />
        </div>
      </section>

      <section className="tool-strip" aria-label="Supported tools">
        <div className="shell tool-row">
          <p>ONE VOICE. ALL YOUR TOOLS.</p>
          <BrandStrip />
        </div>
      </section>

      <section className="section shell" id="how">
        <div className="section-heading">
          <p className="kicker">HOW IT WORKS</p>
          <h2>Your voice starts it.<br />Your agent handles the rest.</h2>
          <p>No new assistant to learn. No complicated dashboard. Speak to Siri the way you already do.</p>
        </div>
        <div className="steps">
          <article>
            <span className="step-icon">⌁</span><b>01</b>
            <h3>Speak to your iPhone</h3>
            <p>Say “Hey Siri, ask my agent…” followed by anything you need done.</p>
          </article>
          <article>
            <span className="step-icon">✦</span><b>02</b>
            <h3>The agent reasons</h3>
            <p>Your request reaches a secure backend where the AI understands intent and plans the task.</p>
          </article>
          <article>
            <span className="step-icon">↗</span><b>03</b>
            <h3>Your tools take action</h3>
            <p>Composio connects the agent to your approved apps, then Siri speaks the result back.</p>
          </article>
        </div>
      </section>

      <section className="actions-section" id="actions">
        <div className="shell">
          <div className="section-heading light">
            <p className="kicker">REAL WORK. JUST BY ASKING.</p>
            <h2>Less tapping.<br />More getting things done.</h2>
          </div>
          <div className="use-cases">
            {useCases.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <blockquote>{item.command}</blockquote>
                <p>{item.result}</p>
                <i>→</i>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell architecture">
        <div className="architecture-copy">
          <p className="kicker">THE SYSTEM UNDER THE VOICE</p>
          <h2>Smart enough to reason.<br />Personal enough to remember.</h2>
          <p>
            Every request passes through a secure orchestration layer. The reasoning model decides what to do,
            Composio safely calls the tools you approved, and MongoDB gives your agent lasting context.
          </p>
          <ul>
            <li><span>✓</span> You choose which apps are connected</li>
            <li><span>✓</span> Sensitive credentials stay off your phone shortcut</li>
            <li><span>✓</span> Memory can be reviewed and deleted</li>
          </ul>
        </div>
        <div className="flow-card" aria-label="Siri Agent system architecture">
          <div className="flow-node primary"><small>YOUR PHONE</small><b>Siri + Shortcut</b></div>
          <span className="flow-arrow">↓</span>
          <div className="flow-node brain"><small>SECURE BACKEND</small><b>Reasoning Agent</b></div>
          <div className="flow-split"><span>↙</span><span>↘</span></div>
          <div className="flow-bottom">
            <div className="flow-node"><small>MEMORY</small><b>MongoDB</b></div>
            <div className="flow-node"><small>ACTIONS</small><b>Composio</b></div>
          </div>
          <div className="flow-tools">Gmail · Calendar · WhatsApp · Notion · 250+ tools</div>
        </div>
      </section>

      <section className="connect-section" id="connect">
        <div className="shell connect-layout">
          <div className="connect-copy">
            <p className="kicker">WORKING MVP</p>
            <h2>Connect your real Siri.<br />Talk to your live agent.</h2>
            <p>
              Create a private endpoint, test the agent instantly, and wire it into the Shortcuts app already on your iPhone.
              Gemini answers in real time while MongoDB remembers the conversation.
            </p>
            <ul>
              <li><span>01</span> Create your private agent</li>
              <li><span>02</span> Test the live conversation</li>
              <li><span>03</span> Add the webhook to Shortcuts</li>
            </ul>
          </div>
          <ConnectSiri />
        </div>
      </section>

      <section className="cta-section" id="early-access">
        <div className="cta-orb" />
        <div className="shell cta-inner">
          <p className="kicker">YOUR SIRI. UPGRADED.</p>
          <h2>Your AI agent is<br />one phrase away.</h2>
          <p>Create your private agent now and connect it to Apple Shortcuts in a few minutes.</p>
          <a className="button button-light" href="#connect">Connect Siri now <span>↗</span></a>
          <small>Works with the Siri already on your iPhone.</small>
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top"><span className="brand-mark"><i /><i /><i /></span><span>Siri Agent</span></a>
        <p>Give your voice the power to act.</p>
        <span>© 2026 Siri Agent</span>
      </footer>
    </main>
  );
}
