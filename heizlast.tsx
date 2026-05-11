import { useState } from "react";

const ROOM_HEIGHT = 2.3;
const INDOOR_TEMP = 20;
const BASE_WATT = 130;

const n = (v, d = 1) => (Number(v) || 0).toFixed(d);

function capacityAtTemp(s, t) {
  const minKw = Number(s.heat_min_kw) || 0;
  const nomKw = Number(s.heat_nom_kw) || 0;
  const maxKw = Number(s.heat_max_kw) || 0;
  const m10Kw = Number(s.heat_m10_kw) || nomKw * 0.6;
  const slope = (nomKw - m10Kw) / 17;
  return Math.max(minKw, Math.min(maxKw, m10Kw + (t + 10) * slope));
}

function fmt(w) { return w >= 1000 ? (w / 1000).toFixed(1) + " kW" : Math.round(w) + " W"; }

const SETS = [
  {
    name: "Kältebringer KBM79-27000BTU3 3× 9000 BTU (Ferienwohnung)",
    heat_min_kw: 1.9, heat_nom_kw: 8.3, heat_max_kw: 8.5, heat_m10_kw: 5.4, scop: 4.0, target: 0,
    seer: 6.1, cool_nom_kw: 7.9, cool_min_kw: 1.8, cool_max_kw: 8.4,
    energy_class_heat: "A+", energy_class_cool: "A++",
    op_heat_min: -25, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 5.4, pdesignc: 7.9,
    dimensions: "750 x 860 x 350 mm", weight: "52 kg",
    noise_cool: 55, noise_heat: 55,
    pipe_length_max: "50 m gesamt, max. 15 m je IG",
    refrigerant_amount: "R32, vorgefuellt",
    bafa: "Nein",
    shopUrl: "https://www.kaeltebringer.de/products/trio-multisplit-klimaanlage-3-innengerate",
    indoorUnits: [
      { name: "Wandgeraet 9000 BTU (Bad)", kw: 2.65, heat_kw: 3.48 },
      { name: "Wandgeraet 9000 BTU (Schlafzimmer)", kw: 2.65, heat_kw: 3.48 },
      { name: "Wandgeraet 9000 BTU (Wohnzimmer)", kw: 2.65, heat_kw: 3.48 },
    ],
  },
  {
    name: "Daikin 3MXM68A8 + CTXM15A/FTXM35A/FTXM50A Perfera (Ferienwohnung)",
    heat_min_kw: 1.7, heat_nom_kw: 8.6, heat_max_kw: 10.5, heat_m10_kw: 5.5, scop: 4.26, target: 0,
    seer: 7.71, cool_nom_kw: 6.8, cool_min_kw: 2.0, cool_max_kw: 8.0,
    energy_class_heat: "A+", energy_class_cool: "A++",
    op_heat_min: -15, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    energy_annual_heat: 2350, energy_annual_cool: 343, pdesignh: 5.5, pdesignc: 6.8,
    dimensions: "734 x 974 x 408 mm", weight: "65 kg",
    noise_cool: 50, noise_heat: 51, sound_power_cool: 64, sound_power_heat: 64,
    pipe_length_max: "60 m gesamt, max. 25 m je IG",
    refrigerant_amount: "1,9 kg (R32), vorgefuellt fuer 30 m",
    bafa: "Nein",
    shopUrl: "https://www.breeze24.com/klimaanlagen/klimaanlage-sets/monosplit-und-multisplit-set/multisplit/wandgeraete/3-wandgeraete/daikin-set-3-wandgeraete-perfera-wifi-1-5/3-5/5-0-kw-ctxm15a-ftxm35a-ftxm50a-3mxm68a8-r32",
    indoorUnits: [
      { name: "CTXM15A Perfera (Bad)", kw: 1.5, heat_kw: 2.0 },
      { name: "FTXM35A Perfera (Schlafzimmer)", kw: 3.5, heat_kw: 4.0 },
      { name: "FTXM50A Perfera (Wohnzimmer)", kw: 5.0, heat_kw: 5.8 },
    ],
  },
  {
    name: "Daikin 3MXM68A8 + FTXA20CW/FTXA25CW/FVXM25B Stylish+Perfera · Wittwer (Ferienwohnung)",
    heat_min_kw: 1.7, heat_nom_kw: 8.6, heat_max_kw: 10.5, heat_m10_kw: 5.5, scop: 4.34, target: 0,
    seer: 8.54, cool_nom_kw: 6.8, cool_min_kw: 2.0, cool_max_kw: 8.0,
    energy_class_heat: "A++", energy_class_cool: "A+++",
    op_heat_min: -15, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 5.5, pdesignc: 6.8,
    dimensions: "734 x 974 x 408 mm", weight: "65 kg",
    noise_cool: 48, noise_heat: 48,
    pipe_length_max: "60 m gesamt, max. 25 m je IG",
    refrigerant_amount: "1,9 kg (R32), vorgefuellt fuer 30 m",
    bafa: "Nein",
    shopUrl: "https://www.breeze24.com/klimaanlagen/aussengeraete/aussengeraete-split-systeme/aussengeraete-fuer-bis-zu-3-innengeraete/daikin-3mxm68a8-6-8-kw-multi-split-aussengeraet-fuer-3-innengeraete-r32",
    note: "Wittwer",
    indoorUnits: [
      { name: "FTXA20CW Stylish (Schlafzimmer)", kw: 2.0, heat_kw: 2.5 },
      { name: "FTXA25CW Stylish (Wohnzimmer)", kw: 2.5, heat_kw: 3.15 },
      { name: "FVXM25B Perfera (Bad)", kw: 2.4, heat_kw: 3.4 },
    ],
  },
  {
    name: "Daikin 2MXM50A8 + FTXA20CW/FVXM25B Stylish+Perfera · Wittwer (Einzelzimmer)",
    heat_min_kw: 1.3, heat_nom_kw: 5.6, heat_max_kw: 7.0, heat_m10_kw: 4.0, scop: 4.61, target: 1,
    seer: 8.53, cool_nom_kw: 5.0, cool_min_kw: 1.8, cool_max_kw: 5.3,
    energy_class_heat: "A++", energy_class_cool: "A+++",
    op_heat_min: -15, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 4.0, pdesignc: 5.0,
    dimensions: "734 x 852 x 350 mm", weight: "47 kg",
    noise_cool: 47, noise_heat: 48, sound_power_cool: 60, sound_power_heat: 61,
    pipe_length_max: "30 m gesamt, max. 20 m je IG",
    refrigerant_amount: "1,7 kg (R32), vorgefuellt fuer 20 m",
    bafa: "Ja (Daikin EKRHH Home Hub Adapter erforderlich)",
    shopUrl: "https://www.breeze24.com/klimaanlagen/aussengeraete/aussengeraete-split-systeme/aussengeraete-fuer-bis-zu-2-innengeraete/daikin-2mxm50a2v1b-9-8-5-0-kw-multi-split-aussengeraet-fuer-2-innengeraete-r32",
    indoorUnits: [
      { name: "FTXA20CW Stylish (Wohnzimmer)", kw: 2.0, heat_kw: 2.5 },
      { name: "FVXM25B Perfera (Bad)", kw: 2.4, heat_kw: 3.4 },
    ],
  },
  {
    name: "Daikin 2MXM50A + CTXA15CW + FTXA20CW Stylish (Einzelzimmer)",
    heat_min_kw: 1.3, heat_nom_kw: 5.6, heat_max_kw: 7.0, heat_m10_kw: 4.0, scop: 4.61, target: 1,
    seer: 8.53, cool_nom_kw: 5.0, cool_min_kw: 1.8, cool_max_kw: 5.3,
    energy_class_heat: "A++", energy_class_cool: "A+++",
    op_heat_min: -15, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 4.0, pdesignc: 5.0,
    dimensions: "734 x 852 x 350 mm", weight: "47 kg",
    noise_cool: 47, noise_heat: 48, sound_power_cool: 60, sound_power_heat: 61,
    pipe_length_max: "30 m gesamt, max. 20 m je IG",
    refrigerant_amount: "1,7 kg (R32), vorgefuellt fuer 20 m",
    bafa: "Ja (Daikin EKRHH Home Hub Adapter erforderlich)",
    shopUrl: "https://www.breeze24.com/klimaanlagen/klimaanlage-sets/monosplit-und-multisplit-set/multisplit/wandgeraete/2-wandgeraete/daikin-set-ctxa15cw-ftxa20cw-2mxm50a2v1b-9/8-wandgeraete-stylish-wifi-1-5/2-0-kw-r32-klimaanlag",
    indoorUnits: [
      { name: "CTXA15CW Stylish (Bad)", kw: 1.5, heat_kw: 2.0 },
      { name: "FTXA20CW Stylish (Wohnzimmer)", kw: 2.0, heat_kw: 2.5 },
    ],
  },
  {
    name: "Panasonic CU-3Z75ABEC + CS-Z20ZKEW/CS-Z25ZKEW/CS-Z50ZKEW Power Heat (Ferienwohnung)",
    heat_min_kw: 1.7, heat_nom_kw: 8.6, heat_max_kw: 10.6, heat_m10_kw: 5.6, scop: 4.60, target: 0,
    seer: 8.00, cool_nom_kw: 7.5, cool_min_kw: 2.1, cool_max_kw: 8.8,
    energy_class_heat: "A++", energy_class_cool: "A++",
    op_heat_min: -25, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 5.6, pdesignc: 7.5,
    dimensions: "795 x 875 x 320 mm", weight: "62 kg",
    noise_cool: 49, noise_heat: 53,
    pipe_length_max: "60 m gesamt, max. 25 m je IG",
    refrigerant_amount: "2,42 kg (R32), vorgefuellt fuer 30 m",
    bafa: "Ja (CZ-CAPRA1 P-Link Adapter je IG erforderlich)",
    shopUrl: "https://www.breeze24.com/klimaanlagen/aussengeraete/aussengeraete-split-systeme/aussengeraete-fuer-bis-zu-2-innengeraete/panasonic-cu-3z75abec-7-5-kw-multi-split-aussengeraet-fuer-3-inneneinheiten-r32-power-heat",
    indoorUnits: [
      { name: "CS-Z20ZKEW Etherea (Bad)", kw: 2.0, heat_kw: 2.8 },
      { name: "CS-Z25ZKEW Etherea (Schlafzimmer)", kw: 2.5, heat_kw: 3.4 },
      { name: "CS-Z50ZKEW Etherea (Wohnzimmer)", kw: 5.0, heat_kw: 5.8 },
    ],
  },
  {
    name: "Kältebringer KBMD53-DUO 2× 9000 BTU (Einzelzimmer)",
    heat_min_kw: 1.3, heat_nom_kw: 5.57, heat_max_kw: 5.75, heat_m10_kw: 3.6, scop: 4.0, target: 1,
    seer: 6.2, cool_nom_kw: 5.3, cool_min_kw: 1.2, cool_max_kw: 5.6,
    energy_class_heat: "A+", energy_class_cool: "A++",
    op_heat_min: -25, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 3.6, pdesignc: 5.3,
    dimensions: "554 x 805 x 330 mm", weight: "35 kg",
    noise_cool: 54, noise_heat: 54,
    pipe_length_max: "30 m gesamt, max. 15 m je IG",
    refrigerant_amount: "R32, vorgefuellt fuer 15 m",
    bafa: "Nein",
    shopUrl: "https://www.kaeltebringer.de/products/duo-multisplit-klimaanlage-2-innengeraete",
    indoorUnits: [
      { name: "Wandgeraet 9000 BTU (Bad)", kw: 2.65, heat_kw: 3.48 },
      { name: "Wandgeraet 9000 BTU (Wohnzimmer)", kw: 2.65, heat_kw: 3.48 },
    ],
  },
  {
    name: "Panasonic CU-2Z50ABEC + CS-HZ25ZKE + CS-HZ35ZKE Power Heat (Einzelzimmer)",
    heat_min_kw: 1.7, heat_nom_kw: 6.4, heat_max_kw: 8.7, heat_m10_kw: 5.1, scop: 4.40, target: 1,
    seer: 8.00, cool_nom_kw: 5.3, cool_min_kw: 2.1, cool_max_kw: 7.5,
    energy_class_heat: "A+", energy_class_cool: "A++",
    op_heat_min: -25, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 5.1, pdesignc: 5.3,
    dimensions: "795 x 875 x 320 mm", weight: "58 kg",
    noise_cool: 49, noise_heat: 49,
    pipe_length_max: "50 m gesamt, max. 25 m je IG",
    refrigerant_amount: "1,92 kg (R32), vorgefuellt fuer 30 m",
    bafa: "Ja (CZ-CAPRA1 P-Link Adapter je IG erforderlich)",
    shopUrl: "https://www.breeze24.com/klimaanlagen/aussengeraete/aussengeraete-split-systeme/aussengeraete-fuer-bis-zu-2-innengeraete/panasonic-cu-2z50abec-5-3-kw-multi-split-aussengeraet-fuer-2-inneneinheiten-r32-power-heat",
    indoorUnits: [
      { name: "CS-HZ25ZKE Nordic (Bad)", kw: 2.5, heat_kw: 3.2 },
      { name: "CS-HZ35ZKE Nordic (Wohnzimmer)", kw: 3.5, heat_kw: 4.0 },
    ],
  },
  {
    name: "Panasonic CU-2Z35TBE + CS-MZ16ZKE + CS-Z25ZKEW (Einzelzimmer)",
    heat_min_kw: 1.1, heat_nom_kw: 4.2, heat_max_kw: 5.6, heat_m10_kw: 3.2, scop: 4.60, target: 1,
    seer: 8.50, cool_nom_kw: 3.5, cool_min_kw: 1.5, cool_max_kw: 4.5,
    energy_class_heat: "A++", energy_class_cool: "A+++",
    op_heat_min: -15, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 3.2, pdesignc: 3.5,
    dimensions: "619 x 824 x 299 mm", weight: "39 kg",
    noise_cool: 48, noise_heat: 50,
    pipe_length_max: "30 m gesamt, max. 20 m je IG",
    refrigerant_amount: "1,12 kg (R32)",
    bafa: "Ja (CZ-CAPRA1 P-Link Adapter je IG erforderlich)",
    shopUrl: "https://www.breeze24.com/klimaanlagen/klimaanlage-sets/monosplit-und-multisplit-set/multisplit/wandgeraete/2-wandgeraete/panasonic-set-2-wandgeraete-1-6/2-5-kw-cs-mz16zke-cz-z25zkew-cu-2z35tbe-r32-klimaanlage",
    indoorUnits: [
      { name: "CS-MZ16ZKE (Bad)", kw: 1.6, heat_kw: 2.6 },
      { name: "CS-Z25ZKEW (Wohnzimmer)", kw: 2.5, heat_kw: 3.4 },
    ],
  },
  {
    name: "Daikin 2MXM40A2V1B9 + FTXA20A2V1BW/FTXA25A2V1BW Stylish (Einzelzimmer)",
    heat_min_kw: 1.0, heat_nom_kw: 4.6, heat_max_kw: 6.0, heat_m10_kw: 3.2, scop: 4.64, target: 1,
    seer: 8.53, cool_nom_kw: 4.0, cool_min_kw: 1.0, cool_max_kw: 4.5,
    energy_class_heat: "A++", energy_class_cool: "A+++",
    op_heat_min: -15, op_heat_max: 24, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 3.2, pdesignc: 4.0,
    dimensions: "552 x 852 x 350 mm", weight: "36 kg",
    noise_cool: 46, noise_heat: 48, sound_power_cool: 59, sound_power_heat: 61,
    pipe_length_max: "30 m gesamt, max. 20 m je IG",
    refrigerant_amount: "1,2 kg (R32), vorgefuellt",
    bafa: "Ja (Daikin EKRHH Home Hub Adapter erforderlich)",
    shopUrl: "https://www.breeze24.com/klimaanlagen/aussengeraete/aussengeraete-split-systeme/aussengeraete-fuer-bis-zu-2-innengeraete/daikin-2mxm40a2v1b9-4-0-kw-multi-split-aussengeraet-fuer-2-innengeraete-r32",
    indoorUnits: [
      { name: "FTXA20A2V1BW Stylish (Bad)", kw: 2.0, heat_kw: 2.5 },
      { name: "FTXA25A2V1BW Stylish (Wohnzimmer)", kw: 2.5, heat_kw: 2.8 },
    ],
  },
  {
    name: "Daikin 3MXM52A2V1B9 + FTXM20A2V1B/FTXM25A2V1B/FTXM42A2V1B Perfera (Ferienwohnung)",
    heat_min_kw: 1.7, heat_nom_kw: 6.8, heat_max_kw: 9.0, heat_m10_kw: 4.5, scop: 4.60, target: 0,
    seer: 8.50, cool_nom_kw: 5.2, cool_min_kw: 1.7, cool_max_kw: 6.0,
    energy_class_heat: "A++", energy_class_cool: "A+++",
    op_heat_min: -15, op_heat_max: 18, op_cool_min: -10, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 4.5, pdesignc: 5.2,
    dimensions: "734 x 974 x 408 mm", weight: "57 kg",
    noise_cool: 46, noise_heat: 47, sound_power_cool: 59, sound_power_heat: 60,
    pipe_length_max: "50 m gesamt, max. 25 m je IG",
    refrigerant_amount: "1,80 kg (R32), vorgefuellt fuer 30 m",
    bafa: "Nein",
    shopUrl: "https://www.breeze24.com/klimaanlagen/aussengeraete/aussengeraete-split-systeme/aussengeraete-fuer-bis-zu-3-innengeraete/daikin-3mxm52a2v1b-9/8-5-2-kw-multi-split-aussengeraet-fuer-3-innengeraete-r32",
    indoorUnits: [
      { name: "FTXM20A2V1B Perfera (Bad)", kw: 2.0, heat_kw: 2.5 },
      { name: "FTXM25A2V1B Perfera (Schlafzimmer)", kw: 2.5, heat_kw: 3.4 },
      { name: "FTXM42A2V1B Perfera (Wohnzimmer)", kw: 4.2, heat_kw: 5.4 },
    ],
  },
  {
    name: "Mitsubishi Heavy SCM60ZS-W + SRK20ZSX/SRF25ZS-W/SRK35ZSX (Ferienwohnung)",
    heat_min_kw: 1.0, heat_nom_kw: 6.8, heat_max_kw: 7.8, heat_m10_kw: 4.7, scop: 4.60, target: 0,
    seer: 8.80, cool_nom_kw: 6.0, cool_min_kw: 1.7, cool_max_kw: 7.5,
    energy_class_heat: "A++", energy_class_cool: "A+++",
    op_heat_min: -15, op_heat_max: 24, op_cool_min: -15, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 4.7, pdesignc: 6.0,
    dimensions: "640 x 915 x 290 mm", weight: "48.5 kg",
    noise_cool: 50, noise_heat: 52, sound_power_cool: 62, sound_power_heat: 64,
    pipe_length_max: "40 m gesamt, max. 25 m je IG",
    refrigerant_amount: "1,80 kg (R32), vorgefuellt fuer 40 m",
    bafa: "Ja",
    shopUrl: "https://www.breeze24.com/klimaanlagen/aussengeraete/aussengeraete-split-systeme/aussengeraete-fuer-bis-zu-3-innengeraete/mitsubishi-heavy-aussengeraet-6-0-kw-scm60zs-w-fuer-2-3-innengeraete-r32",
    indoorUnits: [
      { name: "SRK20ZSX (Schlafzimmer)", kw: 2.0, heat_kw: 2.7 },
      { name: "SRF25ZS-W Truhengeraet (Bad)", kw: 2.5, heat_kw: 2.9 },
      { name: "SRK35ZSX (Wohnzimmer)", kw: 3.5, heat_kw: 4.5 },
    ],
  },
  {
    name: "Mitsubishi Heavy SCM45ZS-W + SRK25ZSX/SRF25ZS-W (Einzelzimmer)",
    heat_min_kw: 1.0, heat_nom_kw: 5.3, heat_max_kw: 6.5, heat_m10_kw: 4.1, scop: 4.70, target: 1,
    seer: 9.10, cool_nom_kw: 4.5, cool_min_kw: 1.5, cool_max_kw: 6.4,
    energy_class_heat: "A++", energy_class_cool: "A+++",
    op_heat_min: -15, op_heat_max: 24, op_cool_min: -15, op_cool_max: 46, refrigerant: "R32",
    pdesignh: 4.1, pdesignc: 4.5,
    dimensions: "595 x 870 x 290 mm", weight: "40 kg",
    noise_cool: 50, noise_heat: 52, sound_power_cool: 63, sound_power_heat: 65,
    pipe_length_max: "40 m gesamt, max. 20 m je IG",
    refrigerant_amount: "1,40 kg (R32), vorgefuellt fuer 20 m",
    bafa: "Ja",
    shopUrl: "https://www.breeze24.com/klimaanlagen/aussengeraete/aussengeraete-split-systeme/aussengeraete-fuer-bis-zu-2-innengeraete/mitsubishi-heavy-aussengeraet-4-5-kw-scm45zs-w-r32",
    indoorUnits: [
      { name: "SRK25ZSX (Wohnzimmer)", kw: 2.5, heat_kw: 3.2 },
      { name: "SRF25ZS-W Truhengeraet (Bad)", kw: 2.5, heat_kw: 2.9 },
    ],
  },
];

const defaultUnits = [
  { name: "Ferienwohnung (FW)", split: "3-fach Multisplit", rooms: [{ name: "Wohnzimmer", area: 28 }, { name: "Schlafzimmer", area: 20 }, { name: "Bad", area: 8 }] },
  { name: "Einzelzimmer (EZ)",  split: "2-fach Multisplit", rooms: [{ name: "Wohnzimmer", area: 22 }, { name: "Bad", area: 6 }] },
];

const css = `
* { box-sizing:border-box; } body { margin:0; }
:root { --bg:#0a0f1a; --card:#111827; --border:#1e293b; --accent:#f59e0b; --accent2:#3b82f6; --text:#c8d6e5; --muted:#64748b; --danger:#ef4444; }
.app { font-family:'JetBrains Mono','SF Mono',monospace; background:var(--bg); color:var(--text); min-height:100vh; padding:32px 20px; }
.inner { max-width:900px; margin:0 auto; }
h1 { font-size:20px; font-weight:700; color:var(--accent); margin:0; letter-spacing:1px; }
.sub { font-size:12px; color:var(--muted); margin:4px 0 0; }
.card { background:var(--card); border:1px solid var(--border); border-radius:8px; overflow:hidden; margin-bottom:8px; }
.card-hdr { padding:12px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th { font-weight:500; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:var(--muted); }
td,th { padding:8px 10px; }
td.l,th.l { text-align:left; padding-left:20px; }
td.r,th.r { text-align:right; }
td.rp,th.rp { text-align:right; padding-right:20px; }
tr.body-row { border-top:1px solid var(--border); }
tr.total-row { border-top:2px solid var(--border); font-weight:700; }
tr.inner-row { border-top:1px solid rgba(30,41,59,.6); background:rgba(0,0,0,.15); }
.blue-hdr { padding:10px 20px; background:rgba(59,130,246,.08); border-bottom:2px solid var(--accent2); display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
.legend { padding:6px 20px; border-top:1px solid var(--border); font-size:10px; color:var(--muted); }
.grand { background:var(--card); border:2px solid var(--accent); border-radius:8px; padding:14px 20px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; }
.disclaimer { font-size:11px; color:var(--muted); line-height:1.6; margin-top:20px; }
.unit-block { margin-bottom:24px; }
.edit-btn { background:none; border:1px solid var(--border); color:var(--muted); border-radius:4px; padding:2px 8px; font-size:10px; cursor:pointer; margin-left:8px; font-family:inherit; }
.edit-btn:hover { border-color:var(--accent); color:var(--accent); }
.add-btn { background:none; border:1px dashed var(--border); color:var(--muted); border-radius:6px; padding:10px; width:100%; cursor:pointer; font-size:12px; font-family:inherit; margin-bottom:24px; }
.add-btn:hover { border-color:var(--accent2); color:var(--accent2); }
.modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; z-index:100; padding:20px; }
.modal { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:24px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; color:var(--text); }
.modal h2 { font-size:15px; font-weight:700; color:var(--accent); margin:0 0 16px; }
.modal select { color:var(--text); background:var(--bg); }
.form-row { margin-bottom:12px; }
.form-row label { font-size:11px; color:var(--muted); display:block; margin-bottom:4px; text-transform:uppercase; }
.form-row input { width:100%; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:4px; padding:7px 10px; font-size:13px; font-family:inherit; outline:none; }
.room-row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.rm-btn { background:none; border:none; color:var(--danger); cursor:pointer; font-size:16px; padding:0 4px; }
.btn-row { display:flex; gap:8px; margin-top:16px; justify-content:flex-end; }
.btn { padding:8px 16px; border-radius:5px; font-size:12px; cursor:pointer; font-family:inherit; font-weight:600; border:none; }
.btn-primary { background:var(--accent); color:#000; }
.btn-secondary { background:var(--border); color:var(--text); }
.btn-danger { background:var(--danger); color:#fff; }
.tab-row { display:flex; gap:4px; margin-bottom:20px; }
.tab { padding:6px 14px; border-radius:4px; font-size:12px; cursor:pointer; border:1px solid var(--border); background:none; color:var(--muted); font-family:inherit; }
.tab.active { background:var(--accent2); border-color:var(--accent2); color:#fff; font-weight:700; }
.dev-link { cursor:pointer; color:var(--accent2); text-decoration:underline; text-decoration-style:dotted; text-underline-offset:3px; }
.dev-link:hover { color:#93c5fd; }
.back-btn { display:inline-flex; align-items:center; gap:8px; background:none; border:1px solid var(--border); color:var(--muted); border-radius:6px; padding:6px 14px; font-size:12px; cursor:pointer; font-family:inherit; margin-bottom:24px; }
.back-btn:hover { border-color:var(--accent2); color:var(--accent2); }
.section-title { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:10px; margin-top:24px; }
.kpi-grid { display:grid; gap:8px; margin-bottom:4px; }
.kpi { background:var(--card); border:1px solid var(--border); border-radius:8px; padding:12px 14px; }
.kpi-label { font-size:9px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
.kpi-val { font-size:17px; font-weight:700; }
input[type=range]::-webkit-slider-runnable-track { background:#4b5563; border-radius:4px; height:4px; }
input[type=range]::-moz-range-track { background:#4b5563; border-radius:4px; height:4px; }
`;

function CoverageBar({ percent }) {
  const color = percent >= 120 ? "#10b981" : percent >= 100 ? "#22c55e" : percent >= 80 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:60, height:7, background:"#1e293b", borderRadius:4, overflow:"hidden", position:"relative" }}>
        <div style={{ width:Math.min(percent/2,100)+"%", height:"100%", background:color, borderRadius:4 }} />
        <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:1, background:"#c8d6e5", opacity:.2 }} />
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, minWidth:60, textAlign:"right" }}>{Math.round(percent)}%</span>
    </div>
  );
}

function DeviceDetail({ s, temp, calc, units, onBack }) {
  const minKw = Number(s.heat_min_kw)||0, nomKw = Number(s.heat_nom_kw)||0;
  const maxKw = Number(s.heat_max_kw)||0, m10Kw = Number(s.heat_m10_kw)||0, sc = Number(s.scop)||0;
  const capNow = capacityAtTemp(s, temp), capMax = capacityAtTemp(s, -15)||1;
  const modPct = maxKw > 0 ? Math.round((minKw/maxKw)*100) : 0;
  const totalIU = (s.indoorUnits||[]).reduce((a,u) => a+(Number(u.kw)||0), 0);
  const temps = [-15,-12,-10,-8,-5,-2,0,2,5,7,10,12,15];
  const inp = { background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:4, padding:"6px 8px", fontSize:12, fontFamily:"inherit" };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>Zurueck zur Uebersicht</button>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22 }}>{s.name}</h1>
        <p className="sub">{(s.indoorUnits||[]).map(u=>u.name).join(" + ")} · Zugeordnet: {units[s.target]?.name??"-"} · {s.refrigerant||"R32"}</p>
      </div>

      {s.shopUrl && (
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"12px 16px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:"var(--muted)" }}>Produktseite im Shop</span>
          <a href={s.shopUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:"var(--accent2)", textDecoration:"underline", textDecorationStyle:"dotted" }}>breeze24.com</a>
        </div>
      )}

      {(s.refrigerant||s.energy_class_heat) && (<>
        <div className="section-title" style={{ marginTop:0 }}>Allgemeine Geraetedaten</div>
        <div className="kpi-grid" style={{ gridTemplateColumns:"repeat(4,1fr)", marginBottom:20 }}>
          {s.refrigerant      && <div className="kpi"><div className="kpi-label">Kaeltemittel</div><div className="kpi-val" style={{ color:"var(--text)", fontSize:15 }}>{s.refrigerant}</div></div>}
          {s.energy_class_heat && <div className="kpi"><div className="kpi-label">Effizienz Heizen</div><div className="kpi-val" style={{ color:"#10b981" }}>{s.energy_class_heat}</div></div>}
          {s.energy_class_cool && <div className="kpi"><div className="kpi-label">Effizienz Kuehlen</div><div className="kpi-val" style={{ color:"#3b82f6" }}>{s.energy_class_cool}</div></div>}
          {s.seer              && <div className="kpi"><div className="kpi-label">SEER</div><div className="kpi-val" style={{ color:"#3b82f6" }}>{Number(s.seer).toFixed(2)}</div></div>}
        </div>
      </>)}

      <div className="section-title" style={{ marginTop:0 }}>Heizleistung - Kennwerte</div>
      <div className="kpi-grid" style={{ gridTemplateColumns:"repeat(5,1fr)" }}>
        {[["Minimum",n(minKw)+" kW","#64748b"],["Nenn +7C",n(nomKw)+" kW","#3b82f6"],["Spez. -10C",n(m10Kw)+" kW","#a78bfa"],["Maximum",n(maxKw)+" kW","#f59e0b"],["SCOP",n(sc,2),"#10b981"]].map(([l,v,c])=>(
          <div className="kpi" key={l}><div className="kpi-label">{l}</div><div className="kpi-val" style={{ color:c }}>{v}</div></div>
        ))}
      </div>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"12px 16px", marginTop:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"var(--muted)" }}>Kapazitaet bei Aussentemperatur ({temp} C)</span>
        <span style={{ fontSize:18, fontWeight:700, color:"var(--accent)" }}>{capNow.toFixed(1)} kW</span>
      </div>

      {s.cool_nom_kw && (<>
        <div className="section-title" style={{ marginTop:28 }}>Kuehlleistung - Kennwerte</div>
        <div className="kpi-grid" style={{ gridTemplateColumns:"repeat(3,1fr)", marginBottom:8 }}>
          {[["Minimum",n(s.cool_min_kw)+" kW","#64748b"],["Nennleistung",n(s.cool_nom_kw)+" kW","#3b82f6"],["Maximum",n(s.cool_max_kw)+" kW","#f59e0b"]].map(([l,v,c])=>(
            <div className="kpi" key={l}><div className="kpi-label">{l}</div><div className="kpi-val" style={{ color:c }}>{v}</div></div>
          ))}
        </div>
      </>)}

      {(s.pdesignh||s.op_heat_min!==undefined) && (<>
        <div className="section-title" style={{ marginTop:28 }}>Oekodesign EN14825 &amp; Betriebsbereich</div>
        <div className="kpi-grid" style={{ gridTemplateColumns:"repeat(4,1fr)", marginBottom:8 }}>
          {s.pdesignh           && <div className="kpi"><div className="kpi-label">Pdesignh Heizen</div><div className="kpi-val" style={{ color:"#a78bfa" }}>{n(s.pdesignh)} kW</div></div>}
          {s.pdesignc           && <div className="kpi"><div className="kpi-label">Pdesignc Kuehlen</div><div className="kpi-val" style={{ color:"#3b82f6" }}>{n(s.pdesignc)} kW</div></div>}
          {s.energy_annual_heat && <div className="kpi"><div className="kpi-label">Energiebedarf Heizen</div><div className="kpi-val" style={{ color:"var(--text)", fontSize:14 }}>{s.energy_annual_heat} kWh/a</div></div>}
          {s.energy_annual_cool && <div className="kpi"><div className="kpi-label">Energiebedarf Kuehlen</div><div className="kpi-val" style={{ color:"var(--text)", fontSize:14 }}>{s.energy_annual_cool} kWh/a</div></div>}
        </div>
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"12px 16px", marginBottom:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {s.op_heat_min!==undefined && <div><div style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>Heizbetrieb</div><div style={{ fontSize:14, fontWeight:700, color:"#f59e0b" }}>{s.op_heat_min} C bis +{s.op_heat_max} C</div></div>}
            {s.op_cool_min!==undefined && <div><div style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>Kuehlbetrieb</div><div style={{ fontSize:14, fontWeight:700, color:"#3b82f6" }}>{s.op_cool_min} C bis +{s.op_cool_max} C</div></div>}
          </div>
        </div>
      </>)}

      <div className="section-title" style={{ marginTop:28 }}>Modulationsbereich</div>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <span style={{ fontSize:13 }}><b>{n(minKw)} kW</b> <span style={{ color:"var(--muted)" }}>Min Max</span> <b>{n(maxKw)} kW</b></span>
          <span style={{ fontSize:13, fontWeight:700, color:"#10b981" }}>Regelbereich: {(maxKw-minKw).toFixed(1)} kW</span>
        </div>
        <div style={{ position:"relative", height:30, background:"#1e293b", borderRadius:6, overflow:"hidden", marginBottom:14 }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:modPct+"%", background:"#0f172a" }} />
          <div style={{ position:"absolute", left:modPct+"%", top:0, bottom:0, right:0, background:"linear-gradient(90deg,#3b82f6,#f59e0b)" }} />
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>Regelbereich {modPct}-100% der Maximalleistung</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {[["Heruntertakten bis",n(minKw)+" kW ("+modPct+"% von Max)",modPct<25?"#10b981":modPct<40?"#f59e0b":"#ef4444"],["Kapazitaet aktuell",n(capNow)+" kW @ "+temp+"C","#3b82f6"],["Modulationstiefe",(100-modPct)+" Prozentpunkte","#a78bfa"]].map(([l,v,c])=>(
            <div key={l} style={{ background:"rgba(0,0,0,.2)", borderRadius:6, padding:"8px 10px" }}>
              <div style={{ fontSize:9, color:"var(--muted)", textTransform:"uppercase", marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:11, fontWeight:700, color:c }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:10, color:"var(--muted)", marginTop:8 }}>Je niedriger der Min-Wert, desto seltener taktet das Geraet bei milden Aussentemperaturen.</div>
      </div>

      <div className="section-title" style={{ marginTop:28 }}>Kapazitaetskurve ueber Aussentemperatur</div>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"20px 16px 14px" }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:140 }}>
          {temps.map(t=>{
            const cap=capacityAtTemp(s,t), h=Math.round((cap/capMax)*100);
            const active=t===temp, isNom=t===7, isM10=t===-10;
            return (
              <div key={t} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <div style={{ fontSize:8, color:active?"#f59e0b":isNom?"#3b82f6":isM10?"#a78bfa":"var(--muted)", fontWeight:active||isNom||isM10?700:400 }}>{cap.toFixed(1)}</div>
                <div style={{ width:"100%", height:h+"%", background:active?"#f59e0b":isNom?"#3b82f6":isM10?"#a78bfa":"#1e3a5f", borderRadius:"3px 3px 0 0" }} />
                <div style={{ fontSize:8, color:active?"#f59e0b":isNom?"#3b82f6":isM10?"#a78bfa":"var(--muted)" }}>{t>0?"+":""}{t}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:12, fontSize:10, color:"var(--muted)" }}>
          <span><span style={{ color:"#f59e0b" }}>■</span> Aktuell ({temp}C)</span>
          <span><span style={{ color:"#3b82f6" }}>■</span> Nenn (+7C)</span>
          <span><span style={{ color:"#a78bfa" }}>■</span> Spez. -10C</span>
        </div>
      </div>

      <div className="section-title" style={{ marginTop:28 }}>Deckungsabgleich je Einheit @ {temp} C</div>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
        {calc.map((u,i)=>{
          const cover=u.totalCur>0?Math.round((capNow*1000/u.totalCur)*100):999;
          const col=cover>=120?"#10b981":cover>=100?"#22c55e":cover>=80?"#f59e0b":"#ef4444";
          return (
            <div key={i}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600 }}>{u.name}</span>
                <span style={{ fontSize:12, color:"var(--muted)" }}>Heizlast: {fmt(u.totalCur)} · Deckung: <b style={{ color:col }}>{cover}%</b></span>
              </div>
              <div style={{ height:8, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
                <div style={{ width:Math.min(cover/2,100)+"%", height:"100%", background:col, borderRadius:4 }} />
              </div>
            </div>
          );
        })}
        <div style={{ fontSize:10, color:"var(--muted)" }}>
          <span style={{ color:"#10b981" }}>■</span> ≥120% &nbsp;<span style={{ color:"#22c55e" }}>■</span> ≥100% &nbsp;<span style={{ color:"#f59e0b" }}>■</span> ≥80% &nbsp;<span style={{ color:"#ef4444" }}>■</span> &lt;80%
        </div>
      </div>

      {(s.dimensions||s.noise_cool!==undefined) && (<>
        <div className="section-title" style={{ marginTop:28 }}>Aussengeraet - Technische Details</div>
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, overflow:"hidden" }}>
          <table style={{ fontSize:12 }}>
            <tbody>
              {[
                s.dimensions         && ["Abmessungen (H x B x T)", s.dimensions],
                s.weight             && ["Gewicht", s.weight],
                s.refrigerant        && ["Kaeltemittel", s.refrigerant],
                s.refrigerant_amount && ["Kaeltemittelfuellmenge", s.refrigerant_amount],
                s.pipe_length_max    && ["Max. Leitungslaenge", s.pipe_length_max],
                s.noise_cool!=null   && ["Schalldruckpegel Kuehlen/Heizen", s.noise_cool+" / "+s.noise_heat+" dB(A)"],
                s.sound_power_cool!=null && ["Schallleistungspegel Kuehlen/Heizen", s.sound_power_cool+" / "+s.sound_power_heat+" dB(A)"],
                s.power_input_heat   && ["Leistungsaufnahme Heizen", s.power_input_heat],
                s.power_input_cool   && ["Leistungsaufnahme Kuehlen", s.power_input_cool],
                s.bafa               && ["BAFA Foerderung", s.bafa],
              ].filter(Boolean).map(([l,v])=>(
                <tr key={l} className="body-row">
                  <td className="l" style={{ color:"var(--muted)", fontSize:11 }}>{l}</td>
                  <td className="rp" style={{ fontWeight:600 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}

      <div className="section-title" style={{ marginTop:28 }}>Innengeraete</div>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, overflow:"hidden" }}>
        <table>
          <thead>
            <tr style={{ borderBottom:"1px solid var(--border)" }}>
              <th className="l">Modell</th><th className="r">Heizleistung</th><th className="r">@ {temp}C (gesch.)</th><th className="rp">Anteil</th>
            </tr>
          </thead>
          <tbody>
            {(s.indoorUnits||[]).map((u,i)=>{
              const kw=Number(u.kw)||0, pct=totalIU>0?Math.round((kw/totalIU)*100):0;
              const cap=capacityAtTemp({ heat_min_kw:0, heat_nom_kw:kw, heat_max_kw:kw*1.2, heat_m10_kw:kw*0.6 },temp);
              return (
                <tr key={i} className="body-row">
                  <td className="l" style={{ fontWeight:600 }}>{u.name}</td>
                  <td className="r" style={{ color:"#3b82f6", fontWeight:700 }}>{kw.toFixed(1)} kW</td>
                  <td className="r" style={{ color:"var(--accent2)" }}>{cap.toFixed(1)} kW</td>
                  <td className="rp">
                    <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
                      <div style={{ width:60, height:5, background:"#1e293b", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ width:pct+"%", height:"100%", background:"#3b82f6" }} />
                      </div>
                      <span style={{ fontSize:11, color:"var(--muted)", minWidth:28 }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td className="l">Gesamt</td>
              <td className="r" style={{ color:"var(--accent)" }}>{totalIU.toFixed(1)} kW</td>
              <td className="r"/><td className="rp"/>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize:11, color:"var(--muted)", marginTop:24, lineHeight:1.6 }}>
        Kapazitaetswerte linear interpoliert zwischen Nennleistung (+7C) und Herstellerangabe (-10C) gemäss EN14825. Alle Angaben ohne Gewähr.
      </p>
    </div>
  );
}

function UnitModal({ unit, onSave, onDelete, onClose }) {
  const [name, setName] = useState(unit?.name??"Neue Einheit");
  const [split, setSplit] = useState(unit?.split??"Multisplit");
  const [rooms, setRooms] = useState(unit?unit.rooms.map(r=>({...r})):[{ name:"Raum 1", area:20 }]);
  const inp = { background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:4, padding:"6px 8px", fontSize:12, fontFamily:"inherit" };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h2>{unit?"Einheit bearbeiten":"Neue Einheit"}</h2>
        <div className="form-row"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="form-row"><label>Typ</label><input value={split} onChange={e=>setSplit(e.target.value)} /></div>
        <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>Raeume</div>
        {rooms.map((r,i)=>(
          <div className="room-row" key={i}>
            <input placeholder="Raumname" value={r.name} onChange={e=>setRooms(rooms.map((x,j)=>j===i?{...x,name:e.target.value}:x))} style={{...inp,flex:2}} />
            <input placeholder="m2" type="number" value={r.area} onChange={e=>setRooms(rooms.map((x,j)=>j===i?{...x,area:parseFloat(e.target.value)||0}:x))} style={{...inp,width:70}} />
            <button className="rm-btn" onClick={()=>setRooms(rooms.filter((_,j)=>j!==i))}>x</button>
          </div>
        ))}
        <button className="add-btn" style={{ margin:"4px 0 0" }} onClick={()=>setRooms([...rooms,{name:"Raum "+(rooms.length+1),area:15}])}>+ Raum</button>
        <div className="btn-row">
          {unit && <button className="btn btn-danger" onClick={onDelete}>Loeschen</button>}
          <button className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-primary" onClick={()=>onSave({name,split,rooms})}>Speichern</button>
        </div>
      </div>
    </div>
  );
}

function SetModal({ set, unitCount, onSave, onDelete, onClose }) {
  const [s, setS] = useState({
    name: set?.name??"Neues Geraet",
    heat_min_kw: Number(set?.heat_min_kw)||1.0, heat_nom_kw: Number(set?.heat_nom_kw)||5.0,
    heat_max_kw: Number(set?.heat_max_kw)||7.0, heat_m10_kw: Number(set?.heat_m10_kw)||3.5,
    scop: Number(set?.scop)||4.5, target: set?.target??0,
    indoorUnits: set?.indoorUnits?.map(u=>({...u}))??[{ name:"", kw:2.5 }],
  });
  const upd = (k,v) => setS(p=>({...p,[k]:v}));
  const inp = { background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:4, padding:"6px 8px", fontSize:12, fontFamily:"inherit" };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h2>{set?"Geraet bearbeiten":"Neues Aussengeraet"}</h2>
        <div className="form-row"><label>Modell</label><input value={s.name} onChange={e=>upd("name",e.target.value)} /></div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:12 }}>
          {[["Min","heat_min_kw"],["Nenn","heat_nom_kw"],["-10C","heat_m10_kw"],["Max","heat_max_kw"],["SCOP","scop"]].map(([l,k])=>(
            <div key={k}>
              <label style={{ fontSize:10, color:"var(--muted)", display:"block", marginBottom:3, textTransform:"uppercase" }}>{l}</label>
              <input type="number" step="0.1" value={s[k]} onChange={e=>upd(k,parseFloat(e.target.value)||0)} style={{...inp,width:"100%"}} />
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>Innengeraete</div>
        {s.indoorUnits.map((u,i)=>(
          <div className="room-row" key={i}>
            <input placeholder="Modell" value={u.name} onChange={e=>setS(p=>({...p,indoorUnits:p.indoorUnits.map((x,j)=>j===i?{...x,name:e.target.value}:x)}))} style={{...inp,flex:2}} />
            <input placeholder="kW" type="number" step="0.1" value={u.kw} onChange={e=>setS(p=>({...p,indoorUnits:p.indoorUnits.map((x,j)=>j===i?{...x,kw:parseFloat(e.target.value)||0}:x)}))} style={{...inp,width:70}} />
            <button className="rm-btn" onClick={()=>setS(p=>({...p,indoorUnits:p.indoorUnits.filter((_,j)=>j!==i)}))}>x</button>
          </div>
        ))}
        <button className="add-btn" style={{ margin:"4px 0 0" }} onClick={()=>setS(p=>({...p,indoorUnits:[...p.indoorUnits,{name:"",kw:2.5}]}))}>+ Innengeraet</button>
        <div className="form-row" style={{ marginTop:12 }}>
          <label>Zugeordnete Einheit</label>
          <select value={s.target} onChange={e=>upd("target",parseInt(e.target.value))} style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:4, padding:"7px 10px", fontSize:13, fontFamily:"inherit" }}>
            {Array.from({length:unitCount},(_,i)=><option key={i} value={i}>Einheit {i+1}</option>)}
          </select>
        </div>
        <div className="btn-row">
          {set && <button className="btn btn-danger" onClick={onDelete}>Loeschen</button>}
          <button className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-primary" onClick={()=>onSave(s)}>Speichern</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [temp, setTemp]             = useState(-10);
  const [indoorTemp, setIndoorTemp] = useState(INDOOR_TEMP);
  const [baseWatt, setBaseWatt]     = useState(BASE_WATT);
  const [units, setUnits]           = useState(defaultUnits);
  const [sets, setSets]             = useState(()=>SETS.map(s=>({...s})));
  const [tab, setTab]               = useState(0);
  const [collapsed, setCollapsed]   = useState({});
  const toggle = k => setCollapsed(p=>({...p,[k]:!p[k]}));
  const [editUnit, setEditUnit]     = useState(null);
  const [editSet, setEditSet]       = useState(null);
  const [detailSet, setDetailSet]   = useState(null);

  const watt = Math.round(baseWatt*(indoorTemp-temp)/(INDOOR_TEMP+10));
  const calc = units.map(u=>{
    const rooms=u.rooms.map(r=>({...r,volume:r.area*ROOM_HEIGHT,
      loadMin:Math.round(r.area*baseWatt*(indoorTemp-10)/(INDOOR_TEMP+10)),
      loadMax:Math.round(r.area*baseWatt*(indoorTemp+10)/(INDOOR_TEMP+10)),
      loadCur:Math.round(r.area*watt)}));
    const tot=rooms.reduce((s,r)=>s+r.area,0);
    return {...u,rooms,totalArea:tot,totalVolume:tot*ROOM_HEIGHT,
      totalMin:Math.round(tot*baseWatt*(indoorTemp-10)/(INDOOR_TEMP+10)),
      totalMax:Math.round(tot*baseWatt*(indoorTemp+10)/(INDOOR_TEMP+10)),
      totalCur:Math.round(tot*watt)};
  });
  const grandArea=calc.reduce((s,u)=>s+u.totalArea,0);
  const grandCur=Math.round(grandArea*watt);

  const saveUnit=data=>{if(editUnit==="new")setUnits(p=>[...p,data]);else setUnits(p=>p.map((u,i)=>i===editUnit?data:u));setEditUnit(null);};
  const deleteUnit=()=>{const idx=editUnit;setUnits(p=>p.filter((_,i)=>i!==idx));setSets(p=>p.filter(s=>s.target!==idx).map(s=>({...s,target:s.target>idx?s.target-1:s.target})));setEditUnit(null);};
  const saveSet=data=>{if(editSet==="new")setSets(p=>[...p,data]);else setSets(p=>p.map((s,i)=>i===editSet?data:s));setEditSet(null);};
  const deleteSet=()=>{setSets(p=>p.filter((_,i)=>i!==editSet));setEditSet(null);};

  if(detailSet) return (<><style>{css}</style><div className="app"><div className="inner"><DeviceDetail s={detailSet} temp={temp} calc={calc} units={units} onBack={()=>setDetailSet(null)} /></div></div></>);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="inner">
          <div style={{ marginBottom:20 }}><h1>HEIZLASTBERECHNUNG</h1><p style={{ fontSize:13, color:"var(--accent)", margin:"2px 0 2px" }}>Wittwer</p><p className="sub">Raumhoehe: {ROOM_HEIGHT} m · {baseWatt} W/m2 Basis · Innen {indoorTemp} C / Aussen {temp} C</p></div>
          <div className="tab-row">
            {["Heizlast & Raeume","Aussengeraete"].map((t,i)=>(<button key={i} className={"tab"+(tab===i?" active":"")} onClick={()=>setTab(i)}>{t}</button>))}
          </div>

          {[
            {label:"Aussentemp.",min:-15,max:15, step:1,value:temp,      onChange:e=>setTemp(Number(e.target.value)),      color:"#3b82f6",valLabel:temp+" C",      subLabel:watt+" W/m2"},
            {label:"Innentemp.", min:15, max:30, step:1,value:indoorTemp,onChange:e=>setIndoorTemp(Number(e.target.value)),color:"#10b981",valLabel:indoorTemp+" C",subLabel:"Innenraum"},
            {label:"Heizlast",   min:90, max:200,step:5,value:baseWatt,  onChange:e=>setBaseWatt(Number(e.target.value)),  color:"#ef4444",valLabel:baseWatt+" W/m2",subLabel:"bei -10 C"},
          ].map(({label,min,max,step,value,onChange,color,valLabel,subLabel},idx)=>{
            const pct=((value-min)/(max-min))*100;
            return (
              <div key={idx} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 20px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                  <span style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1 }}>{label}</span>
                  <div><span style={{ fontSize:17, fontWeight:700, color }}>{valLabel}</span><span style={{ fontSize:11, color:"var(--muted)", marginLeft:8 }}>{subLabel}</span></div>
                </div>
                <div style={{ position:"relative", height:20, display:"flex", alignItems:"center" }}>
                  <div style={{ position:"absolute", left:0, right:0, height:4, background:"#1e293b", borderRadius:4 }} />
                  <div style={{ position:"absolute", left:0, width:pct+"%", height:4, background:color, borderRadius:4 }} />
                  <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} style={{ position:"absolute", left:0, right:0, width:"100%", opacity:0, height:20, cursor:"pointer", margin:0 }} />
                  <div style={{ position:"absolute", left:"calc("+pct+"% - 10px)", width:20, height:20, borderRadius:"50%", background:color, border:"3px solid var(--bg)", boxShadow:"0 0 0 2px "+color, pointerEvents:"none" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                  <span style={{ fontSize:10, color:"#334155" }}>{min}{label==="Heizlast"?" W/m2":" C"}</span>
                  <span style={{ fontSize:10, color:"#334155" }}>{max}{label==="Heizlast"?" W/m2":" C"}</span>
                </div>
              </div>
            );
          })}

          <div className="grand" style={{ marginTop:16, marginBottom:24 }}>
            <div><span style={{ fontSize:14, fontWeight:700 }}>Gesamtheizlast</span><span style={{ fontSize:11, color:"var(--muted)", marginLeft:10 }}>{grandArea} m2</span></div>
            <span style={{ fontSize:18, fontWeight:700, color:"var(--accent)" }}>{fmt(grandCur)}</span>
          </div>

          {tab===0 && (<>
            {calc.map((u,i)=>{
              const unitSets=sets.filter(s=>s.target===i);
              return (
                <div className="unit-block" key={i}>
                  <div className="card">
                    <div className="card-hdr" onClick={()=>toggle("unit-"+i)}>
                      <div>
                        <span style={{ fontSize:12, color:"var(--muted)", marginRight:8 }}>{collapsed["unit-"+i]?"▶":"▼"}</span>
                        <span style={{ fontSize:14, fontWeight:700 }}>{u.name}</span>
                        <span style={{ fontSize:11, color:"var(--muted)", marginLeft:10 }}>{u.split}</span>
                        <button className="edit-btn" onClick={e=>{e.stopPropagation();setEditUnit(i);}}>Bearbeiten</button>
                      </div>
                      <span style={{ fontSize:11, color:"var(--muted)" }}>{u.totalArea} m2 · {fmt(u.totalCur)}</span>
                    </div>
                    {!collapsed["unit-"+i] && (
                      <table>
                        <thead><tr><th className="l">Raum</th><th className="r">m2</th><th className="r">m3</th><th className="r">+10C</th><th className="r">-10C</th><th className="rp">@ {temp}C</th></tr></thead>
                        <tbody>
                          {u.rooms.map((r,j)=>(
                            <tr key={j} className="body-row">
                              <td className="l">{r.name}</td><td className="r">{r.area}</td>
                              <td className="r" style={{ color:"var(--muted)" }}>{r.volume.toFixed(1)}</td>
                              <td className="r" style={{ color:"var(--muted)" }}>{fmt(r.loadMin)}</td>
                              <td className="r" style={{ color:"var(--muted)" }}>{fmt(r.loadMax)}</td>
                              <td className="rp" style={{ fontWeight:600, color:"var(--accent2)" }}>{fmt(r.loadCur)}</td>
                            </tr>
                          ))}
                          <tr className="total-row">
                            <td className="l">Gesamt</td><td className="r">{u.totalArea}</td>
                            <td className="r" style={{ color:"var(--muted)" }}>{u.totalVolume.toFixed(1)}</td>
                            <td className="r">{fmt(u.totalMin)}</td><td className="r">{fmt(u.totalMax)}</td>
                            <td className="rp" style={{ color:"var(--accent)" }}>{fmt(u.totalCur)}</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                  {unitSets.length>0 && (
                    <div className="card">
                      <div className="blue-hdr" onClick={()=>toggle("sets-"+i)}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:12, color:"var(--accent2)" }}>{collapsed["sets-"+i]?"▶":"▼"}</span>
                          <span style={{ fontSize:13, fontWeight:700, color:"var(--accent2)", letterSpacing:.5 }}>ABGLEICH AUSSENGERAETE</span>
                        </div>
                        <span style={{ fontSize:11, color:"var(--muted)" }}>Heizlast: {fmt(u.totalCur)}</span>
                      </div>
                      {!collapsed["sets-"+i] && (<>
                        <div style={{ overflowX:"auto" }}>
                          <table style={{ fontSize:12 }}>
                            <thead><tr>
                              <th className="l" title="Geraet bzw. Innengeraet">Geraet / Innengeraet</th>
                              <th className="r" title="Minimale Heizleistung – untere Regelgrenze des Aussengeraets">Min</th><th className="r" title="Nennheizleistung bei +7 C Aussentemperatur nach EN 14511 – Pruefstandard fuer SCOP">Nenn +7C</th><th className="r" title="Heizleistung bei -10 C Aussentemperatur – massgebend fuer die Auslegung in der Heizlastberechnung">Spez. -10C</th><th className="r" title="Maximale Heizleistung des Aussengeraets">Max</th>
                              <th className="r" title={"Berechnete Heizleistung bei "+temp+" C Aussentemperatur"}>@ {temp}C</th><th className="r" title="Seasonal Coefficient of Performance – saisonale Heizeffizienz nach EN 14825">SCOP</th><th className="rp" title="Wie gut das Geraet die Gesamtheizlast abdeckt (100 % = vollstaendige Deckung)">Deckung</th>
                            </tr></thead>
                            <tbody>
                              {unitSets.map((s,si)=>{
                                const capNow=capacityAtTemp(s,temp), cover=u.totalCur>0?(capNow*1000/u.totalCur)*100:999;
                                const iuTot=(s.indoorUnits||[]).reduce((a,x)=>a+(Number(x.kw)||0),0)||1;
                                const iuHeatTot=(s.indoorUnits||[]).reduce((a,x)=>a+(Number(x.heat_kw)||0),0)||1;
                                return (
                                  <React.Fragment key={si}>
                                    <tr className="body-row">
                                      <td className="l"><span className="dev-link" style={{ fontWeight:600 }} onClick={()=>setDetailSet(s)}>{s.name}</span></td>
                                      <td className="r" style={{ color:"var(--muted)" }}>{n(s.heat_min_kw)} kW</td>
                                      <td className="r" style={{ color:"var(--muted)" }}>{n(s.heat_nom_kw)} kW</td>
                                      <td className="r" style={{ color:"#a78bfa", fontWeight:600 }}>{n(s.heat_m10_kw)} kW</td>
                                      <td className="r" style={{ color:"var(--muted)" }}>{n(s.heat_max_kw)} kW</td>
                                      <td className="r" style={{ fontWeight:600 }}>{capNow.toFixed(1)} kW</td>
                                      <td className="r" style={{ color:"var(--accent2)", fontWeight:600 }}>{n(s.scop,2)}</td>
                                      <td className="rp"><CoverageBar percent={cover} /></td>
                                    </tr>
                                    {(s.indoorUnits||[]).map((iu,iui)=>{
                                      const roomName=(iu.name.match(/\(([^)]+)\)/)||[])[1]||"";
                                      const room=(calc[s.target]?.rooms||[]).find(r=>r.name===roomName);
                                      const iuCapM10=(Number(iu.heat_kw)||0)/iuHeatTot*(Number(s.heat_m10_kw)||0);
                                      const iuCover=room&&room.loadMax>0?(iuCapM10*1000/room.loadMax)*100:null;
                                      const iuCol=iuCover===null?"var(--muted)":iuCover>=120?"#10b981":iuCover>=100?"#22c55e":iuCover>=80?"#f59e0b":"#ef4444";
                                      return (
                                      <tr key={"iu-"+si+"-"+iui} className="inner-row">
                                        <td className="l" style={{ paddingLeft:36, fontSize:11, color:"var(--muted)" }}><span style={{ color:"#475569", marginRight:6 }}>└</span>{iu.name}</td>
                                        <td className="r"/>
                                        <td className="r" style={{ fontSize:11, color:"var(--muted)" }}>{iu.heat_kw ? Number(iu.heat_kw).toFixed(1)+" kW" : ""}</td>
                                        <td colSpan={4}/>
                                        <td className="rp" style={{ fontSize:11, fontWeight:600, color:iuCol }}>{iuCover!==null?Math.round(iuCover)+"%":"–"}</td>
                                      </tr>
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="legend"><span style={{ color:"#10b981" }}>■</span> ≥120% <span style={{ color:"#22c55e" }}>■</span> ≥100% <span style={{ color:"#f59e0b" }}>■</span> ≥80% <span style={{ color:"#ef4444" }}>■</span> &lt;80% · Geraetnamen anklicken fuer Detailseite</div>
                      </>)}
                    </div>
                  )}
                </div>
              );
            })}
            <button className="add-btn" onClick={()=>setEditUnit("new")}>+ Neue Einheit hinzufuegen</button>
            <p className="disclaimer">{baseWatt} W/m2 Basis bei -10 C / {indoorTemp} C innen · Kapazitaetskurve interpoliert zwischen Nenn +7C und Spez. -10C · SCOP gemäss EN14825</p>
          </>)}

          {tab===1 && (<>
            {sets.map((s,i)=>{
              const capNow=capacityAtTemp(s,temp);
              const targetUnit=units[s.target];
              const targetLoad=targetUnit?calc[s.target].totalCur:0;
              const cover=targetLoad>0?Math.round((capNow*1000/targetLoad)*100):0;
              const coverCol=cover>=120?"#10b981":cover>=100?"#22c55e":cover>=80?"#f59e0b":"#ef4444";
              const specs=[
                ["Zugeordnet", targetUnit?.name||"-"],
                ["Heizen Min/Nenn/Max", n(s.heat_min_kw)+" / "+n(s.heat_nom_kw)+" / "+n(s.heat_max_kw)+" kW"],
                ["Heizen @ -10°C (spez.)", n(s.heat_m10_kw)+" kW"],
                ["Heizen @ "+temp+"°C (interpol.)", capNow.toFixed(1)+" kW"],
                ["SCOP / Pdesignh", n(s.scop,2)+" / "+(s.pdesignh?n(s.pdesignh)+" kW":"-")],
                ["Effizienzklasse Heizen", s.energy_class_heat||"-"],
                ["Energiebedarf Heizen", s.energy_annual_heat?s.energy_annual_heat+" kWh/a":"-"],
                ["Betriebsbereich Heizen", s.op_heat_min!=null?s.op_heat_min+"°C bis +"+s.op_heat_max+"°C":"-"],
                ["Leistungsaufnahme Heizen", s.power_input_heat||"-"],
                ["Kuehlen Min/Nenn/Max", n(s.cool_min_kw)+" / "+n(s.cool_nom_kw)+" / "+n(s.cool_max_kw)+" kW"],
                ["SEER / Pdesignc", n(s.seer,2)+" / "+(s.pdesignc?n(s.pdesignc)+" kW":"-")],
                ["Effizienzklasse Kuehlen", s.energy_class_cool||"-"],
                ["Energiebedarf Kuehlen", s.energy_annual_cool?s.energy_annual_cool+" kWh/a":"-"],
                ["Betriebsbereich Kuehlen", s.op_cool_min!=null?s.op_cool_min+"°C bis +"+s.op_cool_max+"°C":"-"],
                ["Leistungsaufnahme Kuehlen", s.power_input_cool||"-"],
                ["Kaeltemittel", s.refrigerant||"-"],
                ["Kaeltemittelfuellmenge", s.refrigerant_amount||"-"],
                ["Max. Leitungslaenge", s.pipe_length_max||"-"],
                ["Abmessungen (H x B x T)", s.dimensions||"-"],
                ["Gewicht", s.weight||"-"],
                ["Schalldruck Kuehlen / Heizen", s.noise_cool!=null?s.noise_cool+" / "+s.noise_heat+" dB(A)":"-"],
                ["Schallleistung Kuehlen / Heizen", s.sound_power_cool!=null?s.sound_power_cool+" / "+s.sound_power_heat+" dB(A)":"-"],
                ["BAFA Foerderung", s.bafa||"-"],
              ];
              return (
                <div className="card" key={i} style={{ marginBottom:16 }}>
                  <div className="blue-hdr">
                    <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:6 }}>
                      <span className="dev-link" style={{ fontSize:14, fontWeight:700, color:"var(--accent2)", letterSpacing:.3 }} onClick={()=>setDetailSet(s)}>{s.name}</span>
                      {s.bafa && s.bafa.startsWith("Ja") && (
                        <span style={{ background:"#064e3b", border:"1px solid #10b981", color:"#10b981", borderRadius:4, padding:"1px 7px", fontSize:9, fontWeight:700, letterSpacing:.7, whiteSpace:"nowrap" }}>BAFA-FOERDERBAR</span>
                      )}
                      <button className="edit-btn" onClick={()=>setEditSet(i)}>Bearb.</button>
                    </div>
                    <span style={{ fontSize:11, color:"var(--muted)" }}>Heizlast {targetUnit?.name||"-"}: {fmt(targetLoad)} · Deckung @ {temp}°C: <b style={{ color:coverCol }}>{cover}%</b></span>
                  </div>
                  <div style={{ padding:"14px 20px", display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"6px 24px" }}>
                    {specs.map(([l,v])=>(
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", borderBottom:"1px dashed var(--border)", padding:"4px 0", fontSize:11 }}>
                        <span style={{ color:"var(--muted)" }}>{l}</span>
                        <span style={{ fontWeight:600, textAlign:"right" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:"10px 20px 14px", borderTop:"1px solid var(--border)" }}>
                    <div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", marginBottom:6, letterSpacing:.5 }}>Innengeraete</div>
                    <table style={{ fontSize:12 }}>
                      <tbody>
                        {(s.indoorUnits||[]).map((iu,iui)=>(
                          <tr key={iui} className="body-row">
                            <td className="l" style={{ paddingLeft:0 }}>{iu.name}</td>
                            <td className="rp" style={{ color:"#3b82f6", fontWeight:600 }}>{(Number(iu.kw)||0).toFixed(1)} kW</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {s.shopUrl && <div style={{ marginTop:10, fontSize:11 }}><a href={s.shopUrl} target="_blank" rel="noopener noreferrer" style={{ color:"var(--accent2)", textDecoration:"underline", textDecorationStyle:"dotted" }}>→ Produktseite breeze24.com</a>{s.note && <span style={{ color:"var(--muted)", marginLeft:8 }}>· {s.note}</span>}</div>}
                  </div>
                </div>
              );
            })}
            <button className="add-btn" onClick={()=>setEditSet("new")}>+ Neues Aussengeraet hinzufuegen</button>
          </>)}
        </div>
      </div>
      {editUnit!==null && <UnitModal unit={editUnit==="new"?null:units[editUnit]} onSave={saveUnit} onDelete={editUnit!=="new"?deleteUnit:undefined} onClose={()=>setEditUnit(null)} />}
      {editSet!==null  && <SetModal  set={editSet==="new"?null:sets[editSet]}    unitCount={units.length} onSave={saveSet}  onDelete={editSet!=="new"?deleteSet:undefined}   onClose={()=>setEditSet(null)} />}
    </>
  );
}
