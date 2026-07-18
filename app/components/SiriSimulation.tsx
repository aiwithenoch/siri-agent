"use client";

import { useEffect, useState } from "react";
import {
  siGmail,
  siGooglecalendar,
  siGoogledrive,
  siMongodb,
  siNotion,
  siWhatsapp,
  siZoom,
  type SimpleIcon,
} from "simple-icons";

type BrandKey = "gmail" | "calendar" | "whatsapp" | "notion" | "drive" | "zoom" | "mongodb";

const brands: Record<BrandKey, SimpleIcon> = {
  gmail: siGmail,
  calendar: siGooglecalendar,
  whatsapp: siWhatsapp,
  notion: siNotion,
  drive: siGoogledrive,
  zoom: siZoom,
  mongodb: siMongodb,
};

const scenarios = [
  {
    label: "Email",
    command: "Check my email and tell me what’s urgent.",
    result: "You have 3 urgent emails. Ama needs the proposal by noon. I drafted a reply for your approval.",
    action: "Scanning 14 unread messages",
    memory: "Prioritized known clients",
    brand: "gmail" as BrandKey,
  },
  {
    label: "Calendar",
    command: "Move my 3 PM meeting to tomorrow.",
    result: "Tomorrow at 3 PM is free. I moved the meeting and prepared an update for both attendees.",
    action: "Checking attendee availability",
    memory: "Used your Accra timezone",
    brand: "calendar" as BrandKey,
  },
  {
    label: "WhatsApp",
    command: "Tell Kojo our class starts next week.",
    result: "I found Kojo in your student contacts. The message is ready—say “send it” to confirm.",
    action: "Finding the correct Kojo",
    memory: "Matched your student directory",
    brand: "whatsapp" as BrandKey,
  },
];

const phaseDurations = [1700, 1200, 1200, 1200, 4200];

export function BrandLogo({ brand, showName = true }: { brand: BrandKey; showName?: boolean }) {
  const icon = brands[brand];
  return (
    <span className={`real-brand real-brand-${brand}`} title={icon.title}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={icon.path} />
      </svg>
      {showName && <span>{icon.title}</span>}
    </span>
  );
}

export function BrandStrip() {
  const visible: BrandKey[] = ["gmail", "calendar", "zoom", "whatsapp", "notion", "drive"];
  return (
    <div className="brand-strip-logos">
      {visible.map((brand) => <BrandLogo key={brand} brand={brand} />)}
      <span className="more-tools">+ 250 more</span>
    </div>
  );
}

export function SiriSimulation() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const scenario = scenarios[scenarioIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (phase < 4) {
        setPhase((current) => current + 1);
      } else {
        setScenarioIndex((current) => (current + 1) % scenarios.length);
        setPhase(0);
      }
    }, phaseDurations[phase]);

    return () => window.clearTimeout(timer);
  }, [phase, scenarioIndex]);

  function chooseScenario(index: number) {
    setScenarioIndex(index);
    setPhase(0);
  }

  return (
    <div className="interactive-demo">
      <div className="demo-tabs" aria-label="Choose a Siri example">
        {scenarios.map((item, index) => (
          <button
            className={index === scenarioIndex ? "active" : ""}
            key={item.label}
            onClick={() => chooseScenario(index)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="phone">
        <div className="phone-top"><span>9:41</span><i /><span>●●●</span></div>
        <div className={`siri-glow phase-${phase}`}>
          <span className="wave"><i /><i /><i /><i /><i /></span>
        </div>
        <p className="siri-label">SIRI · ASK MY AGENT</p>

        <div className={`speech user-speech ${phase >= 0 ? "visible" : ""}`}>
          <span>You said</span>
          “{scenario.command}”
        </div>

        <div className="agent-log" aria-live="polite">
          <div className={phase >= 1 ? "complete" : "active"}>
            <i>{phase > 1 ? "✓" : "✦"}</i><span><small>REASONING</small>Understanding your request</span>
          </div>
          <div className={phase >= 2 ? "complete" : phase === 1 ? "active" : "waiting"}>
            <i>{phase > 2 ? "✓" : "↗"}</i><span><small>COMPOSIO ACTION</small>{scenario.action}</span>
            <BrandLogo brand={scenario.brand} showName={false} />
          </div>
          <div className={phase >= 3 ? "complete" : phase === 2 ? "active" : "waiting"}>
            <i>{phase > 3 ? "✓" : "◆"}</i><span><small>MONGODB MEMORY</small>{scenario.memory}</span>
            <BrandLogo brand="mongodb" showName={false} />
          </div>
        </div>

        <div className={`speech agent-speech ${phase >= 4 ? "visible" : ""}`}>
          <span>Your agent</span>
          {scenario.result}
        </div>
        <div className="phone-home" />
      </div>

      <div className="simulation-status">
        <span className="live-dot" /> LIVE SIMULATION
        <span>{phase === 0 ? "Listening" : phase === 1 ? "Reasoning" : phase < 4 ? "Working" : "Complete"}</span>
      </div>
    </div>
  );
}
