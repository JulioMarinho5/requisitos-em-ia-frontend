import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '../pages/AppHome';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};