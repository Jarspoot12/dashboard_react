import React, { useState, useEffect, useMemo } from 'react';
// Importamos el selector múltiple
import Select from 'react-select'; 
// Importamos los gráficos de Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

// --- Importaciones de Estilos y Componentes ---
import './App.css'; // Estilos principales de la app
import Sidebar from './components/Sidebar'; // Componente de la barra lateral
import './components/Sidebar.css'; // Estilos de la barra lateral

// --- Importaciones de Componentes de Gráficos ---
import MapaProduccion from './components/MapaProduccion';
import TrendChart from './components/TrendChart';

// Constante para el filtro de año
const YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023];

function App() {
  // --- ESTADOS GENERALES DE DATOS ---
  const [allData, setAllData] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  // --- ESTADOS PARA FILTROS ---
  const [selectedArea, setSelectedArea] = useState('Albania'); // Filtro para KPIs
  const [dashboardYear, setDashboardYear] = useState(2023); // filtro de año para las tarjetas KPI

  const [selectedYear, setSelectedYear] = useState(2023);     // Filtro para Mapa
  const [selectedItem, setSelectedItem] = useState('Agriculture'); // Filtro para Mapa
  const [mapMetric, setMapMetric] = useState('prod_percapita_usd'); // Filtro de métrica del Mapa
  const [trendCountries, setTrendCountries] = useState([{ value: 'Albania', label: 'Albania' }]); // Filtro para Gráfico de Tendencias

  // --- ESTADO DE NAVEGACIÓN ---
  const [activeTab, setActiveTab] = useState('dashboard'); // Pestaña activa

  // --- Carga de Datos (useEffect) ---
  useEffect(() => {
    fetch('/processed.json')
      .then(response => response.json())
      .then(jsonData => {
        setAllData(jsonData);
        
        // Extraer listas únicas para los filtros
        const areasUnicas = [...new Set(jsonData.map(item => item.Area))].sort();
        const itemsUnicos = [...new Set(jsonData.map(item => item.Item))].sort();
        
        setAvailableAreas(areasUnicas);
        setAvailableItems(itemsUnicos);

        // Seteamos valores por defecto
        if (areasUnicas.length > 0) {
          setSelectedArea(areasUnicas.includes('Albania') ? 'Albania' : areasUnicas[0]);
        }
        if (itemsUnicos.length > 0) {
          setSelectedItem(itemsUnicos.includes('Agriculture') ? 'Agriculture' : itemsUnicos[0]);
        }
      })
      .catch(error => console.error("Error loading data:", error));
  }, []); // El array vacío '[]' asegura que esto solo se ejecute una vez

  // --- LÓGICA DE DATOS MEMORIZADA (useMemo) ---

  // 1. Datos para los gráficos de líneas (filtrados por un solo PAÍS)
  const lineChartData = useMemo(() => {
    return allData
      .filter(d => d.Area === selectedArea && d.Item === 'Agriculture') 
      .sort((a, b) => a.Year - b.Year);
  }, [allData, selectedArea]);
  
  // 2. Datos para las tarjetas KPI (basado en el filtro anterior)
  const kpiData = useMemo(() => {
    // lineChartData ya está filtrado por Área y ordenado por año
    // Simplemente encontramos el año que coincide con nuestro nuevo estado
    return lineChartData.find(d => d.Year === dashboardYear);
  }, [lineChartData, dashboardYear]); // ¡Ahora depende de dashboardYear!

  // 3. Opciones para el selector de países (formato { value, label })
  const areaOptions = useMemo(() => {
    return availableAreas.map(area => ({ value: area, label: area }));
  }, [availableAreas]);

  // --- DIBUJADO (JSX) ---

  // Muestra "Cargando..." mientras los datos no estén listos
  if (allData.length === 0) {
    return <div>Cargando...</div>;
  }

  // Layout principal con Sidebar y Contenido
  return (
    <div className="app-layout">
      
      {/* 1. La barra lateral. Le pasamos el estado y la función para cambiarlo */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 2. El contenido principal que cambiará */}
      <main className="app-content">
        
        {/* PESTAÑA 1: DASHBOARD (KPIs y Gráficos) */}
        {/* Se muestra solo si activeTab es 'dashboard' */}
        {activeTab === 'dashboard' && (
          // Usamos un Fragment (<>) para agrupar los elementos
          <> 
            <header className="dashboard-header">
              <h1>Dashboard Táctico: Agricultura y Nutrición</h1>
              <div className="filtro-container" style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                <label htmlFor="area-select">Selecciona Área (para KPIs y gráficos de abajo):</label>
                <select id="area-select" value={selectedArea} onChange={e => setSelectedArea(e.target.value)}>
                  {availableAreas.map(area => (<option key={area} value={area}>{area}</option>))}
                </select>

                <div>
                  <label htmlFor="kpi-year-select">Selecciona Año (KPIs):</label>
                  <select 
                    id="kpi-year-select" 
                    value={dashboardYear} 
                    onChange={e => setDashboardYear(Number(e.target.value))}
                  >
                    {YEARS.map(year => (<option key={year} value={year}>{year}</option>))}
                  </select>
                </div>
              </div>
            </header>

            <div className="kpi-grid">
              <div className="kpi-card"><h3>Producción Total ({kpiData?.Year || dashboardYear})</h3><p>${kpiData?.prod_valor_usd?.toLocaleString() || 'N/A'}</p></div>
              <div className="kpi-card"><h3>Prod. Per Cápita ({kpiData?.Year || dashboardYear})</h3><p>${kpiData?.prod_percapita_usd?.toFixed(2) || 'N/A'}</p></div>
              <div className="kpi-card"><h3>Costo Dieta ({kpiData?.Year || dashboardYear})</h3><p>${kpiData?.costo_dieta_ppp_day?.toFixed(2) || 'N/A'} / día</p></div>
              <div className="kpi-card"><h3>Tasa de Obesidad ({kpiData?.Year || dashboardYear})</h3><p>{kpiData?.obesidad_pct?.toFixed(2) || 'N/A'}%</p></div>
            </div>

            <div className="charts-grid">
              <div className="chart-container">
                <h3>Prod. Per Cápita vs. Año (para {selectedArea})</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Year" stroke="#ccc">
                          <Label value="Año" offset={-5} position="insideBottom" fill="#ccc" />
                        </XAxis>
                        <YAxis stroke="#ccc">
                          <Label 
                            value="Producción Per Cápita (USD)"
                            angle={-90}  
                            style={{ textAnchor: 'middle', fill: '#ffffffff' }}
                            dx={-30} // Ajusta el espaciado
                          />
                        </YAxis>                          <Tooltip /><Legend />
                    <Line type="monotone" dataKey="prod_percapita_usd" name="Prod. Per Cápita" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-container">
                <h3>Costo Dieta vs. Año (para {selectedArea})</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Year" stroke="#ccc">
                          <Label value="Año" offset={-5} position="insideBottom" fill="#ccc" />
                        </XAxis>
                        <YAxis stroke="#ccc">
                          <Label 
                            value="Producción Per Cápita (USD)"
                            angle={-90}  
                            style={{ textAnchor: 'middle', fill: '#ffffffff' }}
                            dx={-30} // Ajusta el espaciado
                          />
                        </YAxis>                          <Tooltip /><Legend />
                    <Tooltip /><Legend />
                    <Line type="monotone" dataKey="costo_dieta_ppp_day" name="Costo Dieta" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* PESTAÑA 2: MAPA */}
        {/* Se muestra solo si activeTab es 'mapa' */}
        {activeTab === 'mapa' && (
          <section className="map-section">
            <h2>Mapa Global Interactivo</h2>
            <div className="filtro-container map-filters">
              
              <div>
                <label htmlFor="metric-select">Ver Métrica:</label>
                <select id="metric-select" value={mapMetric} onChange={e => setMapMetric(e.target.value)}>
                  <option value="prod_percapita_usd">Producción Per Cápita</option>
                  <option value="obesidad_pct">Tasa de Obesidad</option>
                </select>
              </div>
              
              {/* Filtro de Producto (condicional) */}
              {mapMetric === 'prod_percapita_usd' && (
                <div>
                  <label htmlFor="item-select">Producto:</label>
                  <select id="item-select" value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
                    {availableItems.map(item => (<option key={item} value={item}>{item}</option>))}
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="year-select">Año:</label>
                <select id="year-select" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                  {YEARS.map(year => (<option key={year} value={year}>{year}</option>))}
                </select>
              </div>
            </div>
            <div className="map-container">
              <MapaProduccion 
                data={allData} 
                year={selectedYear} 
                item={selectedItem} 
                metric={mapMetric} 
              />
            </div>
          </section>
        )}

        {/* PESTAÑA 3: COMPARADOR DE TENDENCIAS */}
        {/* Se muestra solo si activeTab es 'tendencias' */}
        {activeTab === 'tendencias' && (
          <section className="trend-section">
            <h2>Comparador de Tendencias (Prod. Per Cápita)</h2>
            <div className="filtro-container">
              <label>Selecciona Países:</label>
              <Select
                options={areaOptions}
                isMulti
                value={trendCountries}
                onChange={setTrendCountries}
                className="multi-select"
                classNamePrefix="select"
              />
            </div>
            <div className="chart-container">
              <TrendChart 
                allData={allData}
                selectedCountries={trendCountries.map(c => c.value)}
                item={selectedItem} // Puedes cambiar esto si quieres que sea independiente
              />
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
