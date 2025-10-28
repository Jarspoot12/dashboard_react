import pandas as pd
import numpy as np
from pathlib import Path

DATA = Path("data/raw")
OUT  = Path("public/data")
OUT.mkdir(parents=True, exist_ok=True)

# ------------------------
# 1) Carga de los 4 CSV
# ------------------------
prod = pd.read_csv(DATA/"production.csv", dtype={"Area":"string","Item":"string"})
pop  = pd.read_csv(DATA/"population.csv", dtype={"Area":"string"})
ob   = pd.read_csv(DATA/"obesity.csv",   dtype={"Area":"string"})
diet = pd.read_csv(DATA/"diet_cost.csv", dtype={"Area":"string"})

# Normalización mínima de tipos
for df, numcols in [(prod, ["Value"]), (pop, ["ValueTotal"]), (ob, ["Value"]), (diet, ["Value"])]:
    for c in numcols:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df["Year"] = pd.to_numeric(df["Year"], errors="coerce").astype("Int64")

# ------------------------
# 2) Relleno de obesidad
# Reglas: interpolación interna; bordes 2017 bfill; 2023 ffill.
# ------------------------
ALL_YEARS = pd.Index(range(2017, 2023+1), name="Year")

def fill_obesity(group: pd.DataFrame) -> pd.DataFrame:
    g = group.set_index("Year").sort_index()
    g = g.reindex(ALL_YEARS)  # asegura años 2017..2023
    # Interpolación lineal interna (promedia si solo falta 1 año entre dos)
    g["Value"] = g["Value"].interpolate(method="linear")
    # Bordes: si falta al inicio, copia del siguiente; si falta al final, copia del anterior
    g["Value"] = g["Value"].bfill().ffill()
    # Si todo era NaN, seguirá NaN (sin datos para ese país)
    g = g.reset_index()
    g["Area"] = group["Area"].iloc[0]
    return g[["Area","Year","Value"]]

ob_filled = (
    ob.groupby("Area", group_keys=False)
      .apply(fill_obesity)
      .sort_values(["Area","Year"], kind="stable")
      .reset_index(drop=True)
)

# Si quieres conservar solo años que existían originalmente:
# ob_filled = ob[["Area","Year"]].merge(ob_filled, on=["Area","Year"], how="left")

# ------------------------
# 3) Preparar datasets auxiliares
# ------------------------
pop = pop.rename(columns={"ValueTotal":"poblacion"})
diet = diet.rename(columns={"Value":"costo_dieta_ppp_day"})
ob_filled = ob_filled.rename(columns={"Value":"obesidad_casos"})

# ------------------------
# 4) Producción: está en "largo" con categoría (Item)
#    Queremos:
#    a) Mantener por categoría (para filtrar por Item)
#    b) Tener también el total del país (si no viene "Agriculture" o quieres recalcularlo)
# ------------------------
# Aseguramos que exista una categoría "Agriculture" total. Si ya existe, puedes omitir este bloque.
# total_por_pais_anio = prod.groupby(["Area","Year"], as_index=False)["Value"].sum()
# total_por_pais_anio["Item"] = "Agriculture (total recalculado)"
# prod = pd.concat([prod, total_por_pais_anio], ignore_index=True)

# ------------------------
# 5) Uniones por (Area, Year, Item)
#    Nota: población, dieta y obesidad son por país-año (no por categoría).
#    Haremos join en (Area,Year) y replicarán sus valores a cada categoría de ese país.
# ------------------------
df = (
    prod
    .merge(pop,  on=["Area","Year"], how="inner")   # producción y población comparten países
    .merge(diet, on=["Area","Year"], how="left")    # diet puede faltar
    .merge(ob_filled, on=["Area","Year"], how="left")# obesidad ya rellenado
)

# ------------------------
# 6) Cálculos de KPI por país-año-categoría
# ------------------------
df["prod_valor_usd"]    = df["Value"]
df["prod_percapita_usd"] = np.where(df["poblacion"]>0, df["prod_valor_usd"]/df["poblacion"], np.nan)

# Crecimiento anual de producción por Area+Item (misma categoría en el tiempo)
df = df.sort_values(["Area","Item","Year"])
df["prod_growth_pct"] = (
    df.groupby(["Area","Item"])["prod_valor_usd"]
      .pct_change()
      .mul(100)
)

# Variación anual de costo de dieta por país
df["costo_dieta_var_pct"] = (
    df.groupby("Area")["costo_dieta_ppp_day"]
      .pct_change()
      .mul(100)
)

# Obesidad (% y su variación) por país
df["obesidad_pct"] = np.where(
    (df["obesidad_casos"].notna()) & (df["poblacion"]>0),
    100 * df["obesidad_casos"]/df["poblacion"],
    np.nan
)
df["obesidad_var_pct"] = (
    df.groupby("Area")["obesidad_pct"]
      .pct_change()
      .mul(100)
)

# Banderas de disponibilidad
df["has_diet_cost"] = df["costo_dieta_ppp_day"].notna()
df["has_obesity"]   = df["obesidad_casos"].notna()

# ------------------------
# 7) Selección y exportación
# ------------------------
cols_out = [
    "Area","Item","Year",
    "prod_valor_usd","poblacion","prod_percapita_usd","prod_growth_pct",
    "costo_dieta_ppp_day","costo_dieta_var_pct",
    "obesidad_casos","obesidad_pct","obesidad_var_pct",
    "has_diet_cost","has_obesity"
]
df_out = df[cols_out].copy()

# Tipos numéricos limpios
for c in cols_out:
    if c not in ["Area","Item"]:
        df_out[c] = pd.to_numeric(df_out[c], errors="coerce")

out_path = OUT/"processed.json"
df_out.to_json(out_path, orient="records")
print(f"OK -> {out_path}  (filas: {len(df_out)})")
