// src/index.js
// Point d’entrée : crée la racine React et monte <App />.
import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/global.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
