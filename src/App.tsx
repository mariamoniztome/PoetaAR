/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import QRCodePage from './pages/QRCodePage';
import ARPage from './pages/ARPage';
import Scene1 from './scene1/Scene1';
import Scene2 from './scene2/Scene2';
import Scene3 from './scene3/Scene3';
import { ArrowLeft } from 'lucide-react';

function SceneWrapper() {
  const { sceneId } = useParams<{ sceneId: string }>();
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen relative">
      <button
        type="button"
        onClick={() => navigate('/ar')}
        className="fixed top-6 left-6 z-1000 p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto"
        aria-label="Voltar para a câmara"
      >
        <ArrowLeft size={20} />
      </button>

      {sceneId === 'sea' && <Scene1 key="sea" />}
      {sceneId === 'field' && <Scene2 key="field" />}
      {sceneId === 'sky' && <Scene3 key="sky" />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/markers" element={<QRCodePage />} />
        <Route path="/ar" element={<ARPage />} />
        <Route path="/scene/:sceneId" element={<SceneWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}
