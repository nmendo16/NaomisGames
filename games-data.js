/* =========================================================================
   games-data.js — static per-game info (from Game Project  Static Info.csv)
   =========================================================================
   Each game carries EXPLICIT filenames (not guessed/numbered) for its
   optional assets, taken straight from the CSV columns:

     - docFiles:   the "document" columns  -> shown as downloadable rows
                   on the Documentations screen, below Repository.
     - devImages:  the "development" columns -> shown in the two image
                   columns on the Documentations screen (up to 4).
     - videoFiles: the "videos" columns -> shown as playable tiles on the
                   Demos and Videos screen (any number, grid scrolls).

   All three live inside the game's folders:
     docFiles / devImages -> files/game-N/<filename>
     videoFiles           -> videos/game-N/<filename>

   Every filename is checked for existence at runtime (see asset-utils.js
   fileExists) before it's shown, so nothing 404s if a file hasn't been
   uploaded yet — it just doesn't appear. Filenames must match the real
   files on disk EXACTLY, including case and spaces (e.g. "critical_alert.JPG",
   "Game Jam - March, Mon. and Tue. , 2026.pdf").
   ========================================================================= */

export const GAMES = [
  {
    id: 'game-1',
    title: 'A.D.A.M.',
    shortDesc:
      'Advanced Drone Asteroid Miner is a 3D space mining action game where you pilot a drone through an asteroid field, mine valuable ore, and race back to base before your fuel or hull runs out.',
    role: 'AI Feature Developer',
    technologies: 'JS, Express5, GraphQL, Apollo Server, MongoDB, JWT, rendr.com',
    playUrl: 'https://adam-client.onrender.com',
    repoUrl: 'https://github.com/SXY200010/COMP308_Final/',
    previewImages: ['images/image1.png'],
    assetsDir: 'files/game-1',
    videosDir: 'videos/game-1',
    docFiles: ['A.D.A.M - Advanced Drone Asteroid Miner.pptx'],
    devImages: [
      'critical_alert.JPG',
      'layout_update.JPG',
      'left_pannel update.JPG',
      'mongodb_connection.JPG',
    ],
    videoFiles: [],
  },
  {
    id: 'game-2',
    title: "Canasian's Curl",
    shortDesc:
      '48hr Game Jam Project for Winter Games. Our studio represents the collaboration of one Canadian, 3 asian, and fascination with the sport: Curling.',
    role: 'Stone logic, Environment Assets, UI Assets',
    technologies: 'Unity VR, Meta Quest',
    playUrl: null,
    repoUrl: 'https://github.com/sduffney/WinterGameJam',
    previewImages: ['images/image2.png'],
    assetsDir: 'files/game-2',
    videosDir: 'videos/game-2',
    docFiles: ['Game Jam - March, Mon. and Tue. , 2026.pdf'],
    devImages: ['topview.jpg'],
    videoFiles: ['CanAsians CURL.mp4', 'stonetesting.mp4'],
  },
  {
    id: 'game-3',
    title: 'Polygunz',
    shortDesc:
      'You are the geometric defender against enemies that co-relates their strengths with their number of sides. From circles to dodecagons, enemy polygons rain down in endless waves.',
    role: 'Sole Developer',
    technologies: 'Unity 3D, C#, Github Pages',
    playUrl: 'https://nmendo16.github.io/COMP397/',
    repoUrl: 'https://github.com/nmendo16/COMP397',
    previewImages: ['images/image3.png'],
    assetsDir: 'files/game-3',
    videosDir: 'videos/game-3',
    docFiles: ['Mobile Game Proposal_Polyguns.docx', 'Project Part One GDD.docx'],
    devImages: [],
    videoFiles: ['ployguns.mp4', 'PrototypeforPolyguns.mp4'],
  },
  {
    id: 'game-4',
    title: 'S.N.A.C.K.S.',
    shortDesc:
      'Feed your traveling criter! Explore snacks around the world to gain power ups and solve each stage in a different country.',
    role: 'Player character animation, Environment Assets, concept developer, project lead',
    technologies: 'Unity, C#',
    playUrl: null,
    repoUrl: 'https://github.com/nmendo16/SNACKS',
    previewImages: ['images/image4.png'],
    assetsDir: 'files/game-4',
    videosDir: 'videos/game-4',
    docFiles: [],
    devImages: ['snack2.png', 'snacks1.png'],
    videoFiles: ['Final Presentation.webm', 'demorun.mp4'],
  },
  {
    id: 'game-5',
    title: 'Squidz',
    shortDesc:
      '2-player combat game where shooting your weapon is the only way to move. Control your recoil and may the best squid win.',
    role: 'UI Assets, Project Manager, Documentation, conceptualization',
    technologies: 'Unity, C#',
    playUrl: null,
    repoUrl: 'https://github.com/Raziel1991/Squidz',
    previewImages: ['images/image5.png'],
    assetsDir: 'files/game-5',
    videosDir: 'videos/game-5',
    docFiles: ['Team3_SquidzGDD3_Beta.pptx'],
    devImages: [],
    videoFiles: [
      'bloopWins.mp4',
      'inkyWins.mp4',
      'noWinsYet.mp4',
      'options.mp4',
      'pauseWorks.mp4',
    ],
  },
  {
    id: 'game-6',
    title: 'Toyrbo Race',
    shortDesc: 'A need-for-speed inspired car race inside the world of toys.',
    role: 'UI Assets for Stats, Menu, Timer, Laps Counter',
    technologies: 'Unreal Engine, Blueprint, C++',
    playUrl: null,
    repoUrl: 'https://github.com/SXY200010/ToyrboRace',
    previewImages: ['images/image6.png'],
    assetsDir: 'files/game-6',
    videosDir: 'videos/game-6',
    docFiles: [],
    devImages: ['menu.png', 'win.png'],
    videoFiles: ['endScene.mp4', 'start.mp4', 'startButt.mp4'],
  },
  {
    id: 'game-7',
    title: 'Type Dungeons',
    shortDesc: 'Educational game to challenge your typing skills.',
    role: 'UI Logic for Player Stats, Menu Layout Design, Enemy Logic, Documentation',
    technologies: 'Unity, C#',
    playUrl: 'https://andresac90.itch.io/type-dungeons?secret=VBfY5ldoo2vf2jOTbnv4iAXFI',
    repoUrl: 'https://github.com/HassanAbbud/Type-Dungeons',
    previewImages: ['images/image7.png'],
    assetsDir: 'files/game-7',
    videosDir: 'videos/game-7',
    docFiles: [],
    devImages: [],
    videoFiles: [
      'coin_system_progress.mp4',
      'enemyupdate.mp4',
      'ui and buttons.mp4',
      'ui_updates.mp4',
    ],
  },
  {
    id: 'game-8',
    title: 'What The Fish',
    shortDesc:
      'What the Fish?! is a single-player, 3D educational arcade sorting game based directly on the real-world sport fishing advisories of the Kalamazoo River.',
    role: 'Title Menu developer, Player Stats UI',
    technologies: 'Unity 3D, C#',
    playUrl: null,
    repoUrl: 'https://github.com/AngelicaCuadrado/COMP395_SEC1_SimulationDesign',
    previewImages: ['images/image8.png'],
    assetsDir: 'files/game-8',
    videosDir: 'videos/game-8',
    docFiles: ['GDD - What the Fish.docx', 'What the fish - Presentation.pptx'],
    devImages: [],
    videoFiles: ['endzone.mp4', 'latestPush.mp4', 'UIprogress.mp4'],
  },
  {
    id: 'game-9',
    title: 'Pong by Naomi',
    shortDesc: 'Play classic pong on space, vs AI, vs another Player, or vs 3 AIs.',
    role: 'Sole Developer',
    technologies: 'Unity, C#, Github Pages',
    playUrl: 'https://nmendo16.github.io/pong/',
    repoUrl: 'https://github.com/nmendo16/pong',
    previewImages: ['images/image9.png'],
    assetsDir: 'files/game-9',
    videosDir: 'videos/game-9',
    docFiles: [],
    devImages: [],
    videoFiles: [],
  },
];