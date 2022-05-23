import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import {Home} from '../pages/Home';
import {Link} from "../pages/Link";

export const AppRouter = () => (
  <Router> 
    <Routes>
      <Route
        path={'/'}
        element={<Home />}
      />
      <Route
        path={'/:id'}
        element={<Link />}
      />
    </Routes>
  </Router>
)