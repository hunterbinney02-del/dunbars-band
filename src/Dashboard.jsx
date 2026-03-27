import { useState } from "react";
import { supabase } from "./Supabase";

const NAV = ["Band", "Calendar", "Map", "Add"];

const sampleFriends = [
  { id: 1, name: "Jake Morrison", city: "New York", birthday: "1995-03-15", daysUntil: 2 },
  { id: 2, name: "Sara Chen", city: "San Francisco", birthday: "1996-06-22", daysUntil: 18 },
  { id: 3, name: "Mike Torres", city: "Austin", birthday: "1994-07-04", daysUntil: 30 },
  { id: 4, name: "Ally Park", city: "Chicago", birthday: "1997-09-11", daysUntil: 78 },
  { id: 5, name: "Tom Bradley", city: "London", birthday: "1995-11-30", daysUntil: 128 },
];

function getBadge(days) {
  if (days === 0) return { label: "TODAY 🔥", color: "#e8c87a" };
  if (days <= 5) return { label: `${days}d away`, color: "#e8a050" };
  if (days <= 21) return { label: `${days}d away`, color: "rgba(200,160,80,0.7)" };
  return { label: `${days}d`, color: "rgba(200,160,80,0.35)" };
}

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

export default function Dashboard() {
  const [tab, setTab] = useState("Band");

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div style={{
      background: "#0d0a04",
      minHeight: "100vh",
      fontFamily: "Georgia, serif",
      color: "#e8c87a",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Header */}
      <div style={{
        padding: "1.5rem 1.5rem 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 400, letterSpacing: "0.06em" }}>
            Dunbar's Band
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "rgba(200,160,80,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {sampleFriends.length} in your band
          </p>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            background: "none",
            border: "1px solid rgba(200,160,80,0.2)",
            color: "rgba(200,160,80,0.4)",
            padding: "6px 12px",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            cursor: "pointer",
            fontFamily: "Georgia, serif",
            borderRadius: 2,
          }}
        >
          sign out
        </button>
      </div>

      {/* Nav tabs */}
      <div style={{
        display: "flex",
        gap: "0",
        padding: "1.2rem 1.5rem 0",
        borderBottom: "1px solid rgba(200,160,80,0.12)",
      }}>
        {NAV.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2px solid #e8c87a" : "2px solid transparent",
              color: tab === t ? "#e8c87a" : "rgba(200,160,80,0.35)",
              padding: "0 1.2rem 0.75rem",
              fontSize: "0.8rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "Georgia, serif",
              transition: "all 0.2s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>

        {/* BAND TAB */}
        {tab === "Band" && (
          <div>
            <p style={{ fontSize: "0.75rem", color: "rgba(200,160,80,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Upcoming birthdays
            </p>
            {sampleFriends.map(f => {
              const badge = getBadge(f.daysUntil);
              return (
                <div key={f.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid rgba(200,160,80,0.08)",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "rgba(200,160,80,0.12)",
                    border: "1px solid rgba(200,160,80,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", letterSpacing: "0.05em", flexShrink: 0,
                  }}>
                    {getInitials(f.name)}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "0.95rem" }}>{f.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "rgba(200,160,80,0.4)" }}>
                      {f.city}
                    </p>
                  </div>
                  {/* Badge */}
                  <span style={{
                    fontSize: "0.7rem",
                    color: badge.color,
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab === "Calendar" && (
          <div style={{ textAlign: "center", paddingTop: "3rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>📅</p>
            <p style={{ color: "rgba(200,160,80,0.5)", letterSpacing: "0.1em" }}>Calendar view coming soon.</p>
          </div>
        )}

        {/* MAP TAB */}
        {tab === "Map" && (
          <div style={{ textAlign: "center", paddingTop: "3rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>🗺️</p>
            <p style={{ color: "rgba(200,160,80,0.5)", letterSpacing: "0.1em" }}>Map view coming soon.</p>
          </div>
        )}

        {/* ADD TAB */}
        {tab === "Add" && (
          <div style={{ textAlign: "center", paddingTop: "3rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>＋</p>
            <p style={{ color: "rgba(200,160,80,0.5)", letterSpacing: "0.1em" }}>Add friend coming soon.</p>
          </div>
        )}

      </div>
    </div>
  );
}
