# Mathéo Gros / Portfolio

Portfolio d'ingénieur IA & Data Science : la donnée et l'IA au service de la Tech Strategy.

Site statique écrit à la main en HTML, CSS et JavaScript, sans framework ni dépendance. L'identité visuelle reprend les codes de macOS (barre de menus, Dock, Spotlight, fenêtres) et les formes des graphiques Google.

## Ce qu'il y a dedans

- **3 animations canvas** dans le hero : données brutes vers monitoring, données vers modèle vers décisions, documents vers RAG vers LLM. Chaque image est calculée à partir du temps, ce qui permet de sauter à n'importe quelle étape.
- **Parcours** affiché partie par partie : la section reste fixe et change au scroll (expériences, formation, engagements).
- **Compétences** rangées en colonnes par catégorie, chacune reliée aux expériences et projets où elle a été utilisée.
- **Carrousel de projets** qui s'ouvre dans une fausse fenêtre de navigateur.
- **Spotlight** (`Ctrl K` / `⌘K`) pour chercher un projet, une compétence ou une expérience.
- Accessibilité : navigation au clavier, attributs ARIA, respect de `prefers-reduced-motion`. Mise en page responsive.

## Structure

```
index.html        structure de la page
css/style.css     styles (variables de couleur dans :root)
js/data.js        tout le contenu éditable : parcours, compétences, projets
js/scenes.js      moteur et scènes des animations canvas
js/app.js         interactions : parcours, compétences, carrousel, navigateur, Spotlight, Dock
assets/           photo et logos
```

## Lancer en local

```bash
python -m http.server 5500
```

Puis ouvrir http://localhost:5500.

## Modifier le contenu

Tous les textes sont dans `js/data.js`. Après une modification du CSS ou du JS, augmenter le numéro `?v=` dans `index.html` pour que les navigateurs rechargent les fichiers.
