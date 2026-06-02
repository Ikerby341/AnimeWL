# Client d'AnimeWL

Aquest directori conté el frontend web d'AnimeWL. És una aplicació feta amb React, Vite i React Router que permet consultar animes, veure'n el detall, gestionar el perfil d'usuari, guardar favorits, valorar sèries, registrar el progrés de visualització i administrar la sessió.

## Tecnologies principals

- React 19 per construir la interfície.
- Vite 7 com a servidor de desenvolupament i eina de build.
- React Router per definir les rutes de l'aplicació.
- Framer Motion i React Icons per animacions i icones.
- Vitest per proves unitàries.
- ESLint per revisar l'estil del codi.

## Com executar el client

1. Instal·la dependències:

```bash
npm install
```

2. Crea un fitxer `.env` si cal apuntar a un backend concret:

```env
VITE_BACKENDURL=http://localhost:3000
```

3. Arrenca el client:

```bash
npm run dev
```

El mode de desenvolupament executa primer les proves i després aixeca Vite.

## Scripts disponibles

- `npm run dev`: executa les proves i inicia Vite.
- `npm run build`: genera la versió de producció a `client/dist`.
- `npm run preview`: executa les proves i serveix la build localment.
- `npm run test`: llança les proves amb Vitest.
- `npm run lint`: revisa el projecte amb ESLint.

## Estructura general

- `public/index.html`: punt d'entrada HTML de l'aplicació.
- `public/favicon.ico`: icona del lloc.
- `public/robots.txt` i `public/sitemap.xml`: fitxers per a indexació i SEO.
- `src/main.jsx`: inicialitza React, activa el router i instal·la el `fetch` autenticat.
- `src/App.jsx`: declara totes les rutes de pantalla i envolta l'app amb els providers d'autenticació i notificacions.
- `src/assets`: imatges pròpies del projecte, com el logotip i imatges per defecte d'usuari.
- `src/styles`: fulls CSS globals i específics de cada pantalla.
- `vite.config.js`: configura Vite amb `public` com a root, l'àlies `/src`, el proxy `/api` cap al backend i la sortida de build.
- `eslint.config.js`: configuració d'ESLint.
- `package.json` i `package-lock.json`: dependències, scripts i versions bloquejades.

## Rutes de l'aplicació

- `/`: pàgina d'inici amb carrusel d'animes recents, secció d'animes en emissió i blocs per gènere.
- `/login`: formulari d'inici de sessió.
- `/register`: formulari de registre.
- `/directory`: directori paginat d'animes amb filtres per gènere.
- `/favorites`: llista personal de favorits i estat de seguiment.
- `/animedle`: joc diari autenticat per endevinar un anime a partir de la portada desenfocada.
- `/profile`: zona privada de perfil, configuració i estadístiques.
- `/profile/:userId`: perfil públic d'un altre usuari.
- `/details/:id`: fitxa d'un anime amb sinopsi, comentaris, valoracions, favorits i progrés.
- `/forgot-password`: sol·licitud de recuperació de contrasenya.
- `/reset-password`: canvi de contrasenya mitjançant token.
- `/terminos-y-condiciones`: pàgina legal de termes i condicions.
- `/politica-de-privacidad`: pàgina legal de privacitat.

## Contextos, hooks i utilitats

- `contexts/AuthContext.jsx`: manté l'usuari autenticat, comprova la sessió, fa login i logout, i sincronitza el token retornat pel servidor.
- `contexts/AuthContext.js`: exporta el context perquè altres fitxers el puguin consumir.
- `contexts/ToastContext.jsx`: gestiona notificacions temporals de l'aplicació.
- `contexts/ToastContext.js`: exporta el context de notificacions.
- `hooks/useAuth.js`: exposa helpers per accedir a l'autenticació, saber si hi ha sessió i llegir dades de l'usuari.
- `hooks/useToast.js`: facilita mostrar missatges de notificació.
- `utils/authTokenFetch.js`: intercepta `window.fetch` per afegir el bearer token a les crides `/api`, guardar tokens renovats i netejar-los en respostes `401`.

## Pàgines

- `pages/home.jsx`: carrega animes recents, animes en emissió i blocs per gènere.
- `pages/directory.jsx`: mostra el catàleg complet amb paginació i filtre de gèneres.
- `pages/details.jsx`: coordina la càrrega de detall, comentaris, rating, progrés i favorits d'un anime.
- `pages/favorites.jsx`: mostra i permet actualitzar els animes favorits de l'usuari.
- `pages/Animedle.jsx`: mostra el repte diari, suggeriments de títols i historial d'intents de l'usuari.
- `pages/profile.jsx`: organitza les vistes del perfil privat.
- `pages/publicProfile.jsx`: mostra dades públiques i favorits visibles d'un usuari.
- `pages/login.jsx` i `pages/register.jsx`: munten els formularis d'accés i registre.
- `pages/ForgotPassword.jsx` i `pages/ResetPassword.jsx`: gestionen la recuperació de contrasenya.
- `pages/Terms.jsx` i `pages/Privacy.jsx`: mostren textos legals.

## Components

- `NavBar`: barra superior amb navegació, cerca d'anime i menú de perfil.
- `Footer`: peu de pàgina del lloc.
- `ButtonNavBar`: botó reutilitzable per accions de navegació.
- `LoginForm` i `RegisterForm`: formularis connectats als endpoints d'autenticació.
- `Carrusel`: carrusel responsive per destacar animes.
- `AnimeCarruselCard`: targeta usada dins dels carrusels.
- `AnimeCover` i `AnimeCoverInLine`: representacions visuals d'anime en format targeta o línia.
- `AnimeDetails`: vista completa d'un anime amb dades, accions, valoració, progrés i comentaris.
- `AnimeComments`: llista, crea i elimina comentaris d'un anime.
- `Perfil`: mostra i edita dades principals del perfil, foto, anime preferit i anime recomanat.
- `ProfilePage`: canvia entre perfil, configuració i estadístiques.
- `Configuracion`: permet canviar nom d'usuari, email i contrasenya.
- `Estadisticas`: resumeix temps vist, capítols, animes acabats i gèneres principals.
- `Icons`: icones SVG pròpies per editar, eliminar, favorits, cor i disc.

## Estils

Els fitxers de `src/styles` defineixen l'estil de pantalles globals com home, login, registre, directori, favorits, perfil, pàgines legals, recuperació de contrasenya i notificacions. Els components amb carpeta pròpia també tenen el seu CSS al costat del JSX per mantenir cada peça visual agrupada.

## Connexió amb el servidor

El client consumeix el backend a través de `import.meta.env.VITE_BACKENDURL`. Les crides principals apunten a endpoints com `/api/anime`, `/api/anime/airing/:limit`, `/api/animedle`, `/api/animedle/suggestions`, `/api/jikan/search`, `/api/login`, `/api/session`, `/api/user/favorites`, `/api/anime/:id/comments`, `/api/anime/:id/rating` i `/api/anime/:id/progress`.

En desenvolupament, `vite.config.js` també configura un proxy perquè les rutes `/api` es redirigeixin al servidor Express.

## Proves

Hi ha proves unitàries per helpers d'estadístiques a `src/components/Estadisticas/statsHelpers.test.js`. Es poden executar amb:

```bash
npm run test
```
