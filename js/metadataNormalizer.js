/**
 * OJS Metadata Normalizer - Title & Abstract Module
 * Version: 1.0.0
 *
 * Normalizes Title and Abstract fields by:
 * - Removing HTML tags
 * - Normalizing line breaks
 * - Collapsing whitespace
 * - Preserving semantic content
 */

(function () {
  "use strict";

  // Wait for shared utilities to load
  if (!window.OJSMetadataNormalizer || !window.OJSMetadataNormalizer.Shared) {
    console.error("[Metadata Normalizer] Shared utilities not loaded!");
    return;
  }

  const Shared = window.OJSMetadataNormalizer.Shared;
  const log = (...args) => Shared.log("Title/Abstract", ...args);

  // Configuration
  const CONFIG = {
    TITLE_SELECTORS: [
      'input[id*="title-"]',
      'input[name*="title"]',
      'input[id*="prefix-"]',
      'input[name*="prefix"]',
      'input[id*="subtitle-"]',
      'input[name*="subtitle"]',
    ],
    ABSTRACT_SELECTORS: [
      'textarea[id*="abstract"]',
      'textarea[name*="abstract"]',
      "textarea.richContent",
    ],
  };

  /**
   * Normalize Title field
   * Rules:
   * - Strip HTML tags
   * - Remove line breaks
   * - Collapse multiple spaces
   * - Trim whitespace
   *
   * @param {string} input - Raw title input
   * @returns {string} - Normalized title
   */
  function normalizeTitle(input) {
    if (!input || typeof input !== "string") {
      return "";
    }

    let normalized = input;

    // Step 1: Strip HTML tags
    normalized = Shared.stripHtmlTags(normalized);

    // Step 2: Remove all line breaks (\n, \r, \r\n)
    normalized = normalized.replace(/[\r\n]+/g, " ");

    // Step 3: Collapse multiple spaces into single space
    normalized = normalized.replace(/\s+/g, " ");

    // Step 4: Trim leading/trailing whitespace
    normalized = normalized.trim();

    return normalized;
  }

  /**
   * Normalize Abstract field
   * Rules:
   * - Strip HTML tags
   * - Replace line breaks with spaces
   * - Collapse multiple spaces
   * - Preserve sentence structure
   * - Keep as continuous paragraph
   *
   * @param {string} input - Raw abstract input
   * @returns {string} - Normalized abstract
   */
  function normalizeAbstract(input) {
    if (!input || typeof input !== "string") {
      return "";
    }

    let normalized = input;

    // Step 1: Handle paragraph tags - replace with space
    normalized = normalized.replace(/<\/p>\s*<p[^>]*>/gi, " ");
    normalized = normalized.replace(/<\/?p[^>]*>/gi, " ");

    // Step 2: Handle list items - replace with space
    normalized = normalized.replace(/<\/li>\s*<li[^>]*>/gi, " ");
    normalized = normalized.replace(/<\/?[uo]l[^>]*>/gi, " ");
    normalized = normalized.replace(/<\/?li[^>]*>/gi, " ");

    // Step 3: Handle line breaks (br tags)
    normalized = normalized.replace(/<br\s*\/?>/gi, " ");

    // Step 4: Strip remaining HTML tags
    normalized = Shared.stripHtmlTags(normalized);

    // Step 5: Replace actual line break characters with space
    normalized = normalized.replace(/[\r\n]+/g, " ");

    // Step 6: Collapse multiple spaces into single space
    normalized = normalized.replace(/\s+/g, " ");

    // Step 7: Trim leading/trailing whitespace
    normalized = normalized.trim();

    return normalized;
  }

  /**
   * Process title field on blur
   * @param {HTMLElement} field - Title input element
   */
  function processTitleField(field) {
    const rawValue = Shared.getElementContent(field);

    if (!rawValue) {
      return;
    }

    const normalized = normalizeTitle(rawValue);

    // Only update if content changed
    if (normalized !== rawValue) {
      Shared.setElementContent(field, normalized);

      log("Title normalized:", {
        field: field.id || field.name,
        original:
          rawValue.substring(0, 50) + (rawValue.length > 50 ? "..." : ""),
        normalized:
          normalized.substring(0, 50) + (normalized.length > 50 ? "..." : ""),
      });
    }
  }

  /**
   * Process abstract field on blur
   * @param {HTMLElement} field - Abstract textarea element
   */
  function processAbstractField(field) {
    const rawValue = Shared.getElementContent(field);

    if (!rawValue) {
      return;
    }

    const normalized = normalizeAbstract(rawValue);

    // Only update if content changed
    if (normalized !== rawValue) {
      Shared.setElementContent(field, normalized);

      log("Abstract normalized:", {
        field: field.id || field.name,
        original: rawValue.substring(0, 100) + "...",
        normalized: normalized.substring(0, 100) + "...",
        tinymce: Shared.isTinyMCEActive(field),
      });
    }
  }

  /**
   * Attach event handlers using delegation
   */
  function attachHandlers() {
    // Title field handlers
    document.addEventListener(
      "blur",
      function (e) {
        if (Shared.matchesAnySelector(e.target, CONFIG.TITLE_SELECTORS)) {
          processTitleField(e.target);
        }
      },
      true
    );

    // Abstract field handlers
    document.addEventListener(
      "blur",
      function (e) {
        if (Shared.matchesAnySelector(e.target, CONFIG.ABSTRACT_SELECTORS)) {
          processAbstractField(e.target);
        }
      },
      true
    );

    log("Handlers attached");
  }

  /**
   * Handle TinyMCE editors
   */
  function handleTinyMCE() {
    if (typeof tinymce !== "undefined") {
      tinymce.on("AddEditor", function (e) {
        const editor = e.editor;

        editor.on("blur", function () {
          const element = document.getElementById(editor.id);

          if (
            element &&
            Shared.matchesAnySelector(element, CONFIG.ABSTRACT_SELECTORS)
          ) {
            processAbstractField(element);
          }
        });

        log("TinyMCE editor registered:", editor.id);
      });
    }
  }

  /**
   * Initialize
   */
  function init() {
    Shared.onReady(function () {
      log("Initializing...");
      attachHandlers();
      handleTinyMCE();
      log("Initialized");
    });
  }

  // Auto-initialize
  init();

  // Export for testing
  window.OJSMetadataNormalizer.TitleAbstract = {
    normalizeTitle: normalizeTitle,
    normalizeAbstract: normalizeAbstract,
    processTitle: processTitleField,
    processAbstract: processAbstractField,
    version: "1.0.0",
  };
})();
