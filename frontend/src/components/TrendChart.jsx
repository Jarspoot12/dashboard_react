// src/components/TrendChart.jsx

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label} from 'recharts';

// Una paleta de colores para las líneas
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#a4de6c"];

const TrendChart = ({ allData, selectedCountries, item }) => {

  // 1. Transformamos los datos (Pivoteo)
  // Recharts necesita los datos en formato:
  // { Year: 2017, Albania: 102, Algeria: 150 }
  // { Year: 2018, Albania: 105, Algeria: 155 }
  const chartData = useMemo(() => {
    // Filtramos solo los datos de los países e item seleccionados
    const filteredData = allData.filter(
      d => selectedCountries.includes(d.Area) && d.Item === item
    );

    // Creamos un objeto temporal para agrupar por año
    const dataByYear = {};

    for (const d of filteredData) {
      if (!d.Year || d.prod_percapita_usd == null) continue; // Omitimos nulos

      // Si el año no existe, lo inicializamos
      if (!dataByYear[d.Year]) {
        dataByYear[d.Year] = { Year: d.Year };
      }
      
      // Agregamos el valor del país como una nueva clave
      dataByYear[d.Year][d.Area] = d.prod_percapita_usd;
    }

    // Convertimos el objeto en un array y lo ordenamos
    return Object.values(dataByYear).sort((a, b) => a.Year - b.Year);

  }, [allData, selectedCountries, item]); // Recalcula si esto cambia

  if (selectedCountries.length === 0) {
    return <div style={{ height: 300, display: 'grid', placeContent: 'center' }}>Selecciona uno o más países para ver la tendencia.</div>
  }

  // 2. Renderizamos el gráfico
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
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
        </YAxis>        
        {/* El tooltip ahora mostrará todos los países */}
        <Tooltip />
        <Legend />

        {/* 3. Creamos una línea dinámicamente por cada país seleccionado */}
        {selectedCountries.map((countryName, index) => (
          <Line
            key={countryName}
            type="monotone"
            dataKey={countryName} // La clave que creamos en el pivote
            stroke={COLORS[index % COLORS.length]} // Asigna un color de la paleta
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default TrendChart;