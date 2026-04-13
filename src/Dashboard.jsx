import { useState, useEffect } from "react";
import { supabase } from "./Supabase";

const NAV = ["Band", "Calendar", "Map", "Add"];

function getBadge(birthday) {
  if (!birthday) return { label: "—", color: "rgba(200,160,80,0.3)" };
  const today = new Date();
  const bday = new Date(birthday);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const days = Math.round((next - today) / (1000 * 60 * 60 * 24));
  if (days === 0) return { label: "TODAY 🔥", color: "#e8c87a" };
  if (days <= 5) return { label: `${days}d away`, color: "#e8a050" };
  if (days <= 21) return { label: `${days}d away`, color: "rgba(200,160,80,0.7)" };
  return { label: `${days}d`, color: "rgba(200,160,80,0.35)" };
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(200,160,80,0.25)",
  borderRadius: 3,
  padding: "0.75rem 1rem",
  color: "#e8d5a0",
  fontSize: "0.95rem",
  fontFamily: "Georgia, serif",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle = {
  fontSize: "0.7rem",
  color: "rgba(200,160,80,0.5)",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "0.4rem",
};

const emptyForm = {
  name: "", birthday: "", city: "", phone: "", fun_fact: "", favorite_drink: "",
};

export default function Dashboard() {
  const [tab, setTab] = useState("Band");
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingFriend, setEditingFriend] = useState(null);

  useEffect(() => { fetchFriends(); }, []);

  async function fetchFriends() {
    setLoading(true);
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .order("name", { ascending: true });
    if (!error) setFriends(data || []);
    setLoading(false);
  }

  async function handleAddFriend(e) {
    e.preventDefault();
    if (!form.name || !form.birthday) return;
    setSaving(true);
    const { error } = await supabase.from("Users").insert([{
      name: form.name,
      birthday: form.birthday,
      city: form.city,
      phone: form.phone,
      fun_fact: form.fun_fact,
      favorite_drink: form.favorite_drink,
    }]);
    setSaving(false);
    if (!error) {
      setSuccess(true);
      setForm(emptyForm);
      fetchFriends();
      setTimeout(() => { setSuccess(false); setTab("Band"); }, 1500);
    }
  }

  async function handleEditFriend(e) {
    e.preventDefault();
    if (!form.name || !form.birthday) return;
    setSaving(true);
    const { error } = await supabase
      .from("Users")
      .update({
        name: form.name,
        birthday: form.birthday,
        city: form.city,
        phone: form.phone,
        fun_fact: form.fun_fact,
        favorite_drink: form.favorite_drink,
      })
      .eq("id", editingFriend.id);
    setSaving(false);
    if (!error) {
      setSuccess(true);
      setEditingFriend(null);
      setForm(emptyForm);
      fetchFriends();
      setTimeout(() => { setSuccess(false); setTab("Band"); }, 1500);
    }
  }

  async function handleDeleteFriend(friend) {
    if (!window.confirm(`Remove ${friend.name} from your band?`)) return;
    await supabase.from("Users").delete().eq("id", friend.id);
    fetchFriends();
  }

  function startEdit(friend) {
    setEditingFriend(friend);
    setForm({
      name: friend.name || "",
      birthday: friend.birthday || "",
      city: friend.city || "",
      phone: friend.phone || "",
      fun_fact: friend.fun_fact || "",
      favorite_drink: friend.favorite_drink || "",
    });
    setTab("Add");
  }

  function cancelEdit() {
    setEditingFriend(null);
    setForm(emptyForm);
    setTab("Band");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const sorted = [...friends].sort((a, b) => {
    const getNext = (bd) => {
      if (!bd) return 999;
      const today = new Date();
      const d = new Date(bd);
      const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return Math.round((next - today) / (1000 * 60 * 60 * 24));
    };
    return getNext(a.birthday) - getNext(b.birthday);
  });

  return (
    <div style={{
      background: "#0d0a04", minHeight: "100vh",
      fontFamily: "Georgia, serif", color: "#e8c87a",
      display: "flex", flexDirection: "column",
      maxWidth: 680, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ padding: "1.5rem 1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 400, letterSpacing: "0.06em" }}>Dunbar's Band</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "rgba(200,160,80,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {friends.length} in your band
          </p>
        </div>
        <button onClick={handleSignOut} style={{
          background: "none", border: "1px solid rgba(200,160,80,0.2)",
          color: "rgba(200,160,80,0.4)", padding: "6px 12px", fontSize: "0.7rem",
          letterSpacing: "0.1em", cursor: "pointer", fontFamily: "Georgia, serif", borderRadius: 2,
        }}>sign out</button>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", padding: "1.2rem 1.5rem 0", borderBottom: "1px solid rgba(200,160,80,0.12)" }}>
        {NAV.map(t => (
          <button key={t} onClick={() => { setTab(t); if (t !== "Add") { setEditingFriend(null); setForm(emptyForm); }}} style={{
            background: "none", border: "none",
            borderBottom: tab === t ? "2px solid #e8c87a" : "2px solid transparent",
            color: tab === t ? "#e8c87a" : "rgba(200,160,80,0.35)",
            padding: "0 1.2rem 0.75rem", fontSize: "0.8rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s",
          }}>{t}</button>
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
            {loading && <p style={{ color: "rgba(200,160,80,0.3)", fontSize: "0.85rem" }}>Loading your band...</p>}
            {!loading && sorted.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: "3rem" }}>
                <p style={{ color: "rgba(200,160,80,0.3)", fontSize: "0.9rem", lineHeight: 1.8 }}>
                  Your band is empty.<br />
                  <span onClick={() => setTab("Add")} style={{ color: "#e8c87a", cursor: "pointer", textDecoration: "underline" }}>
                    Add your first friend →
                  </span>
                </p>
              </div>
            )}
            {sorted.map(f => {
              const badge = getBadge(f.birthday);
              return (
                <div key={f.id} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "1rem 0", borderBottom: "1px solid rgba(200,160,80,0.08)",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "rgba(200,160,80,0.12)", border: "1px solid rgba(200,160,80,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", flexShrink: 0,
                  }}>{getInitials(f.name)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "0.95rem" }}>{f.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "rgba(200,160,80,0.4)" }}>
                      {f.city || "Location unknown"}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: badge.color, letterSpacing: "0.08em", flexShrink: 0 }}>
                    {badge.label}
                  </span>
                  <button onClick={() => startEdit(f)} style={{
                    background: "none", border: "1px solid rgba(200,160,80,0.2)",
                    color: "rgba(200,160,80,0.4)", padding: "4px 10px",
                    fontSize: "0.65rem", letterSpacing: "0.1em",
                    cursor: "pointer", fontFamily: "Georgia, serif", borderRadius: 2, flexShrink: 0,
                  }}>edit</button>
                  <button onClick={() => handleDeleteFriend(f)} style={{
                    background: "none", border: "1px solid rgba(200,80,80,0.2)",
                    color: "rgba(200,80,80,0.4)", padding: "4px 10px",
                    fontSize: "0.65rem", letterSpacing: "0.1em",
                    cursor: "pointer", fontFamily: "Georgia, serif", borderRadius: 2, flexShrink: 0,
                  }}>✕</button>
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

        {/* ADD / EDIT TAB */}
        {tab === "Add" && (
          <div style={{ maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", color: "rgba(200,160,80,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
                {editingFriend ? `Editing ${editingFriend.name}` : "Add to your band"}
              </p>
              {editingFriend && (
                <button onClick={cancelEdit} style={{
                  background: "none", border: "none", color: "rgba(200,160,80,0.4)",
                  fontSize: "0.75rem", cursor: "pointer", fontFamily: "Georgia, serif",
                }}>← cancel</button>
              )}
            </div>

            {success ? (
              <div style={{ textAlign: "center", paddingTop: "2rem" }}>
                <p style={{ fontSize: "2rem" }}>🔥</p>
                <p style={{ color: "#e8c87a", fontSize: "1rem" }}>
                  {editingFriend ? "Updated!" : "Added to your band!"}
                </p>
              </div>
            ) : (
              <form onSubmit={editingFriend ? handleEditFriend : handleAddFriend} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input style={inputStyle}
                    placeholder="Jake Morrison"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Birthday *</label>
                  <input style={inputStyle} type="date"
                    value={form.birthday}
                    onChange={e => setForm({ ...form, birthday: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} placeholder="New York"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} placeholder="+1 555 000 0000"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Favorite drink</label>
                  <input style={inputStyle} placeholder="Tequila soda"
                    value={form.favorite_drink}
                    onChange={e => setForm({ ...form, favorite_drink: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fun fact</label>
                  <input style={inputStyle} placeholder="Can juggle 4 balls"
                    value={form.fun_fact}
                    onChange={e => setForm({ ...form, fun_fact: e.target.value })}
                  />
                </div>
                <button type="submit" disabled={saving} style={{
                  background: saving ? "rgba(200,160,80,0.1)" : "rgba(200,160,80,0.18)",
                  border: "1px solid rgba(200,160,80,0.45)", borderRadius: 3,
                  padding: "0.9rem", color: "#e8c87a", fontSize: "0.8rem",
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  fontFamily: "Georgia, serif", cursor: saving ? "not-allowed" : "pointer",
                  marginTop: "0.5rem",
                }}>
                  {saving ? "Saving..." : editingFriend ? "Save changes →" : "Add to Band →"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
