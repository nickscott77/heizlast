# Heizlastberechnung – Projektregeln

## Branches

- **Feature-Branch** (Entwicklung): `claude/analyze-scripts-Pw4yW`
- **Deployment-Branch** (GitHub Pages): `claude/setup-environment-LIkkc`

## Automatisches Deployment

Nach jeder Änderung, die committed wurde, immer automatisch:

1. Commit auf `claude/analyze-scripts-Pw4yW` pushen
2. Pull Request von `claude/analyze-scripts-Pw4yW` nach `claude/setup-environment-LIkkc` erstellen
3. PR sofort mit squash merge zusammenführen

Kein explizites Benutzer-Kommando erforderlich – das passiert automatisch nach jeder Änderung.
