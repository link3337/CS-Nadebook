import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Maps from "../pages/Maps";
import MapDetail from "../pages/MapDetail";
import LineupNew from "../pages/LineupNew";
import LineupDetail from "../pages/LineupDetail";
import LineupEdit from "../pages/LineupEdit";
import Practice from "../pages/Practice";
import Settings from "../pages/Settings";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/maps" element={<Maps />} />
      <Route path="/maps/:mapId" element={<MapDetail />} />
      <Route path="/lineups/new" element={<LineupNew />} />
      <Route path="/lineups/:lineupId" element={<LineupDetail />} />
      <Route path="/lineups/:lineupId/edit" element={<LineupEdit />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRoutes;
