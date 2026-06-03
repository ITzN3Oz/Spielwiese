import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "de" | "fr" | "es";

export interface TranslationDictionary {
  [key: string]: {
    [subKey: string]: string;
  } | string;
}

const translations: Record<Language, Record<string, any>> = {
  en: {
    nav: {
      overview: "Resource Monitoring",
      servers: "Manage Game Servers",
      install: "Install Server",
      backups: "Backup & Recovery",
      users: "Manage User Rights",
      api: "API Documentation",
      logout: "Log Out",
      login: "Log In",
      setup: "Super-Admin Setup",
      dockerIsolation: "Container Isolation: Active",
      updateSystem: "Update System: OK",
      hostOnline: "LINUX HOST ONLINE",
      headerOverview: "System Dashboard",
      headerServers: "Server Control",
      headerInstall: "Application Catalog",
      headerBackups: "Data Backups",
      headerUsers: "User Permissions",
      headerApi: "API Connection",
      atmosphere: "Background:",
      accentColor: "Theme Color:",
      quickInstall: "Install Server"
    },
    common: {
      status: "Status",
      actions: "Actions",
      save: "Save Changes",
      cancel: "Cancel",
      close: "Close",
      delete: "Delete",
      deletePermanently: "Delete Permanently",
      warning: "Warning",
      success: "Success",
      error: "Error",
      info: "Information",
      search: "Search",
      loading: "Loading...",
      enabled: "Enabled",
      disabled: "Disabled",
      none: "None"
    },
    login: {
      welcome: "Welcome to",
      subtitle: "Gameserver Labor Infrastructure Panel",
      username: "Username",
      password: "Password",
      roles: "Your session will automatically be mapped dynamically to the Linux sub-terminal.",
      submitting: "Logging in...",
      submitBtn: "SECURE SESSION LOGIN",
      setupRequired: "Initial Setup Needed",
      setupSubtitle: "Create the primary Super-Admin user to bootstrap the application database.",
      setupBtn: "FINISH SETUP & LOGIN",
      registering: "Registering admin..."
    },
    overview: {
      systemHealth: "System Health Overview",
      livePolling: "Live polling host telemetry to simulate Docker sub-modules",
      systemDetails: "Unified Linux System Core Details",
      cpuLoad: "CPU LOAD",
      cores: "Cores",
      ramUsage: "RAM USAGE",
      diskUsage: "DISK STORAGE",
      runningContainers: "RUNNING CONTAINERS",
      networkTraffic: "NETWORK TRAFFIC",
      dockerVersion: "DOCKER VERSION",
      activeServerInstances: "Active Server Instances",
      serverInstanceSubtitle: "Manage running and configured containers on this node",
      noServersInstalled: "No server instances have been provisioned yet.",
      clickToInstall: "Install your first server instance",
      port: "Port",
      memory: "Memory",
      disk: "Disk",
      running: "Running",
      stopped: "Stopped",
      error: "Error",
      offline: "Offline",
      start: "Start",
      stop: "Stop",
      restart: "Restart"
    },
    catalog: {
      title: "Select Game or Application Server",
      subtitle: "Choose from optimized templates, community GitHub releases, or Docker Hub registries",
      searchPlaceholder: "Search games or docker images (e.g., Minecraft, CS2, DayZ...)",
      manualSetup: "Manual Docker Setup",
      manualSubtitle: "Deploy any specialized container image from Docker Hub, GitHub, or Quay",
      customImage: "Custom Docker Image",
      recommendedRam: "Recommended RAM (MB)",
      portMapping: "Port Map (Host:Container)",
      variables: "Environment Variables (KEY=VALUE)",
      liveSearchResults: "Found Installation Packages in the Web (Live Steam, GitHub, Docker Hub)",
      searching: "Searching Web services for",
      noResults: "No Web matches found. Try entering a different term or config.",
      installBtn: "Deploy Instance",
      steamcmdTitle: "SteamCMD Server Deployment Ready",
      installing: "Deploying Container...",
      details: "Template Parameters:"
    },
    servers: {
      listTitle: "Configured Server Instances",
      listSubtitle: "Control states, download mods, adjust environment configurations, and access terminal files.",
      activePlayers: "Active Players",
      maxPlayers: "Max Players",
      manageBtn: "Manage & Console",
      installMod: "Manage Addons",
      configuration: "Configuration",
      deleteServer: "Uninstall Server",
      deleteConfirmRunning: "WARNING: This server is currently ACTIVE.\n\nUninstalling will force-stop this running Docker container. All unsaved game files will be lost!\n\nAre you sure you want to continue?",
      deleteConfirmStopped: "Are you sure you want to uninstall this server? All associated volumes and files will be permanently deleted.",
      tabs: {
        console: "Live Console (RCON/SSH)",
        mods: "Addon Registry & Mods",
        files: "File Manager (Docker Volume)",
        settings: "Advanced Container Rules"
      },
      console: {
        title: "Simulation Console & Host Output",
        placeholder: "Type a command (e.g., help, op, status, kick)...",
        send: "Run",
        noLogs: "Waiting for container boot output...",
        simulatedOutput: "Simulated CLI response:"
      },
      mods: {
        searchPlaceholder: "Filter addons (e.g. edit, trader, expansion...)",
        loaded: "Addons loaded",
        installed: "Installed",
        notInstalled: "Not Installed",
        install: "Install Addon",
        uninstall: "Uninstall Addon",
        rating: "Rating",
        downloads: "Downloads",
        author: "Dev",
        size: "Size",
        origin: "Platform",
        features: "Integration features:",
        trustedHub: "Fully Sandboxed"
      },
      files: {
        title: "Docker Host Volume File Explorer",
        subtitle: "Direct access to mapped host volume files in /volumes/.",
        createNewFile: "New File",
        fileName: "File Name (e.g., ops.json, server.properties)",
        fileContent: "File Content",
        createBtn: "Create File",
        size: "Size"
      },
      settings: {
        title: "Environment & Network Bindings",
        subtitle: "Customize environment values and update container memories",
        applyBtn: "Apply Settings",
        maxMemory: "Max Memory limit (MB)",
        portMapping: "Port mapping on Linux host",
        autoUpdate: "Automatic Updates",
        autoBackup: "Daily Backups",
        variablesTitle: "Active Container Environment Variables"
      }
    },
    backups: {
      title: "Automated Host backups & Recovery",
      subtitle: "Secure snapshots of game data states directly from mapped docker volumes.",
      createBackup: "Build Manual Backup",
      selectServer: "Select Source Instance",
      tableFile: "Backup File Name",
      tableSize: "Size",
      tableDate: "Creation Date",
      tableStatus: "Integrity",
      restore: "Restore",
      delete: "Delete",
      deleteConfirm: "Permanently delete this backup?",
      noBackups: "No backups registered on the host file system."
    },
    users: {
      title: "User Management & Role Flags",
      subtitle: "Grant panel operators dynamic permissions to manage server states.",
      addUser: "Add User",
      tableUsername: "Username",
      tableRole: "Assigned Role",
      tableLastLogin: "Last Active",
      tablePermissions: "Permissions Scope",
      deleteConfirm: "Permanently delete user?",
      roleAdmin: "Administrator",
      roleOperator: "Operator",
      roleViewer: "Viewer",
      permAll: "Full Access",
      edit: "Edit"
    },
    api: {
      title: "Linux CLI & JSON Web API Endpoints",
      subtitle: "Interact programmatically with Gameserver Labor Engine.",
      testBtn: "Execute Test",
      responseTitle: "Live JSON Response"
    }
  },
  de: {
    nav: {
      overview: "Ressourcen-Überwachung",
      servers: "Spieleserver verwalten",
      install: "Server installieren",
      backups: "Backup & Recovery",
      users: "Nutzerrechte verwalten",
      api: "API Dokumentation",
      logout: "Abmelden",
      login: "Anmelden",
      setup: "Ersteinrichtung",
      dockerIsolation: "Container-Isolation: Aktiv",
      updateSystem: "Update System: OK",
      hostOnline: "LINUX HOST ONLINE",
      headerOverview: "System Dashboard",
      headerServers: "Server-Steuerung",
      headerInstall: "Anwendungskatalog",
      headerBackups: "Datensicherung",
      headerUsers: "Nutzerberechtigungen",
      headerApi: "API-Anbindung",
      atmosphere: "Hintergrund:",
      accentColor: "Farbe:",
      quickInstall: "Server installieren"
    },
    common: {
      status: "Status",
      actions: "Aktionen",
      save: "Änderungen speichern",
      cancel: "Abbrechen",
      close: "Schließen",
      delete: "Löschen",
      deletePermanently: "Endgültig löschen",
      warning: "Warnung",
      success: "Erfolgreich",
      error: "Fehler",
      info: "Information",
      search: "Suchen",
      loading: "Lädt...",
      enabled: "Aktiviert",
      disabled: "Inaktiv",
      none: "Keine"
    },
    login: {
      welcome: "Willkommen auf",
      subtitle: "Gameserver Labor Spieleserver-Infrastruktur Panel",
      username: "Benutzername",
      password: "Passwort",
      roles: "Ihre Session wird automatisch mit dem Linux-Subterminal synchronisiert.",
      submitting: "Melde an...",
      submitBtn: "SICHERE SESSION ANMELDEN",
      setupRequired: "Ersteinrichtung Erforderlich",
      setupSubtitle: "Erstellen Sie den primären Super-Admin-Benutzer, um die Hostdatenbank zu initialisieren.",
      setupBtn: "ERSTEINRICHTUNG ABSCHLIESSEN & EINLOGGEN",
      registering: "Richte ein..."
    },
    overview: {
      systemHealth: "System-Ressourcen Überwachung",
      livePolling: "Echtzeit Linux Host-Telemetrie via Docker",
      systemDetails: "Einheitliche Linux System-Kerndaten",
      cpuLoad: "CPU-AUSLASTUNG",
      cores: "Kerne",
      ramUsage: "RAM-AUSLASTUNG",
      diskUsage: "FESTPLATTENSPEICHER",
      runningContainers: "LOUFENDE CONTAINER",
      networkTraffic: "NETZWERK-TRAFFIC",
      dockerVersion: "DOCKER-VERSION",
      activeServerInstances: "Aktive Server-Instanzen",
      serverInstanceSubtitle: "Verwalten Sie laufende und konfigurierte Container auf diesem Host node",
      noServersInstalled: "Noch keine Server-Instanzen auf dem Host vorhanden.",
      clickToInstall: "Installieren Sie jetzt Ihren ersten Server",
      port: "Port",
      memory: "Speicher",
      disk: "Platte",
      running: "Läuft",
      stopped: "Gestoppt",
      error: "Fehler",
      offline: "Offline",
      start: "Starten",
      stop: "Stoppen",
      restart: "Neustarten"
    },
    catalog: {
      title: "Auswahl Spiel- oder Anwendungsserver",
      subtitle: "Wählen Sie aus vorkonfigurierten Vorlagen, Community-Repos auf GitHub oder Docker Hub Registern",
      searchPlaceholder: "Suche nach Spielen oder Docker Images (z.B. Minecraft, CS2, DayZ...)",
      manualSetup: "Manuelles Docker Setup",
      manualSubtitle: "Beliebiges Docker Image aus dem Hub, GitHub oder Quay deployen",
      customImage: "Custom Docker Image-Name",
      recommendedRam: "Empfohlener RAM (MB)",
      portMapping: "Port-Mapping (Host:Container)",
      variables: "Umgebungsvariablen (SCHLÜSSEL=WERT)",
      liveSearchResults: "Gefundene Installations-Pakete im Web (Live Steam, GitHub, Docker Hub)",
      searching: "Suche in Web-Paketquellen für",
      noResults: "Keine Webtreffer gefunden. Versuchen Sie einen anderen Begriff.",
      installBtn: "Server installieren",
      steamcmdTitle: "SteamCMD Server Installations-Vorbereitung",
      installing: "Richte Container ein...",
      details: "Parameter-Übersicht:"
    },
    servers: {
      listTitle: "Eingerichtete Server-Instanzen",
      listSubtitle: "Status überwachen, Mods laden, Umgebungsvariablen anpassen und Terminal-Dateien einsehen.",
      activePlayers: "Spieler online",
      maxPlayers: "Maximale Spieler",
      manageBtn: "Verwalten & Konsole",
      installMod: "Addons verwalten",
      configuration: "Konfiguration",
      deleteServer: "Server entfernen",
      deleteConfirmRunning: "ACHTUNG: Der Server ist AKTIV und läuft zurzeit.\n\nDurch das Deinstallieren wird dieser laufende Container auf Ihrem Linux-System hart gestoppt und unwiderruflich aus Docker entfernt. Alle nicht gesicherten Spieldaten gehen verloren!\n\nMöchten Sie wirklich fortfahren?",
      deleteConfirmStopped: "Sind Sie sicher, dass Sie diesen Server deinstallieren wollen? Alle zugehörigen Volumes, Docker-Container und Lokale-Konfigurationen werden unwiderruflich entfernt.",
      tabs: {
        console: "Live Konsole (RCON/SSH)",
        mods: "Zusatzpakete & Mods",
        files: "Dateimanager (Docker Volume)",
        settings: "Erweiterte Container-Regeln"
      },
      console: {
        title: "Konsolen-Simulation & Host-Ausgabe",
        placeholder: "Standard-Befehl eingeben (z.b. help, op, status, kick)...",
        send: "Senden",
        noLogs: "Warten auf Container Boot-Logs...",
        simulatedOutput: "Simuliertes Terminal-Ergebnis:"
      },
      mods: {
        searchPlaceholder: "Erweiterungspakete filtern (z.B. Edit, trader, expansion...)",
        loaded: "Addons geladen",
        installed: "Installiert",
        notInstalled: "Nicht installiert",
        install: "Mod installieren",
        uninstall: "Mod deinstallieren",
        rating: "Sicherheit",
        downloads: "Downloads",
        author: "Autor",
        size: "Größe",
        origin: "Plattform",
        features: "Integration vorteile:",
        trustedHub: "Echtzeit-Isoliert"
      },
      files: {
        title: "Docker Host-Volume-Dateiexplorer",
        subtitle: "Direkter Lese- und Schreibzugriff auf das persistente Host-Volume unter /volumes/.",
        createNewFile: "Neue Datei erstellen",
        fileName: "Dateiname (z.B. ops.json, settings.ini)",
        fileContent: "Datei-Inhalt",
        createBtn: "Datei erstellen",
        size: "Größe"
      },
      settings: {
        title: "System-Umgebung und Netzwerkbindungen",
        subtitle: "Direkte Steuerung der Docker Parameter und Variablen.",
        applyBtn: "Konfiguration speichern",
        maxMemory: "Maximaler RAM-Limit (MB)",
        portMapping: "Port-Mapping auf dem Linux Host",
        autoUpdate: "Automatisches Update",
        autoBackup: "Tägliches Backup",
        variablesTitle: "Aktive Host-Umgebungsvariablen im Container"
      }
    },
    backups: {
      title: "Automatisierte Host Backup-Verwaltung",
      subtitle: "Erstellen Sie konsistente Snapshots direkt aus den Container Host-Volumes.",
      createBackup: "Manuelles Backup anstoßen",
      selectServer: "Sicherung für Instanz wählen",
      tableFile: "Sicherungsdatei-Name",
      tableSize: "Dateigröße",
      tableDate: "Erstellungsdatum",
      tableStatus: "Integrität",
      restore: "Wiederherstellen",
      delete: "Löschen",
      deleteConfirm: "Möchten Sie dieses Backup endgültig löschen?",
      noBackups: "Keine Backups auf dem Linux Node vorhanden."
    },
    users: {
      title: "Benutzerverwaltung & Berechtigungen",
      subtitle: "Verwalten Sie Konten und berechtigen Sie Administratoren.",
      addUser: "Benutzer hinzufügen",
      tableUsername: "Benutzername",
      tableRole: "Systemrolle",
      tableLastLogin: "Letzter Zugriff",
      tablePermissions: "Rechtegruppe",
      deleteConfirm: "Benutzer endgültig löschen?",
      roleAdmin: "Administrator",
      roleOperator: "Operator",
      roleViewer: "Betrachter",
      permAll: "Vollzugriff",
      edit: "Bearbeiten"
    },
    api: {
      title: "Linux CLI und JSON Web API Endpunkte",
      subtitle: "Steuern Sie Gameserver Labor Engine über externe Anwendungen.",
      testBtn: "Aufruf testen",
      responseTitle: "Echtzeit JSON-Rückmeldung vom Server"
    }
  },
  fr: {
    nav: {
      overview: "Surveillance des Ressources",
      servers: "Gérer les Serveurs",
      install: "Installer un Serveur",
      backups: "Sauvegardes & Restauration",
      users: "Gestion des Droits",
      api: "Documentation API",
      logout: "Se déconnecter",
      login: "Se connecter",
      setup: "Configuration Initiale",
      dockerIsolation: "Isolation Container: Active",
      updateSystem: "Mise à jour: OK",
      hostOnline: "HÔTE LINUX EN LIGNE",
      headerOverview: "Console Système",
      headerServers: "Contrôle Serveur",
      headerInstall: "Catalogue d'Applications",
      headerBackups: "Sauvegardes de Données",
      headerUsers: "Permissions Utilisateurs",
      headerApi: "Connexion API",
      atmosphere: "Arrière-plan:",
      accentColor: "Couleur:",
      quickInstall: "Installer le serveur"
    },
    common: {
      status: "Statut",
      actions: "Actions",
      save: "Enregistrer les modifications",
      cancel: "Annuler",
      close: "Fermer",
      delete: "Supprimer",
      deletePermanently: "Supprimer définitivement",
      warning: "Avertissement",
      success: "Succès",
      error: "Erreur",
      info: "Information",
      search: "Rechercher",
      loading: "Chargement...",
      enabled: "Activé",
      disabled: "Désactivé",
      none: "Aucun"
    },
    login: {
      welcome: "Bienvenue sur",
      subtitle: "Panel d'Infrastructure de Gameserver Labor",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      roles: "Votre session sera automatiquement synchronisée avec le terminal Linux.",
      submitting: "Connexion...",
      submitBtn: "SE CONNECTER SÉCURISÉ",
      setupRequired: "Configuration Requise",
      setupSubtitle: "Créez l'administrateur principal pour initialiser la base de données.",
      setupBtn: "FINIR LA CONFIGURATION & LOG IN",
      registering: "Génération de l'admin..."
    },
    overview: {
      systemHealth: "Surveillance des Ressources Système",
      livePolling: "Télémétrie en temps réel de l'hôte Linux via Docker",
      systemDetails: "Informations Système de base",
      cpuLoad: "CHARGE CPU",
      cores: "Cœurs",
      ramUsage: "UTILISATION RAM",
      diskUsage: "ESPACE DISQUE",
      runningContainers: "CONTAINERS EN COURS",
      networkTraffic: "TRAFIC RÉSEAU",
      dockerVersion: "VERSION DOCKER",
      activeServerInstances: "Instances Serveur Actives",
      serverInstanceSubtitle: "Gérez les conteneurs configurés et en cours d'exécution",
      noServersInstalled: "Aucun serveur n'est actuellement configuré sur l'hôte.",
      clickToInstall: "Installez votre tout premier serveur de jeu",
      port: "Port",
      memory: "Mémoire",
      disk: "Disque",
      running: "En cours",
      stopped: "Arrêté",
      error: "Erreur",
      offline: "Hors ligne",
      start: "Démarrer",
      stop: "Arrêter",
      restart: "Redémarrer"
    },
    catalog: {
      title: "Sélectionner un Serveur de Jeu",
      subtitle: "Choisissez parmi des modèles configurés, des répertoires GitHub ou Docker Hub",
      searchPlaceholder: "Chercher un jeu ou une image Docker (ex: Minecraft, DayZ...)",
      manualSetup: "Configuration Docker Manuelle",
      manualSubtitle: "Déployez n'importe quelle image Docker Hub, GitHub ou Quay",
      customImage: "Image Docker Personnalisée",
      recommendedRam: "RAM Recommandée (Mo)",
      portMapping: "Mappage de Ports (Hôte:Conteneur)",
      variables: "Variables d'environnement (CLÉ=VALEUR)",
      liveSearchResults: "Résultats Live du Web (Steam, GitHub, Docker Hub)",
      searching: "Recherche en cours pour",
      noResults: "Aucun résultat trouvé sur le Web.",
      installBtn: "Déployer le Serveur",
      steamcmdTitle: "Préparation du Serveur SteamCMD",
      installing: "Déploiement en cours...",
      details: "Aperçu des Paramètres:"
    },
    servers: {
      listTitle: "Instances Serveur Configurées",
      listSubtitle: "Contrôlez les statuts, gérez les modules d'extension et éditez les paramètres.",
      activePlayers: "Joueurs en ligne",
      maxPlayers: "Joueurs Max",
      manageBtn: "Gérer & Console",
      installMod: "Gérer les Addons",
      configuration: "Paramètres",
      deleteServer: "Désinstaller le Serveur",
      deleteConfirmRunning: "ATTENTION : Le serveur est ACTIF.\n\nLa désinstallation va forcer l'arrêt de ce conteneur Docker. Toutes les données non sauvegardées seront perdues.\n\nVoulez-vous continuer ?",
      deleteConfirmStopped: "Êtes-vous sûr de vouloir désinstaller ce serveur ? Tous les fichiers seront supprimés définitivement.",
      tabs: {
        console: "Console en Direct (RCON/SSH)",
        mods: "Catalogue d'Addons & Mods",
        files: "Gestionnaire de fichiers (Volume Docker)",
        settings: "Configurations Avancées"
      },
      console: {
        title: "Simulation Console & Logs de l'hôte",
        placeholder: "Entrez une commande (ex: help, op, status, kick)...",
        send: "Exécuter",
        noLogs: "Attente du démarrage du serveur...",
        simulatedOutput: "Retour terminal configuré :"
      },
      mods: {
        searchPlaceholder: "Filtrer les extensions (ex: trader, expansion...)",
        loaded: "Addons chargés",
        installed: "Installé",
        notInstalled: "Non installé",
        install: "Installer l'addon",
        uninstall: "Désinstaller l'addon",
        rating: "Sécurité",
        downloads: "Téléchargements",
        author: "Auteur",
        size: "Taille",
        origin: "Origine",
        features: "Avantages de l'intégration :",
        trustedHub: "Entièrement Isolé"
      },
      files: {
        title: "Explorateur de Fichiers de l'Hôte Docker",
        subtitle: "Accès en lecture et écriture aux volumes persistants de l'hôte sous /volumes/.",
        createNewFile: "Créer un nouveau fichier",
        fileName: "Nom de fichier (ex: server.properties)",
        fileContent: "Contenu du fichier",
        createBtn: "Créer le fichier",
        size: "Taille"
      },
      settings: {
        title: "Mappages de l'Hôte et Environnement",
        subtitle: "Gérez directement les allocations de ressources Docker.",
        applyBtn: "Sauvegarder",
        maxMemory: "Limite de mémoire RAM (Mo)",
        portMapping: "Mappage de ports sur l'hôte Linux",
        autoUpdate: "Mise à jour automatique",
        autoBackup: "Sauvegarde journalière",
        variablesTitle: "Variables d'environnement actives dans le conteneur"
      }
    },
    backups: {
      title: "Gestion des Sauvegardes de l'Hôte",
      subtitle: "Prenez des instantanés directs des volumes configurés.",
      createBackup: "Lancer une sauvegarde manuelle",
      selectServer: "Choisir un serveur source",
      tableFile: "Nom du ficher de sauvegarde",
      tableSize: "Taille",
      tableDate: "Date de création",
      tableStatus: "Intégrité",
      restore: "Restaurer",
      delete: "Supprimer",
      deleteConfirm: "Supprimer définitivement cette sauvegarde ?",
      noBackups: "Aucune sauvegarde sur l'hôte pour l'instant."
    },
    users: {
      title: "Utilisateurs & Permissions",
      subtitle: "Gérez les comptes d'opérateurs pour l'administration.",
      addUser: "Ajouter un Utilisateur",
      tableUsername: "Nom d'utilisateur",
      tableRole: "Rôle système",
      tableLastLogin: "Dernière connexion",
      tablePermissions: "Droits assignés",
      deleteConfirm: "Supprimer l'utilisateur ?",
      roleAdmin: "Administrateur",
      roleOperator: "Opérateur",
      roleViewer: "Spectateur",
      permAll: "Accès Total",
      edit: "Modifier"
    },
    api: {
      title: "Endpoints d'API et CLI",
      subtitle: "Pilotez le moteur de Gameserver Labor depuis d'autres applications.",
      testBtn: "Tester l'Endpoint",
      responseTitle: "Réponse JSON en direct"
    }
  },
  es: {
    nav: {
      overview: "Monitor de Recursos",
      servers: "Administrar Servidores",
      install: "Instalar Servidor",
      backups: "Copias de Seguridad",
      users: "Gestionar Usuarios",
      api: "Documentación API",
      logout: "Cerrar Sesión",
      login: "Iniciar Sesión",
      setup: "Configuración Inicial",
      dockerIsolation: "Aislamiento: Activo",
      updateSystem: "Sistema: Actualizado",
      hostOnline: "SERVIDOR LINUX ONLINE",
      headerOverview: "Tablero Principal",
      headerServers: "Control de Servidor",
      headerInstall: "Catálogo de Aplicaciones",
      headerBackups: "Copias de Datos",
      headerUsers: "Permisos de Usuarios",
      headerApi: "Conexión API",
      atmosphere: "Fondo:",
      accentColor: "Color:",
      quickInstall: "Instalar servidor"
    },
    common: {
      status: "Estado",
      actions: "Acciones",
      save: "Guardar Cambios",
      cancel: "Cancelar",
      close: "Cerrar",
      delete: "Eliminar",
      deletePermanently: "Eliminar definitivamente",
      warning: "Advertencia",
      success: "Éxito",
      error: "Error",
      info: "Información",
      search: "Buscar",
      loading: "Cargando...",
      enabled: "Habilitado",
      disabled: "Deshabilitado",
      none: "Ninguno"
    },
    login: {
      welcome: "Bienvenido a",
      subtitle: "Panel de Servidores de Juego de Gameserver Labor",
      username: "Usuario",
      password: "Contraseña",
      roles: "Su sesión se mapeará dinámicamente con el terminal Linux.",
      submitting: "Iniciando sesión...",
      submitBtn: "INICIAR SESIÓN DE FORMA SEGURA",
      setupRequired: "Se requiere configuración inicial",
      setupSubtitle: "Cree el usuario administrador principal para inicializar la base de datos.",
      setupBtn: "COMPLETAR CONFIGURACIÓN & LOGIN",
      registering: "Registrando administrador..."
    },
    overview: {
      systemHealth: "Repaso de Recursos del Sistema",
      livePolling: "Telemetría en tiempo real del host Linux a través de Docker",
      systemDetails: "Información básica de Linux Core",
      cpuLoad: "USO DE CPU",
      cores: "Núcleos",
      ramUsage: "USO DE RAM",
      diskUsage: "ALMACENAMIENTO",
      runningContainers: "CONTENEDORES ACTIVOS",
      networkTraffic: "TRAFICO DE RED",
      dockerVersion: "VERSION DOCKER",
      activeServerInstances: "Instancias Activas de Servidor",
      serverInstanceSubtitle: "Administre los contenedores activos y configurados",
      noServersInstalled: "Aún no se han configurado servidores.",
      clickToInstall: "Configurar su primer servidor de juego",
      port: "Puerto",
      memory: "Memoria",
      disk: "Disco",
      running: "Ejecutando",
      stopped: "Detenido",
      error: "Error",
      offline: "Offline",
      start: "Iniciar",
      stop: "Detener",
      restart: "Reiniciar"
    },
    catalog: {
      title: "Seleccionar Servidor de Juego",
      subtitle: "Elija entre plantillas configuradas, repos de GitHub o Docker Hub",
      searchPlaceholder: "Buscar juegos o imágenes Docker (ej. Minecraft, DayZ...)",
      manualSetup: "Configuración Docker Manual",
      manualSubtitle: "Desplegar cualquier imagen de Docker Hub, GitHub o Quay",
      customImage: "Nombre de Imagen Docker",
      recommendedRam: "RAM Recomendada (MB)",
      portMapping: "Mapeo de Puertos (Host:Contenedor)",
      variables: "Variables de entorno (CLAVE=VALOR)",
      liveSearchResults: "Búsqueda en vivo de paquetes web (Steam, GitHub, Docker Hub)",
      searching: "Buscando en servicios web",
      noResults: "No se encontraron ofertas web.",
      installBtn: "Desplegar Instancia",
      steamcmdTitle: "Preparación del Servidor SteamCMD",
      installing: "Instalando Contenedor...",
      details: "Parámetros del Servidor:"
    },
    servers: {
      listTitle: "Instancias de Servidor Configuradas",
      listSubtitle: "Controle los estados, instale complementos y modifique variables.",
      activePlayers: "Jugadores online",
      maxPlayers: "Jugadores Máximos",
      manageBtn: "Gestionar & Consola",
      installMod: "Gestionar Addons",
      configuration: "Configuración",
      deleteServer: "Eliminar Servidor",
      deleteConfirmRunning: "ADVERTENCIA: El servidor está ACTIVO.\n\nEliminarlo forzará la parada de este contenedor Docker. Se perderán todos los datos no guardados.\n\n¿Estás seguro de continuar?",
      deleteConfirmStopped: "¿Estás seguro de que deseas desinstalar este servidor? Se borrarán todos los archivos asociados permanentemente.",
      tabs: {
        console: "Consola en Vivo (RCON/SSH)",
        mods: "Registro de Mods & Complementos",
        files: "Explorador de Archivos (Volume Docker)",
        settings: "Ajustes Avanzados"
      },
      console: {
        title: "Consola y Salida de Registros",
        placeholder: "Introduzca un comando (ej: help, op, status, kick)...",
        send: "Enviar",
        noLogs: "Esperando registros de inicio...",
        simulatedOutput: "Salida del terminal de simulación:"
      },
      mods: {
        searchPlaceholder: "Filtrar extensiones (ej. trader, expansion...)",
        loaded: "Complementos cargados",
        installed: "Instalado",
        notInstalled: "No instalado",
        install: "Instalar Mod",
        uninstall: "Desinstalar Mod",
        rating: "Seguridad",
        downloads: "Descargas",
        author: "Autor",
        size: "Tamaño",
        origin: "Plataforma",
        features: "Beneficios de integración:",
        trustedHub: "Aislado del Sistema"
      },
      files: {
        title: "Explorador de Archivos del Host Docker",
        subtitle: "Acceso de lectura y escritura directo a los directorios del host bajo /volumes/.",
        createNewFile: "Crear un nuevo archivo",
        fileName: "Nombre del archivo (ej. server.properties)",
        fileContent: "Contenido del archivo",
        createBtn: "Crear archivo",
        size: "Tamaño"
      },
      settings: {
        title: "Entorno del Sistema y Puertos",
        subtitle: "Ajuste las limitaciones de recursos y variables de Docker.",
        applyBtn: "Guardar Ajustes",
        maxMemory: "Límite de memoria RAM (MB)",
        portMapping: "Mapeo de puertos en el Host",
        autoUpdate: "Actualización automática",
        autoBackup: "Backup diario",
        variablesTitle: "Variables de entorno activas en el contenedor"
      }
    },
    backups: {
      title: "Gestión de Backups de Servidores",
      subtitle: "Sicherheits-Snapshots directas creadas desde los volúmenes correspondientes.",
      createBackup: "Iniciar Backup manual",
      selectServer: "Seleccione servidor de origen",
      tableFile: "Nombre del archivo de copia",
      tableSize: "Tamaño del archivo",
      tableDate: "Fecha de creación",
      tableStatus: "Integridad",
      restore: "Restaurar",
      delete: "Eliminar",
      deleteConfirm: "¿Seguro que desea eliminar esta copia?",
      noBackups: "No se encontraron copias en el sistema."
    },
    users: {
      title: "Control de Usuarios & Permisos",
      subtitle: "Asigne permisos a nuevos colaboradores para el panel.",
      addUser: "Añadir Usuario",
      tableUsername: "Usuario",
      tableRole: "Rol asignado",
      tableLastLogin: "Último acceso",
      tablePermissions: "Acceso Permitido",
      deleteConfirm: "¿Seguro que desea eliminar el usuario?",
      roleAdmin: "Administrador",
      roleOperator: "Operador",
      roleViewer: "Espectador",
      permAll: "Acceso Completo",
      edit: "Editar"
    },
    api: {
      title: "Endpoints de API y Linux CLI",
      subtitle: "Interectúe programáticamente con el motor de Gameserver Labor.",
      testBtn: "Probar Endpoint",
      responseTitle: "Respuesta JSON en directo"
    }
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("gcore_language");
    return (saved as Language) || "en"; // Default is strictly English (en)
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("gcore_language", lang);
  };

  const t = (keyPath: string, defaultValue?: string): string => {
    const parts = keyPath.split(".");
    let current: any = translations[language];

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return defaultValue !== undefined ? defaultValue : keyPath;
      }
    }

    if (typeof current === "string") {
      return current;
    }

    return defaultValue !== undefined ? defaultValue : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
