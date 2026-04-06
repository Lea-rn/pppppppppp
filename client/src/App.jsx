import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Zap, 
  Filter, 
  BarChart3, 
  PieChart as PieChartIcon 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#ec4899', '#f59e0b'];

function App() {
  const [data, setData] = useState({
    summary: { total: 0, hommes: 0, femmes: 0, jeunes: 0 },
    charts: { gender: [], gouvernorat: [] }
  });
  
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    gouvernorat: [],
    delegation: [],
    secteur: [],
    annee: [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032],
    composante: [],
    sous_composante: [],
    activite: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
    fetchStats();
  }, []);

  const fetchFilters = async () => {
    try {
      const res = await axios.get('/api/filters');
      setFilterOptions(prev => ({
        ...res.data,
        annee: prev.annee // Keep the hardcoded 2025-2032 range
      }));
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  const fetchStats = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key]) params.append(key, currentFilters[key]);
      });
      const res = await axios.get(`/api/stats?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
      // Reset filters and fetch new stats
      setFilters({});
      fetchFilters();
      fetchStats({});
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Erreur lors de l'importation du fichier.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchStats(newFilters);
  };

  const handleReset = async () => {
    if (!window.confirm("Voulez-vous vraiment vider toutes les données ?")) return;
    setLoading(true);
    try {
      await axios.post('/api/reset');
      setFilters({});
      fetchFilters();
      fetchStats({});
      alert("Données réinitialisées.");
    } catch (err) {
      console.error("Error resetting data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>📊 DINAMO | Dashboard des Statistiques</h1>
          <div className="last-updated">Actualisé le {new Date().toLocaleDateString('fr-FR')}</div>
        </div>
        <div className="upload-section">
          <button onClick={handleReset} className="reset-btn">Réinitialiser</button>
          <label className="upload-btn">
            Importer un Excel
            <input type="file" accept=".xlsx, .xls" onChange={handleUpload} style={{display: 'none'}} />
          </label>
        </div>
      </header>

      {/* Filters Section */}
      <section className="filters-grid">
        {Object.keys(filterOptions).map((key) => (
          <div className="filter-group" key={key}>
            <label>{key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}</label>
            <select 
              value={filters[key] || ''} 
              onChange={(e) => handleFilterChange(key, e.target.value)}
            >
              <option value="">Tous</option>
              {filterOptions[key].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </section>

      {/* Summary Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-total"><Users size={24} /></div>
          <div className="stat-info">
            <div className="label">Total Global</div>
            <div className="value">{data.summary.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-men"><UserPlus size={24} /></div>
          <div className="stat-info">
            <div className="label">Hommes</div>
            <div className="value">{data.summary.hommes.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-women"><UserMinus size={24} /></div>
          <div className="stat-info">
            <div className="label">Femmes</div>
            <div className="value">{data.summary.femmes.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-youth"><Zap size={24} /></div>
          <div className="stat-info">
            <div className="label">Jeunes (‹ 40 ans)</div>
            <div className="value">{data.summary.jeunes.toLocaleString()}</div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        <div className="chart-container">
          <h3><PieChartIcon size={20} style={{marginRight: '8px'}} /> Répartition par Genre</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={data.charts.gender}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.charts.gender.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3><BarChart3 size={20} style={{marginRight: '8px'}} /> Top 5 Gouvernorats</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.charts.gouvernorat}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 1000
        }}>
          Chargement...
        </div>
      )}
    </div>
  );
}

export default App;
