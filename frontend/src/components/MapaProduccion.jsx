// frontend/src/components/MapaProduccion.jsx

import React, { useMemo } from 'react';
import { ResponsiveChoropleth } from '@nivo/geo';
// Asegúrate de que este archivo esté en la misma carpeta (src/components/)
import world_countries from './world_countries.json'; 

// --- ¡EL TRADUCTOR! ---
// Este es el "diccionario" que traduce Nombres a Códigos ISO A3
// Tendrás que agregar los países que te falten de tu dataset
const countryNameMap = {
    'Albania': 'ALB',
    'Algeria': 'DZA',
    'Angola': 'AGO',
    'Antigua and Barbuda': 'ATG',
    'Argentina': 'ARG',
    'Armenia': 'ARM',
    'Australia': 'AUS',
    'Austria': 'AUT',
    'Azerbaijan': 'AZE',
    'Bahrain': 'BHR',
    'Bangladesh': 'BGD',
    'Barbados': 'BRB',
    'Belarus': 'BLR',
    'Belgium': 'BEL',
    'Belize': 'BLZ',
    'Benin': 'BEN',
    'Bhutan': 'BTN',
    'Bolivia (Plurinational State of)': 'BOL',
    'Bosnia and Herzegovina': 'BIH',
    'Botswana': 'BWA',
    'Brazil': 'BRA',
    'Brunei Darussalam': 'BRN',
    'Bulgaria': 'BGR',
    'Burkina Faso': 'BFA',
    'Burundi': 'BDI',
    'Cabo Verde': 'CPV',
    'Cambodia': 'KHM',
    'Cameroon': 'CMR',
    'Canada': 'CAN',
    'Central African Republic': 'CAF',
    'Chad': 'TCD',
    'Chile': 'CHL',
    'China': 'CHN',
    'China, Hong Kong SAR': 'HKG',
    'China, mainland': 'CHN',
    'Colombia': 'COL',
    'Congo': 'COG',
    'Cook Islands': 'COK',
    'Costa Rica': 'CRI',
    "Côte d'Ivoire": 'CIV',
    'Croatia': 'HRV',
    'Cyprus': 'CYP',
    'Czechia': 'CZE',
    'Denmark': 'DNK',
    'Dominican Republic': 'DOM',
    'Ecuador': 'ECU',
    'Egypt': 'EGY',
    'El Salvador': 'SLV',
    'Equatorial Guinea': 'GNQ',
    'Eritrea': 'ERI',
    'Estonia': 'EST',
    'Ethiopia': 'ETH',
    'Fiji': 'FJI',
    'Finland': 'FIN',
    'France': 'FRA',
    'Gambia': 'GMB',
    'Georgia': 'GEO',
    'Germany': 'DEU',
    'Ghana': 'GHA',
    'Greece': 'GRC',
    'Grenada': 'GRD',
    'Guinea': 'GIN',
    'Guinea-Bissau': 'GNB',
    'Guyana': 'GUY',
    'Honduras': 'HND',
    'Hungary': 'HUN',
    'Iceland': 'ISL',
    'India': 'IND',
    'Indonesia': 'IDN',
    'Iran (Islamic Republic of)': 'IRN',
    'Iraq': 'IRQ',
    'Ireland': 'IRL',
    'Israel': 'ISR',
    'Italy': 'ITA',
    'Jamaica': 'JAM',
    'Japan': 'JPN',
    'Jordan': 'JOR',
    'Kazakhstan': 'KAZ',
    'Kenya': 'KEN',
    'Kuwait': 'KWT',
    'Kyrgyzstan': 'KGZ',
    "Lao People's Democratic Republic": 'LAO',
    'Latvia': 'LVA',
    'Lebanon': 'LBN',
    'Lesotho': 'LSO',
    'Lithuania': 'LTU',
    'Luxembourg': 'LUX',
    'Madagascar': 'MDG',
    'Malawi': 'MWI',
    'Malaysia': 'MYS',
    'Maldives': 'MDV',
    'Mali': 'MLI',
    'Malta': 'MLT',
    'Mauritius': 'MUS',
    'Mexico': 'MEX',
    'Mongolia': 'MNG',
    'Morocco': 'MAR',
    'Mozambique': 'MOZ',
    'Namibia': 'NAM',
    'Nepal': 'NPL',
    'Netherlands (Kingdom of the)': 'NLD',
    'New Caledonia': 'NCL',
    'New Zealand': 'NZL',
    'Nicaragua': 'NIC',
    'Niger': 'NER',
    'Nigeria': 'NGA',
    'North Macedonia': 'MKD',
    'Norway': 'NOR',
    'Oman': 'OMN',
    'Pakistan': 'PAK',
    'Palestine': 'PSE',
    'Panama': 'PAN',
    'Paraguay': 'PRY',
    'Peru': 'PER',
    'Philippines': 'PHL',
    'Poland': 'POL',
    'Portugal': 'PRT',
    'Puerto Rico': 'PRI',
    'Qatar': 'QAT',
    'Republic of Korea': 'KOR',
    'Republic of Moldova': 'MDA',
    'Romania': 'ROU',
    'Russian Federation': 'RUS',
    'Rwanda': 'RWA',
    'Saint Kitts and Nevis': 'KNA',
    'Saint Lucia': 'LCA',
    'Saint Vincent and the Grenadines': 'VCT',
    'Samoa': 'WSM',
    'Saudi Arabia': 'SAU',
    'Senegal': 'SEN',
    'Serbia': 'SRB',
    'Seychelles': 'SYC',
    'Sierra Leone': 'SLE',
    'Singapore': 'SGP',
    'Slovakia': 'SVK',
    'Slovenia': 'SVN',
    'South Africa': 'ZAF',
    'Spain': 'ESP',
    'Sri Lanka': 'LKA',
    'Suriname': 'SUR',
    'Sweden': 'SWE',
    'Switzerland': 'CHE',
    'Tajikistan': 'TJK',
    'Thailand': 'THA',
    'Timor-Leste': 'TLS',
    'Togo': 'TGO',
    'Tonga': 'TON',
    'Trinidad and Tobago': 'TTO',
    'Tunisia': 'TUN',
    'Türkiye': 'TUR',
    'Turkmenistan': 'TKM',
    'Ukraine': 'UKR',
    'United Kingdom of Great Britain and Northern Ireland': 'GBR',
    'United Republic of Tanzania': 'TZA',
    'United States of America': 'USA',
    'Uruguay': 'URY',
    'Uzbekistan': 'UZB',
    'Vanuatu': 'VUT',
    'Viet Nam': 'VNM',
    'Yemen': 'YEM',
    'Zambia': 'ZMB',
    'Zimbabwe': 'ZWE'
};

// --- TEMA PERSONALIZADO ---
// Aquí definimos los colores del tooltip y del fondo
const miTema = {
  // Color del "océano" (fondo del lienzo del mapa)
  background: '#2a344a',

  // Personalización del Tooltip
  tooltip: {
    container: {
      background: '#ffffff', // Fondo blanco para el tooltip
      color: '#000000',      // <-- Letras color NEGRO
      fontSize: '13px',
    },
  },
};

// --- EL COMPONENTE ---
const MapaProduccion = ({ data, year, item, metric }) => {

  // 1. Preparamos los datos para el mapa
  const dataParaMapa = useMemo(() => {
    
    // Lógica de filtro condicional
    const filterLogic = (d) => {
      const value = d[metric]; // Obtiene el valor (ej: d['obesidad_pct'])
      
      // Filtros universales: debe tener valor y ser del año correcto
      if (value == null || d.Year !== year) return false;

      // Filtro condicional basado en la métrica
      if (metric === 'prod_percapita_usd') {
        // Si es producción, SÍ filtramos por item
        return d.Item === item; 
      }

      if (metric === 'obesidad_pct') {
        // Si es obesidad, los datos se repiten por item.
        // Solo necesitamos un registro por país. Usamos 'Agriculture'
        // como el registro "principal" para evitar duplicados.
        return d.Item === 'Agriculture'; 
      }

      return false; // Por defecto no mostramos nada
    };

    return data
      .filter(filterLogic) // Aplicamos nuestra lógica de filtro
      .map(d => {
        const isoCode = countryNameMap[d.Area]; // Traduce "Albania" a "ALB"
        
        if (!isoCode) {
          // console.warn(`No se encontró código ISO para: ${d.Area}`);
          return null;
        }

        return {
          id: isoCode, // El ID que el mapa entiende (ej: "ALB")
          value: d[metric] // El valor que queremos pintar
        };
      })
      .filter(Boolean); // Limpia cualquier 'null' que haya quedado
  }, [data, year, item, metric]); // Dependencias: recalcula si esto cambia

  // 2. Calculamos el rango de valores (min y max) para la leyenda
  const [minVal, maxVal] = useMemo(() => {
    if (dataParaMapa.length === 0) return [0, 1]; // Evita errores si no hay datos
    const values = dataParaMapa.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min, max === min ? min + 1 : max]; // Asegura que min y max no sean iguales
  }, [dataParaMapa]);

  // Colores Min/Max de la paleta 'YlOrRd'
  const COLOR_MIN = '#ffffcc'; // Amarillo más claro
  const COLOR_MAX = '#800026'; // Rojo más oscuro

  // 3. Función para formatear el valor (dólares o porcentaje)
  const formatValue = (value) => {
    if (metric === 'obesidad_pct') {
      return `${value.toFixed(2)}%`;
    }
    // Asumimos que es 'prod_percapita_usd' o similar
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  };


  // 4. Estado de "Sin Datos"
  if (dataParaMapa.length === 0) {
    return <div style={{ height: 500, display: 'grid', placeContent: 'center', color: '#ccc' }}>
      No hay datos para esta selección.
    </div>
  }

  // 5. Renderizamos el componente de Nivo
  return (
    <ResponsiveChoropleth
      data={dataParaMapa} // Tus datos ya procesados
      features={world_countries.features} // Las "formas" de los países
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      
      theme={miTema} // <-- Aplicamos el tema personalizado
      
      // Colores
      colors="YlOrRd" // Paleta de color incremental
      domain={[minVal, maxVal]} // El rango de tu data
      unknownColor="#999999" // Color para países sin datos

      // Tooltip (al pasar el mouse)
      tooltip={({ feature }) => {
        const d = feature.data;
        if (!d) return 'Sin datos';
        // Usamos la función formatValue
        return `${feature.properties.name}: ${formatValue(d.value)}`;
      }}

      // Bordes
      borderWidth={0.5}
      borderColor="#152538" // Color de las fronteras

      // Leyenda
      legends={[
        {
          anchor: 'bottom-left',
          direction: 'column',
          justify: true,
          translateX: 20,
          translateY: -100,
          itemsSpacing: 2,
          itemWidth: 94,
          itemHeight: 18,
          itemDirection: 'left-to-right',
          itemTextColor: '#ccc',
          itemOpacity: 0.85,
          symbolSize: 18,
          
          // Leyenda personalizada con Min y Max
          data: [
            {
              id: 'max',
              label: `Max: ${formatValue(maxVal)}`, 
              color: COLOR_MAX
            },
            {
              id: 'min',
              label: `Min: ${formatValue(minVal)}`, 
              color: COLOR_MIN
            }
          ]
        },
      ]}
    />
  );
}

export default MapaProduccion;