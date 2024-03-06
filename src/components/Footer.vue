<template>
  <nav class="text-xl mt-6">
    <button
      :title="$t('button.toggle_dark')"
      class="icon-btn mx-2 !outline-none"
      @click="(e) => toggleDark()"
    >
      <carbon-moon v-if="isDark" />
      <carbon-sun v-else />
    </button>

    <a
      :title="$t('button.toggle_langs')"
      class="icon-btn mx-2"
      @click="toggleLocales"
    >
      <carbon-language />
    </a>

    <a
      class="icon-btn mx-2"
      href="https://github.com/xiaoluoboding/chrome-ext-mv3-starter"
      rel="noreferrer"
      target="_blank"
      title="GitHub"
    >
      <carbon-logo-github />
    </a>
  </nav>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"
import { isDark, toggleDark } from "~/logic"

const { availableLocales, locale } = useI18n()

const toggleLocales = () => {
  // change to some real logic
  const locales = availableLocales
  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
}
</script>
