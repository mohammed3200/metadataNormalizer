/**
 * OJS Keywords Normalizer
 * Version: 1.0.0
 * Compatible with: OJS 3.5.0+
 *
 * Automatically normalizes keyword input by:
 * - Converting Arabic commas to English commas
 * - Splitting on multiple separators
 * - Trimming whitespace
 * - Removing duplicates
 * - Cleaning empty entries
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    // Selectors for keyword input fields
    SELECTORS: {
      // Legacy input fields (Smarty templates)
      legacy: 'input[name*="keywords"], textarea[name*="keywords"]',
      // Vue.js tag input containers
      vueTagContainer: ".pkpFormField--options, .pkpTagInput",
      // Individual tag elements
      vueTags: '.pkpTag, .pkp_tag_input, [class*="tag"]',
    },
    // Separator characters to split on
    SEPARATORS: {
      arabicComma: "\u060C", // ،
      englishComma: ",",
      semicolon: ";",
      newline: "\n",
      tab: "\t",
    },
    // Debounce delay for processing (ms)
    DEBOUNCE_DELAY: 300,
  };

  /**
   * Normalize keyword string
   * @param {string} input - Raw keyword input
   * @returns {string[]} - Array of normalized keywords
   */
  function normalizeKeywords(input) {
    if (!input || typeof input !== "string") {
      return [];
    }

    // Step 1: Replace Arabic commas with English commas
    let normalized = input.replace(/،/g, ",");

    // Step 2: Replace other separators with commas
    normalized = normalized
      .replace(/;/g, ",")
      .replace(/\n/g, ",")
      .replace(/\t/g, ",");

    // Step 3: Split on commas
    let keywords = normalized.split(",");

    // Step 4: Trim whitespace and filter empty entries
    keywords = keywords.map((kw) => kw.trim()).filter((kw) => kw.length > 0);

    // Step 5: Remove duplicates (case-insensitive)
    const seen = new Map();
    const unique = [];

    keywords.forEach((kw) => {
      const lower = kw.toLowerCase();
      if (!seen.has(lower)) {
        seen.set(lower, true);
        unique.push(kw);
      }
    });

    return unique;
  }

  /**
   * Process legacy input field (plain input/textarea)
   * @param {HTMLElement} field - Input field element
   */
  function processLegacyField(field) {
    const rawValue = field.value;
    if (!rawValue) return;

    const keywords = normalizeKeywords(rawValue);

    // Join keywords back with English commas
    const normalizedValue = keywords.join(", ");

    // Only update if different
    if (normalizedValue !== rawValue) {
      field.value = normalizedValue;

      // Trigger change event for OJS validation
      const event = new Event("change", { bubbles: true });
      field.dispatchEvent(event);

      console.log("[Keywords Normalizer] Processed legacy field:", {
        original: rawValue,
        normalized: normalizedValue,
      });
    }
  }

  /**
   * Process Vue.js tag input component
   * @param {HTMLElement} container - Vue component container
   */
  function processVueTagInput(container) {
    // Vue.js implementation varies - this is a generic approach

    // Try to find input element within Vue component
    const input = container.querySelector('input[type="text"]');
    if (!input) return;

    const rawValue = input.value;
    if (!rawValue) return;

    const keywords = normalizeKeywords(rawValue);

    // For Vue components, we need to clear and re-add tags
    // This simulates the user pressing Enter for each keyword
    if (keywords.length > 1 && rawValue.includes(",")) {
      // Clear the input
      input.value = "";

      // Simulate creating tags
      keywords.forEach((keyword, index) => {
        setTimeout(() => {
          input.value = keyword;

          // Simulate Enter keypress
          const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
          });
          input.dispatchEvent(enterEvent);

          // Clear for next keyword
          if (index < keywords.length - 1) {
            input.value = "";
          }
        }, index * 50); // Stagger to ensure Vue processes each
      });

      console.log("[Keywords Normalizer] Processed Vue tag input:", keywords);
    }
  }

  /**
   * Attach blur event handler to legacy fields
   */
  function attachLegacyHandlers() {
    // Use event delegation to handle dynamically added fields
    document.addEventListener(
      "blur",
      function (e) {
        const target = e.target;

        // Check if target matches our selectors
        if (target.matches(CONFIG.SELECTORS.legacy)) {
          processLegacyField(target);
        }
      },
      true
    ); // Use capture phase for better compatibility

    console.log("[Keywords Normalizer] Legacy handlers attached");
  }

  /**
   * Attach handlers to Vue.js tag inputs
   */
  function attachVueHandlers() {
    // Use MutationObserver to detect Vue component rendering
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // Element node
            // Check if node or its children contain Vue tag input
            const containers =
              node.matches && node.matches(CONFIG.SELECTORS.vueTagContainer)
                ? [node]
                : node.querySelectorAll
                ? Array.from(
                    node.querySelectorAll(CONFIG.SELECTORS.vueTagContainer)
                  )
                : [];

            containers.forEach((container) => {
              const input = container.querySelector('input[type="text"]');
              if (input) {
                input.addEventListener("blur", function () {
                  processVueTagInput(container);
                });
              }
            });
          }
        });
      });
    });

    // Observe entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also handle existing Vue inputs on page load
    setTimeout(function () {
      document
        .querySelectorAll(CONFIG.SELECTORS.vueTagContainer)
        .forEach((container) => {
          const input = container.querySelector('input[type="text"]');
          if (input) {
            input.addEventListener("blur", function () {
              processVueTagInput(container);
            });
          }
        });
    }, 1000);

    console.log("[Keywords Normalizer] Vue handlers attached");
  }

  /**
   * Initialize the keywords normalizer
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    console.log("[Keywords Normalizer] Initializing...");

    // Attach handlers for both legacy and Vue inputs
    attachLegacyHandlers();
    attachVueHandlers();

    console.log("[Keywords Normalizer] Initialization complete");
  }

  // Auto-initialize
  init();

  // Expose for manual testing
  window.OJSKeywordsNormalizer = {
    normalize: normalizeKeywords,
    processField: processLegacyField,
    version: "1.0.0",
  };
})();
