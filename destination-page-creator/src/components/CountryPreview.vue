<script setup lang="ts">
import { ref, watch, computed } from "vue";

interface CountryData {
  [key: string]: any;
}

const props = defineProps<{
  pageData: CountryData | null;
}>();

// Destructure props for template access
const { pageData } = props;
const emit = defineEmits(["edit-field"]);

// Helper function to escape HTML
function escapeHtml(value: string): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Safe URL function
function safeUrl(value: string): string {
  if (!value) {
    return "#";
  }
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
    return "#";
  } catch (error) {
    return "#";
  }
}

// Function to start editing a field
function startEdit(fieldPath: string[], currentValue: string, event?: Event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  emit("edit-field", fieldPath, currentValue);
}

// Helper to get nested value
function getValue(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (current && current[key] !== undefined) {
      current = current[key];
    } else {
      return "";
    }
  }
  return current;
}
</script>

<template>
  <div v-if="!pageData" class="preview-error">
    <h3>Keine Daten verfügbar</h3>
    <p>Die Länderdaten konnten nicht geladen werden.</p>
  </div>

  <div class="country_page" v-else>
    <!-- Breadcrumb -->
    <nav
      id="dynamic_breadcrumb"
      aria-label="Breadcrumb"
      v-if="pageData.breadcrumb"
    >
      <div class="breadcrumb_inner">
        <a href="/">{{
          escapeHtml(pageData.breadcrumb.home_label || "Startseite")
        }}</a>
        <span class="breadcrumb_separator">/</span>
        <span aria-current="page">
          <span
            class="editable-element"
            @click="
              startEdit(
                ['breadcrumb', 'home_label'],
                pageData.breadcrumb.home_label || '',
              )
            "
          >
            {{ escapeHtml(pageData.breadcrumb.home_label || "Startseite") }}
          </span>
        </span>
        <span class="breadcrumb_separator">/</span>
        <span aria-current="page">
          {{ escapeHtml(pageData.country_name || "") }}
        </span>
      </div>
    </nav>

    <!-- Main Content Container -->
    <div class="country_container">
      <!-- HERO SECTION -->
      <section class="country_hero" v-if="pageData.hero">
        <img
          :src="pageData.hero.image?.url || ''"
          :alt="pageData.hero.image?.alt || ''"
          class="editable-element"
          @click="
            startEdit(['hero', 'image', 'url'], pageData.hero.image?.url || '')
          "
        />

        <div class="country_hero_content">
          <div
            class="country_eyebrow editable-element"
            @click="startEdit(['hero', 'eyebrow'], pageData.hero.eyebrow || '')"
          >
            {{ escapeHtml(pageData.hero.eyebrow || "Reiseguide & Community") }}
          </div>

          <h1
            class="editable-element"
            @click="startEdit(['hero', 'title'], pageData.hero.title || '')"
          >
            {{ escapeHtml(pageData.hero.title || "Ländername entdecken") }}
          </h1>

          <p
            class="editable-element"
            @click="
              startEdit(
                ['hero', 'description'],
                pageData.hero.description || '',
              )
            "
          >
            {{
              escapeHtml(
                pageData.hero.description || "Beschreibung hier eingeben",
              )
            }}
          </p>

          <div class="country_hero_buttons">
            <a
              v-for="(button, index) in pageData.hero.buttons || []"
              :key="index"
              :href="safeUrl(button.url || '#')"
              :class="[
                'country_button',
                index === 0
                  ? 'country_button_primary'
                  : 'country_button_secondary',
              ]"
            >
              <span
                class="editable-element"
                @click.prevent.stop="
                  startEdit(
                    ['hero', 'buttons', index, 'label'],
                    button.label || '',
                  )
                "
              >
                {{ escapeHtml(button.label || "Button Text") }}
              </span>
            </a>
          </div>
        </div>
      </section>

      <!-- INTRO SECTION -->
      <section class="country_intro" v-if="pageData.intro">
        <div class="country_intro_copy">
          <div
            class="country_section_kicker editable-element"
            @click="startEdit(['intro', 'kicker'], pageData.intro.kicker || '')"
          >
            {{ escapeHtml(pageData.intro.kicker || "") }}
          </div>

          <h2
            class="country_section_title editable-element"
            @click="startEdit(['intro', 'title'], pageData.intro.title || '')"
          >
            {{ escapeHtml(pageData.intro.title || "") }}
          </h2>

          <p
            v-for="(paragraph, index) in pageData.intro.paragraphs || []"
            :key="index"
            class="editable-element"
            @click="startEdit(['intro', 'paragraphs', index], paragraph || '')"
          >
            {{ escapeHtml(paragraph || "") }}
          </p>
        </div>

        <div class="country_intro_image">
          <img
            :src="pageData.intro.image?.url || ''"
            :alt="pageData.intro.image?.alt || ''"
            loading="lazy"
            class="editable-element"
            @click="
              startEdit(
                ['intro', 'image', 'url'],
                pageData.intro.image?.url || '',
              )
            "
          />
        </div>
      </section>

      <!-- IMAGE STRIP -->
      <section
        class="country_image_strip"
        v-if="pageData.image_strip && pageData.image_strip.length"
      >
        <figure v-for="(item, index) in pageData.image_strip" :key="index">
          <img
            :src="item.image?.url || ''"
            :alt="item.image?.alt || ''"
            loading="lazy"
            class="editable-element"
            @click="
              startEdit(
                ['image_strip', index, 'image', 'url'],
                item.image?.url || '',
              )
            "
          />
          <figcaption
            class="editable-element"
            @click="
              startEdit(['image_strip', index, 'caption'], item.caption || '')
            "
          >
            {{ escapeHtml(item.caption || "") }}
          </figcaption>
        </figure>
      </section>

      <!-- COMMUNITY SECTION -->
      <section class="country_section" id="beitraege" v-if="pageData.community">
        <div class="country_community">
          <div class="country_community_header">
            <div>
              <div
                class="country_section_kicker editable-element"
                @click="
                  startEdit(
                    ['community', 'kicker'],
                    pageData.community.kicker || '',
                  )
                "
              >
                {{ escapeHtml(pageData.community.kicker || "") }}
              </div>

              <h2
                class="editable-element"
                @click="
                  startEdit(
                    ['community', 'title'],
                    pageData.community.title || '',
                  )
                "
              >
                {{ escapeHtml(pageData.community.title || "") }}
              </h2>

              <p
                class="editable-element"
                @click="
                  startEdit(
                    ['community', 'description'],
                    pageData.community.description || '',
                  )
                "
              >
                {{ escapeHtml(pageData.community.description || "") }}
              </p>
            </div>
          </div>

          <div id="country_posts">
            <div class="community-placeholder">
              <p>Beiträge werden in der Live-Version geladen</p>
            </div>
          </div>
        </div>
      </section>

      <!-- REGIONS SECTION -->
      <section class="country_section" v-if="pageData.regions" id="regionen">
        <div class="country_section_heading">
          <div
            class="country_section_kicker editable-element"
            @click="
              startEdit(['regions', 'kicker'], pageData.regions.kicker || '')
            "
          >
            {{ escapeHtml(pageData.regions.kicker || "") }}
          </div>

          <h2
            class="country_section_title editable-element"
            @click="
              startEdit(['regions', 'title'], pageData.regions.title || '')
            "
          >
            {{ escapeHtml(pageData.regions.title || "") }}
          </h2>

          <p
            class="editable-element"
            @click="
              startEdit(
                ['regions', 'description'],
                pageData.regions.description || '',
              )
            "
          >
            {{ escapeHtml(pageData.regions.description || "") }}
          </p>
        </div>

        <div
          class="country_region_grid"
          v-if="pageData.regions.items && pageData.regions.items.length"
        >
          <a
            v-for="(item, index) in pageData.regions.items"
            :key="index"
            :href="safeUrl(item.url || '#')"
            class="country_region_card"
          >
            <div class="country_region_image">
              <img
                :src="item.image?.url || ''"
                :alt="item.image?.alt || ''"
                loading="lazy"
                class="editable-element"
                @click.prevent.stop="
                  startEdit(
                    ['regions', 'items', index, 'image', 'url'],
                    item.image?.url || '',
                  )
                "
              />
            </div>

            <div class="country_region_content">
              <h3
                class="editable-element"
                @click.prevent.stop="
                  startEdit(
                    ['regions', 'items', index, 'title'],
                    item.title || '',
                  )
                "
              >
                {{ escapeHtml(item.title || "") }}
              </h3>

              <p
                class="editable-element"
                @click.prevent.stop="
                  startEdit(
                    ['regions', 'items', index, 'description'],
                    item.description || '',
                  )
                "
              >
                {{ escapeHtml(item.description || "") }}
              </p>

              <span
                class="country_region_link editable-element"
                @click.prevent.stop="
                  startEdit(
                    ['regions', 'items', index, 'link_label'],
                    item.link_label || '',
                  )
                "
              >
                {{ escapeHtml(item.link_label || "") }}
              </span>
            </div>
          </a>
        </div>
      </section>

      <!-- TOPICS SECTION -->
      <section class="country_section" v-if="pageData.topics">
        <div class="country_section_heading">
          <div
            class="country_section_kicker editable-element"
            @click="
              startEdit(['topics', 'kicker'], pageData.topics.kicker || '')
            "
          >
            {{ escapeHtml(pageData.topics.kicker || "") }}
          </div>

          <h2
            class="country_section_title editable-element"
            @click="startEdit(['topics', 'title'], pageData.topics.title || '')"
          >
            {{ escapeHtml(pageData.topics.title || "") }}
          </h2>

          <p
            class="editable-element"
            @click="
              startEdit(
                ['topics', 'description'],
                pageData.topics.description || '',
              )
            "
          >
            {{ escapeHtml(pageData.topics.description || "") }}
          </p>
        </div>

        <div
          class="country_topic_grid"
          v-if="pageData.topics.items && pageData.topics.items.length"
        >
          <article
            v-for="(item, index) in pageData.topics.items"
            :key="index"
            class="country_topic"
          >
            <div class="country_topic_image">
              <img
                :src="item.image?.url || ''"
                :alt="item.image?.alt || ''"
                loading="lazy"
                class="editable-element"
                @click="
                  startEdit(
                    ['topics', 'items', index, 'image', 'url'],
                    item.image?.url || '',
                  )
                "
              />
            </div>

            <div class="country_topic_content">
              <h3
                class="editable-element"
                @click="
                  startEdit(
                    ['topics', 'items', index, 'title'],
                    item.title || '',
                  )
                "
              >
                {{ escapeHtml(item.title || "") }}
              </h3>

              <p
                class="editable-element"
                @click="
                  startEdit(
                    ['topics', 'items', index, 'description'],
                    item.description || '',
                  )
                "
              >
                {{ escapeHtml(item.description || "") }}
              </p>
            </div>
          </article>
        </div>
      </section>

      <!-- DESTINATIONS SECTION -->
      <section class="country_section" v-if="pageData.destinations">
        <div class="country_section_heading">
          <div
            class="country_section_kicker editable-element"
            @click="
              startEdit(
                ['destinations', 'kicker'],
                pageData.destinations.kicker || '',
              )
            "
          >
            {{ escapeHtml(pageData.destinations.kicker || "") }}
          </div>

          <h2
            class="country_section_title editable-element"
            @click="
              startEdit(
                ['destinations', 'title'],
                pageData.destinations.title || '',
              )
            "
          >
            {{ escapeHtml(pageData.destinations.title || "") }}
          </h2>

          <p
            class="editable-element"
            @click="
              startEdit(
                ['destinations', 'description'],
                pageData.destinations.description || '',
              )
            "
          >
            {{ escapeHtml(pageData.destinations.description || "") }}
          </p>
        </div>

        <div
          class="country_destination_grid"
          v-if="
            pageData.destinations.items && pageData.destinations.items.length
          "
        >
          <a
            v-for="(item, index) in pageData.destinations.items"
            :key="index"
            :href="safeUrl(item.url || '#')"
            class="country_destination"
          >
            <img
              :src="item.image?.url || ''"
              :alt="item.image?.alt || ''"
              loading="lazy"
              class="editable-element"
              @click.prevent.stop="
                startEdit(
                  ['destinations', 'items', index, 'image', 'url'],
                  item.image?.url || '',
                )
              "
            />

            <div class="country_destination_content">
              <h3
                class="editable-element"
                @click.prevent.stop="
                  startEdit(
                    ['destinations', 'items', index, 'title'],
                    item.title || '',
                  )
                "
              >
                {{ escapeHtml(item.title || "") }}
              </h3>

              <p
                class="editable-element"
                @click.prevent.stop="
                  startEdit(
                    ['destinations', 'items', index, 'description'],
                    item.description || '',
                  )
                "
              >
                {{ escapeHtml(item.description || "") }}
              </p>
            </div>
          </a>
        </div>
      </section>

      <!-- TIPS SECTION -->
      <section class="country_section" v-if="pageData.tips">
        <div class="country_section_heading">
          <div
            class="country_section_kicker editable-element"
            @click="startEdit(['tips', 'kicker'], pageData.tips.kicker || '')"
          >
            {{ escapeHtml(pageData.tips.kicker || "") }}
          </div>

          <h2
            class="country_section_title editable-element"
            @click="startEdit(['tips', 'title'], pageData.tips.title || '')"
          >
            {{ escapeHtml(pageData.tips.title || "") }}
          </h2>

          <p
            class="editable-element"
            @click="
              startEdit(
                ['tips', 'description'],
                pageData.tips.description || '',
              )
            "
          >
            {{ escapeHtml(pageData.tips.description || "") }}
          </p>
        </div>

        <div
          class="country_tips"
          v-if="pageData.tips.items && pageData.tips.items.length"
        >
          <article
            v-for="(item, index) in pageData.tips.items"
            :key="index"
            class="country_tip"
          >
            <div class="country_tip_image">
              <img
                :src="item.image?.url || ''"
                :alt="item.image?.alt || ''"
                loading="lazy"
                class="editable-element"
                @click="
                  startEdit(
                    ['tips', 'items', index, 'image', 'url'],
                    item.image?.url || '',
                  )
                "
              />
            </div>

            <div class="country_tip_content">
              <h3
                class="editable-element"
                @click="
                  startEdit(['tips', 'items', index, 'title'], item.title || '')
                "
              >
                {{ escapeHtml(item.title || "") }}
              </h3>

              <p
                class="country_tip_intro editable-element"
                @click="
                  startEdit(['tips', 'items', index, 'intro'], item.intro || '')
                "
              >
                {{ escapeHtml(item.intro || "") }}
              </p>

              <div
                v-for="(block, blockIndex) in item.blocks || []"
                :key="blockIndex"
                class="country_tip_block"
              >
                <strong
                  class="editable-element"
                  @click="
                    startEdit(
                      ['tips', 'items', index, 'blocks', blockIndex, 'title'],
                      block.title || '',
                    )
                  "
                >
                  {{ escapeHtml(block.title || "") }}
                </strong>

                <p
                  class="editable-element"
                  @click="
                    startEdit(
                      [
                        'tips',
                        'items',
                        index,
                        'blocks',
                        blockIndex,
                        'description',
                      ],
                      block.description || '',
                    )
                  "
                >
                  {{ escapeHtml(block.description || "") }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- GUIDE SECTION -->
      <section
        class="country_section"
        v-if="
          pageData.guide &&
          pageData.guide.content &&
          pageData.guide.content.length
        "
      >
        <div class="country_guide">
          <div
            class="country_section_kicker editable-element"
            @click="startEdit(['guide', 'kicker'], pageData.guide.kicker || '')"
          >
            {{ escapeHtml(pageData.guide.kicker || "") }}
          </div>

          <h2
            class="editable-element"
            @click="startEdit(['guide', 'title'], pageData.guide.title || '')"
          >
            {{ escapeHtml(pageData.guide.title || "") }}
          </h2>

          <template v-for="(node, nodeIndex) in pageData.guide.content">
            <p
              v-if="node.type === 'paragraph'"
              :key="'p-' + nodeIndex"
              class="editable-element"
              @click="
                startEdit(
                  ['guide', 'content', nodeIndex, 'text'],
                  node.text || '',
                )
              "
            >
              {{ escapeHtml(node.text || "") }}
            </p>

            <template v-if="node.type === 'heading'">
              <h2
                v-if="node.level === 2"
                :key="'h2-' + nodeIndex"
                class="editable-element"
                @click="
                  startEdit(
                    ['guide', 'content', nodeIndex, 'text'],
                    node.text || '',
                  )
                "
              >
                {{ escapeHtml(node.text || "") }}
              </h2>
              <h3
                v-else
                :key="'h3-' + nodeIndex"
                class="editable-element"
                @click="
                  startEdit(
                    ['guide', 'content', nodeIndex, 'text'],
                    node.text || '',
                  )
                "
              >
                {{ escapeHtml(node.text || "") }}
              </h3>
            </template>

            <div
              v-if="node.type === 'image'"
              :key="'img-' + nodeIndex"
              class="country_guide_image"
            >
              <img
                :src="node.image?.url || ''"
                :alt="node.image?.alt || ''"
                loading="lazy"
                class="editable-element"
                @click="
                  startEdit(
                    ['guide', 'content', nodeIndex, 'image', 'url'],
                    node.image?.url || '',
                  )
                "
              />
            </div>

            <div
              v-if="node.type === 'split'"
              :key="'split-' + nodeIndex"
              class="country_guide_split"
              :class="{ 'image-right': node.image_position === 'right' }"
            >
              <template v-if="node.image_position === 'left'">
                <div class="country_guide_split_image">
                  <img
                    :src="node.image?.url || ''"
                    :alt="node.image?.alt || ''"
                    loading="lazy"
                    class="editable-element"
                    @click="
                      startEdit(
                        ['guide', 'content', nodeIndex, 'image', 'url'],
                        node.image?.url || '',
                      )
                    "
                  />
                </div>
                <div class="country_guide_split_content">
                  <template
                    v-for="(childNode, childIndex) in node.content || []"
                  >
                    <p
                      v-if="childNode.type === 'paragraph'"
                      :key="'split-p-' + childIndex"
                      class="editable-element"
                      @click="
                        startEdit(
                          [
                            'guide',
                            'content',
                            nodeIndex,
                            'content',
                            childIndex,
                            'text',
                          ],
                          childNode.text || '',
                        )
                      "
                    >
                      {{ escapeHtml(childNode.text || "") }}
                    </p>
                    <h3
                      v-if="
                        childNode.type === 'heading' && childNode.level === 3
                      "
                      :key="'split-h3-' + childIndex"
                      class="editable-element"
                      @click="
                        startEdit(
                          [
                            'guide',
                            'content',
                            nodeIndex,
                            'content',
                            childIndex,
                            'text',
                          ],
                          childNode.text || '',
                        )
                      "
                    >
                      {{ escapeHtml(childNode.text || "") }}
                    </h3>
                  </template>
                </div>
              </template>

              <template v-else>
                <div class="country_guide_split_content">
                  <template
                    v-for="(childNode, childIndex) in node.content || []"
                  >
                    <p
                      v-if="childNode.type === 'paragraph'"
                      :key="'split-p-' + childIndex"
                      class="editable-element"
                      @click="
                        startEdit(
                          [
                            'guide',
                            'content',
                            nodeIndex,
                            'content',
                            childIndex,
                            'text',
                          ],
                          childNode.text || '',
                        )
                      "
                    >
                      {{ escapeHtml(childNode.text || "") }}
                    </p>
                    <h3
                      v-if="
                        childNode.type === 'heading' && childNode.level === 3
                      "
                      :key="'split-h3-' + childIndex"
                      class="editable-element"
                      @click="
                        startEdit(
                          [
                            'guide',
                            'content',
                            nodeIndex,
                            'content',
                            childIndex,
                            'text',
                          ],
                          childNode.text || '',
                        )
                      "
                    >
                      {{ escapeHtml(childNode.text || "") }}
                    </h3>
                  </template>
                </div>
                <div class="country_guide_split_image">
                  <img
                    :src="node.image?.url || ''"
                    :alt="node.image?.alt || ''"
                    loading="lazy"
                    class="editable-element"
                    @click="
                      startEdit(
                        ['guide', 'content', nodeIndex, 'image', 'url'],
                        node.image?.url || '',
                      )
                    "
                  />
                </div>
              </template>
            </div>

            <div
              v-if="node.type === 'note'"
              :key="'note-' + nodeIndex"
              class="country_note"
            >
              <strong
                class="editable-element"
                @click="
                  startEdit(
                    ['guide', 'content', nodeIndex, 'title'],
                    node.title || '',
                  )
                "
              >
                {{ escapeHtml(node.title || "") }}
              </strong>
              <span
                class="editable-element"
                @click="
                  startEdit(
                    ['guide', 'content', nodeIndex, 'text'],
                    node.text || '',
                  )
                "
              >
                {{ escapeHtml(node.text || "") }}
              </span>
            </div>
          </template>
        </div>
      </section>

      <!-- FAQ SECTION -->
      <section
        class="country_section"
        v-if="pageData.faq && pageData.faq.items && pageData.faq.items.length"
      >
        <div class="country_section_heading">
          <div
            class="country_section_kicker editable-element"
            @click="startEdit(['faq', 'kicker'], pageData.faq.kicker || '')"
          >
            {{ escapeHtml(pageData.faq.kicker || "") }}
          </div>

          <h2
            class="country_section_title editable-element"
            @click="startEdit(['faq', 'title'], pageData.faq.title || '')"
          >
            {{ escapeHtml(pageData.faq.title || "") }}
          </h2>

          <p
            class="editable-element"
            @click="
              startEdit(['faq', 'description'], pageData.faq.description || '')
            "
          >
            {{ escapeHtml(pageData.faq.description || "") }}
          </p>
        </div>

        <div class="country_faq">
          <details
            v-for="(item, index) in pageData.faq.items"
            :key="index"
            class="faq-item"
          >
            <summary
              class="editable-element"
              @click.exact="
                startEdit(
                  ['faq', 'items', index, 'question'],
                  item.question || '',
                )
              "
              @click.middle=""
            >
              {{ escapeHtml(item.question || "") }}
            </summary>

            <p
              class="editable-element"
              @click="
                startEdit(['faq', 'items', index, 'answer'], item.answer || '')
              "
            >
              {{ escapeHtml(item.answer || "") }}
            </p>
          </details>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ==== Template CSS from template.html ==== */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.country_page {
  --country_cream: #faf8f3;
  --country_bg: #f5f7f6;
  --card_color: #ffffff;
  --country_text: #17221d;
  --country_muted: #66736d;
  --country_border: #e4e9e6;
  --country_shadow: 0 10px 35px rgba(20, 45, 35, 0.08);
  --country_radius: 20px;
  --accent-brand: #17372b;
  color: var(--country_text);
  line-height: 1.7;
}

.country_page *,
.country_page *::before,
.country_page *::after {
  box-sizing: border-box;
}

.country_page img {
  display: block;
  max-width: 100%;
  margin: 0;
}

.country_container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

/* Editable indicators */
.editable-element {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.editable-element:hover::after {
  content: "📝 Bearbeiten";
  position: absolute;
  right: 0;
  bottom: 100%;
  background: rgba(23, 55, 43, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
}

/* Breadcrumb */
#dynamic_breadcrumb {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto 24px;
  font-size: 14px;
  color: var(--country_muted);
}

#dynamic_breadcrumb .breadcrumb_inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  line-height: 1.5;
}

#dynamic_breadcrumb a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

#dynamic_breadcrumb a:hover {
  color: var(--accent-brand);
}

#dynamic_breadcrumb .breadcrumb_separator {
  opacity: 0.4;
}

#dynamic_breadcrumb [aria-current="page"] {
  color: var(--country_text);
  font-weight: 600;
}

/* Hero */
.country_hero {
  position: relative;
  overflow: hidden;
  min-height: 520px;
  border-radius: 28px;
  margin-bottom: 70px;
  background: #17372b;
  box-shadow: var(--country_shadow);
  margin: 0;
}

.country_hero img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.country_hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(8, 30, 22, 0.9) 0%,
    rgba(8, 30, 22, 0.7) 40%,
    rgba(8, 30, 22, 0.22) 78%,
    rgba(8, 30, 22, 0.08) 100%
  );
}

.country_hero_content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  padding: 100px 65px;
  color: #fff;
}

.country_eyebrow {
  display: inline-block;
  margin-bottom: 18px;
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.country_hero h1 {
  margin: 0 0 20px;
  color: #fff;
  font-size: clamp(2.5rem, 6vw, 4.7rem);
  line-height: 1.02;
  letter-spacing: -0.045em;
}

.country_hero p {
  max-width: 650px;
  margin: 0 0 30px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 1.1rem;
  line-height: 1.75;
}

.country_hero_buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.country_button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 10px 19px;
  border-radius: 999px;
  text-decoration: none !important;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  color: inherit !important;
}

.country_button:hover {
  transform: translateY(-2px);
}

.country_button_primary {
  background: #fff;
  color: var(--accent-brand) !important;
}

.country_button_secondary {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* General sections */
.country_section {
  margin-bottom: 85px;
}

.country_section_kicker {
  margin-bottom: 8px;
  color: var(--accent-brand);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.country_section_title {
  margin: 0 0 18px;
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.country_section_heading {
  max-width: 800px;
  margin-bottom: 30px;
  margin-top: 30px;
}

.country_section_heading p {
  margin: 0;
  color: var(--country_muted);
}

/* Intro */
.country_intro {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 55px;
  align-items: center;
  margin-bottom: 85px;
  margin-top: 30px;
}

.country_intro_copy p {
  color: #48554f;
}

.country_intro_image {
  overflow: hidden;
  min-height: 420px;
  border-radius: 24px;
  box-shadow: var(--country_shadow);
}

.country_intro_image img {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  border-radius: 5%;
}

/* Image strip */
.country_image_strip {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr;
  gap: 14px;
  margin-bottom: 85px;
}

.country_image_strip figure {
  position: relative;
  min-height: 250px;
  margin: 0;
  overflow: hidden;
  border-radius: 20px;
  background: #dfe7e2;
}

.country_image_strip figure:first-child {
  min-height: 330px;
}

.country_image_strip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}

.country_image_strip figure:hover img {
  transform: scale(1.04);
}

.country_image_strip figcaption {
  position: absolute;
  right: 15px;
  bottom: 15px;
  left: 15px;
  padding: 9px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.48);
  color: #fff;
  font-size: 0.86rem;
}

/* Region cards */
.country_region_grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

.country_region_card {
  display: grid;
  grid-template-columns: 42% 58%;
  min-height: 250px;
  overflow: hidden;
  border: 1px solid var(--country_border);
  border-radius: var(--country_radius);
  background: var(--card_color);
  box-shadow: 0 4px 20px rgba(20, 45, 35, 0.04);
  text-decoration: none !important;
  color: inherit !important;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.country_region_card:hover {
  transform: translateY(-5px);
  border-color: rgba(23, 107, 77, 0.25);
  box-shadow: var(--country_shadow);
}

.country_region_image {
  height: 110%;
  min-height: 250px;
  overflow: hidden;
  margin-top: -22px;
}

.country_region_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}

.country_region_card:hover .country_region_image img {
  transform: scale(1.05);
}

.country_region_content {
  padding: 27px;
}

.country_region_content h3 {
  margin: 0 0 9px;
  font-size: 1.35rem;
}

.country_region_content p {
  margin: 0 0 18px;
  color: var(--country_muted);
  font-size: 0.94rem;
  line-height: 1.65;
}

.country_region_link {
  color: var(--accent-brand);
  font-weight: 750;
  font-size: 0.9rem;
}

/* Topic grid */
.country_topic_grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.country_topic {
  overflow: hidden;
  border-radius: 18px;
  background: var(--country_cream);
  border: 1px solid #eeeae1;
}

.country_topic_image {
  height: 150px;
  overflow: hidden;
  margin: 0;
}

.country_topic_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.country_topic_content {
  padding: 20px;
}

.country_topic h3 {
  margin: 0 0 7px;
  font-size: 1.05rem;
}

.country_topic p {
  margin: 0;
  color: var(--country_muted);
  font-size: 0.88rem;
}

/* Destination grid */
.country_destination_grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.country_destination {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  border-radius: 20px;
  color: #fff !important;
  text-decoration: none !important;
  background: #17372b;
}

.country_destination img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}

.country_destination::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    0deg,
    rgba(5, 20, 14, 0.9),
    rgba(5, 20, 14, 0.04) 72%
  );
}

.country_destination:hover img {
  transform: scale(1.05);
}

.country_destination_content {
  position: absolute;
  z-index: 2;
  right: 22px;
  bottom: 20px;
  left: 22px;
}

.country_destination_content h3 {
  margin: 0 0 4px;
  color: #fff;
  font-size: 1.45rem;
}

.country_destination_content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
}

/* Tips */
.country_tips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.country_tip {
  overflow: hidden;
  border-radius: var(--country_radius);
  background: var(--card_color);
  border: 1px solid var(--country_border);
  box-shadow: 0 5px 25px rgba(20, 45, 35, 0.04);
}

.country_tip_image {
  height: 220px;
  overflow: hidden;
}

.country_tip_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.country_tip_content {
  padding: 27px;
}

.country_tip h3 {
  margin: 0 0 12px;
  font-size: 1.3rem;
}

.country_tip_intro {
  margin: 0 0 20px;
  color: #53605a;
}

.country_tip_block {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--country_border);
}

.country_tip_block strong {
  display: block;
  margin-bottom: 5px;
  color: var(--country_text);
  font-size: 0.92rem;
}

.country_tip_block p {
  margin: 0;
  color: var(--country_muted);
  font-size: 0.92rem;
}

/* Guide */
.country_guide {
  max-width: 980px;
}

.country_guide p,
.country_guide li {
  color: #48554f;
}

.country_guide h2 {
  margin-top: 50px;
  margin-bottom: 15px;
  font-size: 2rem;
  line-height: 1.2;
}

.country_guide h3 {
  margin-top: 35px;
  margin-bottom: 10px;
  font-size: 1.35rem;
}

.country_guide_image {
  width: 100%;
  height: 390px;
  margin: 35px 0;
  overflow: hidden;
  border-radius: 24px;
}

.country_guide_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.country_guide_split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: center;
  margin: 45px 0;
}

.country_guide_split_image {
  overflow: hidden;
  min-height: 330px;
  border-radius: 22px;
}

.country_guide_split_image img {
  width: 100%;
  height: 100%;
  min-height: 330px;
  object-fit: cover;
}

.country_guide_split_content h3 {
  margin-top: 0;
}

.country_note {
  margin: 28px 0;
  padding: 20px 22px;
  border-left: 4px solid var(--accent-brand);
  border-radius: 0 14px 14px 0;
  background: #f0f8f4;
}

/* FAQ */
.country_faq {
  display: grid;
  gap: 12px;
  max-width: 900px;
}

.country_faq details {
  padding: 19px 21px;
  border: 1px solid var(--country_border);
  border-radius: 15px;
  background: #fff;
}

.country_faq summary {
  cursor: pointer;
  font-weight: 750;
}

.country_faq p {
  margin: 13px 0 0;
  color: var(--country_muted);
}

/* Community */
.country_community {
  padding: 45px;
  border-radius: 28px;
  background: linear-gradient(135deg, #eef8f3, #faf8f3);
  border: 1px solid #e1ebe5;
}

.country_community_header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 25px;
  margin-bottom: 25px;
}

.country_community_header h2 {
  margin: 0 0 6px;
}

.country_community_header p {
  margin: 0;
  color: var(--country_muted);
}

#country_posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.community-placeholder {
  padding: 30px;
  text-align: center;
  border: 1px solid #e4e9e6;
  border-radius: 16px;
  background: #fff;
  grid-column: 1/-1;
  color: var(--country_muted);
}

/* Responsive */
@media (max-width: 1000px) {
  .country_intro {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .country_intro_image,
  .country_intro_image img {
    min-height: 360px;
  }
  .country_region_grid {
    grid-template-columns: 1fr;
  }
  .country_topic_grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .country_destination_grid {
    grid-template-columns: 1fr 1fr;
  }
  #country_posts {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .country_container,
  #dynamic_breadcrumb {
    width: min(100% - 24px, 1180px);
  }
  .country_hero {
    min-height: 570px;
    border-radius: 20px;
    margin-bottom: 55px;
  }
  .country_hero_content {
    padding: 70px 28px;
  }
  .country_hero p {
    font-size: 1rem;
  }
  .country_image_strip {
    grid-template-columns: 1fr;
  }
  .country_image_strip figure,
  .country_image_strip figure:first-child {
    min-height: 250px;
  }
  .country_region_card {
    grid-template-columns: 1fr;
  }
  .country_region_image {
    height: 230px;
    min-height: 230px;
  }
  .country_destination_grid,
  .country_tips,
  #country_posts {
    grid-template-columns: 1fr;
  }
  .country_topic_grid {
    grid-template-columns: 1fr 1fr;
  }
  .country_tip_image {
    height: 230px;
  }
  .country_guide_image {
    height: 270px;
  }
  .country_guide_split {
    grid-template-columns: 1fr;
  }
  .country_guide_split_image,
  .country_guide_split_image img {
    min-height: 270px;
  }
  .country_community {
    padding: 28px 20px;
  }
  .country_community_header {
    display: block;
  }
}

@media (max-width: 480px) {
  .country_container,
  #dynamic_breadcrumb {
    width: min(100% - 18px, 1180px);
  }
  .country_hero {
    min-height: 600px;
  }
  .country_hero_content {
    padding: 55px 21px;
  }
  .country_hero_buttons {
    flex-direction: column;
  }
  .country_button {
    width: 100%;
  }
  .country_topic_grid {
    grid-template-columns: 1fr;
  }
  .country_section {
    margin-bottom: 65px;
  }
  .country_section_title {
    font-size: 1.85rem;
  }
  .country_region_content,
  .country_tip_content {
    padding: 22px;
  }
  .country_destination {
    min-height: 280px;
  }
}

/* Error and debug styles */
.preview-error {
  padding: 40px;
  text-align: center;
  color: #ef4444;
  background: white;
  border-radius: 12px;
  border: 2px solid #fecaca;
}

.preview-error h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.preview-error p {
  margin: 5px 0;
}
</style>
