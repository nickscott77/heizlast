# Heizlastberechnung

Eine browserbasierte React-App zur Berechnung des Heizwärmebedarfs von Räumen und zum Abgleich passender Luft-Wasser-Wärmepumpen bzw. Multisplit-Klimaanlagen.

## Funktionsweise

### Heizlastberechnung

Die Heizlast je Raum wird nach folgender vereinfachter Formel ermittelt:

```
Heizlast [W] = Fläche [m²] × Basislast [W/m²] × (Innentemperatur - Außentemperatur) / 30
```

Der Divisor 30 ergibt sich aus der Referenzdifferenz: Innen +20 °C, Außen -10 °C = 30 K.

**Einstellbare Parameter (Schieberegler):**

| Parameter | Bereich | Standard |
|---|---|---|
| Außentemperatur | -15 °C bis +15 °C | -10 °C |
| Innentemperatur | +15 °C bis +30 °C | +20 °C |
| Basislast | 90–200 W/m² | 100 W/m² |

Die Heizlast wird für jeden Raum und jede Wohneinheit in Echtzeit neu berechnet, sobald ein Regler bewegt wird.

### Kapazitätskurve der Außengeräte

Die Heizleistung einer Wärmepumpe sinkt mit fallender Außentemperatur. Die App berechnet dies durch lineare Interpolation zwischen zwei Herstellerangaben gemäß EN 14825:

- **Nennleistung bei +7 °C** (`heat_nom_kw`)
- **Spezifizierte Leistung bei -10 °C** (`heat_m10_kw`)

```
Steigung = (Nennleistung − Leistung@−10°C) / 17
Kapazität(t) = clamp(Min, Max,  Leistung@−10°C + (t + 10) × Steigung)
```

Das Ergebnis wird auf die Mindest- und Maximalleistung des Geräts begrenzt.

### Deckungsgrad

Der Deckungsgrad gibt an, wie gut ein Außengerät die berechnete Heizlast einer Wohneinheit bei der gewählten Außentemperatur abdeckt:

```
Deckung [%] = Kapazität(t) [kW] × 1000 / Heizlast [W] × 100
```

| Farbe | Bedeutung |
|---|---|
| Grün (≥ 120 %) | Gerät hat deutliche Reserve |
| Hellgrün (≥ 100 %) | Gerät deckt die Last vollständig |
| Gelb (≥ 80 %) | Gerät deckt die Last knapp |
| Rot (< 80 %) | Gerät ist unterdimensioniert |

---

## Aufbau der App

### Wohneinheiten

Jede Wohneinheit besteht aus mehreren Räumen mit Name und Fläche in m². Die App berechnet automatisch:

- Raumvolumen (Fläche × 2,3 m Raumhöhe)
- Heizlast bei +10 °C, -10 °C und der aktuell gewählten Außentemperatur
- Gesamtheizlast der Einheit

Wohneinheiten können über einen Dialog angelegt, bearbeitet und gelöscht werden.

### Außengeräte

Jedem Außengerät ist eine Wohneinheit zugeordnet (`target`). Es enthält:

- Heizleistungskennwerte: Minimum, Nennleistung (+7 °C), Leistung bei -10 °C, Maximum, SCOP
- Kühlleistungskennwerte: Minimum, Nennleistung, Maximum, SEER
- Energieklassen, Betriebsbereiche, Abmessungen, Gewicht, Schallwerte
- Kältemittel und Füllmenge, maximale Leitungslänge
- BAFA-Förderfähigkeit
- Liste der zugehörigen Innengeräte mit deren Nennleistung

### Gerätevergleich

Im Tab **"Heizlast & Räume"** werden alle Außengeräte, die einer Wohneinheit zugeordnet sind, direkt unterhalb der Raumtabelle als Abgleich angezeigt — inklusive Leistungswerten bei der aktuellen Außentemperatur und Deckungsgrad.

Im Tab **"Außengeräte"** sind alle Geräte in einer Gesamtübersicht gelistet.

### Detailansicht

Ein Klick auf den Gerätenamen öffnet eine vollständige Detailseite mit:

- Kapazitätskurve als Balkendiagramm über den Temperaturbereich -15 °C bis +15 °C
- Modulationsbereich (Verhältnis Mindest- zu Maximalleistung)
- Deckungsabgleich für alle Wohneinheiten
- Vollständige technische Daten des Außengeräts
- Auflistung und Anteil der Innengeräte

---

## Technischer Aufbau

| Datei | Zweck |
|---|---|
| `index.html` | Standalone-Version, läuft direkt im Browser (React + Babel via CDN) |
| `heizlast.tsx` | Modulversion für Build-Umgebungen (Vite, Next.js o. ä.) |

Die App nutzt ausschließlich React `useState` für den Zustand — es gibt keine externe Datenbankanbindung. Änderungen an Einheiten und Geräten werden nicht persistiert und gehen beim Reload verloren.

---

## Vordefinierte Geräte

| Gerät | Typ | SCOP | Heizmax | BAFA |
|---|---|---|---|---|
| Mitsubishi Electric MXZ-3F54VF4 | 3-fach Multisplit | 4,31 | 9,0 kW | Nein |
| Daikin 3MXM52A | 3-fach Multisplit | 4,65 | 8,2 kW | Nein |
| Mitsubishi Heavy SCM41ZS-W | 3-fach Multisplit | 4,60 | 6,9 kW | Ja |
| Mitsubishi Heavy SCM30ZS-W | 2-fach Multisplit | 4,80 | 5,7 kW | Ja |
| Daikin 2MXM50A | 2-fach Multisplit | 4,60 | 5,6 kW | Ja |
| Panasonic CU-2Z35CBE | 2-fach Multisplit | 4,60 | 5,6 kW | Ja |

---

## Hinweise

- Die Heizlastberechnung ist eine vereinfachte Schätzung und ersetzt keine normgerechte Berechnung nach DIN EN 12831.
- Kapazitätswerte der Geräte sind linear zwischen Nennleistung (+7 °C) und Herstellerangabe bei -10 °C interpoliert.
- Alle Angaben ohne Gewähr.
