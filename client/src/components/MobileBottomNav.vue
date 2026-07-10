<template>
  <nav class="mobile-bottom-nav">
    <router-link to="/library" class="nav-tab" :class="{ active: $route.path === '/library' && $route.query.tab !== 'playlists' }">
      <span class="material-symbols-rounded nav-icon">library_music</span>
      <span class="nav-label">音乐库</span>
    </router-link>
    <router-link to="/playlists" class="nav-tab" :class="{ active: $route.path === '/playlists' }">
      <span class="material-symbols-rounded nav-icon">playlist_play</span>
      <span class="nav-label">歌单</span>
    </router-link>
    <router-link to="/settings" class="nav-tab" :class="{ active: $route.path === '/settings' }">
      <span class="material-symbols-rounded nav-icon">settings</span>
      <span class="nav-label">设置</span>
    </router-link>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(var(--mobile-bottom-nav-height) + var(--mobile-safe-bottom));
    padding-bottom: var(--mobile-safe-bottom);
    background: var(--md-surface-container-high);
    border-top: 1px solid var(--md-outline-variant);
    z-index: 250;
    justify-content: space-around;
    align-items: center;
    backdrop-filter: blur(20px);
  }

  .nav-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 16px;
    border-radius: 16px;
    text-decoration: none;
    color: var(--md-on-surface-variant);
    transition: color 0.15s, background 0.15s;
    min-width: 64px;
    position: relative;
  }

  .nav-tab::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    border-radius: 0 0 3px 3px;
    background: var(--md-primary);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .nav-tab.active::before {
    opacity: 1;
  }

  .nav-tab.active {
    color: var(--md-primary);
  }

  .nav-icon {
    font-size: 24px;
  }

  .nav-label {
    font-size: 11px;
    font-weight: 500;
  }
}
</style>
