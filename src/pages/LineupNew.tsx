import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLineupsStore } from "../store/lineups";

export const LineupNew: React.FC = () => {
  const [name, setName] = useState("");
  const [map, setMap] = useState("");
  const addLineup = useLineupsStore((s) => s.addLineup);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = addLineup({ name, map });
    navigate(`/lineups/${l.id}/edit`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>New Lineup</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Map
          <input value={map} onChange={(e) => setMap(e.target.value)} />
        </label>
        <div>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
};

export default LineupNew;
