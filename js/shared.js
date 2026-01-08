/**
 * OJS Metadata Normalizer - Shared Utilities
 * Version: 1.0.0
 *
 * Shared utility functions for all metadata normalizer modules
 * Must be loaded before other normalizer modules
 */

(function (window) {
  "use strict";

  // Create global namespace
  window.OJSMetadataNormalizer = window.OJSMetadataNormalizer || {};

  const Shared = {
    /**
     * Configuration
     */
    config: {
      DEBUG: false,
      DEBOUNCE_DELAY: 300,
    },

    /**
     * Debug logging
     * @param {string} module - Module name
     * @param {...any} args - Log arguments
     */
    log: function (module, ...args) {
      if (this.config.DEBUG) {
        console.log(`[Metadata Normalizer - ${module}]`, ...args);
      }
    },

    /**
     * Strip all HTML tags from text
     * @param {string} html - HTML content
     * @returns {string} - Plain text
     */
    stripHtmlTags: function (html) {
      if (!html || typeof html !== "string") {
        return "";
      }

      // Create temporary element for safe HTML parsing
      const temp = document.createElement("div");
      temp.innerHTML = html;

      // Extract text content (automatically strips tags)
      return temp.textContent || temp.innerText || "";
    },

    /**
     * Check if TinyMCE is active for a given element
     * @param {HTMLElement} element - Textarea element
     * @returns {boolean}
     */
    isTinyMCEActive: function (element) {
      if (typeof tinymce === "undefined") {
        return false;
      }

      const id = element.id;
      if (!id) {
        return false;
      }

      const editor = tinymce.get(id);
      return editor !== null && editor !== undefined;
    },

    /**
     * Get content from element (handles TinyMCE)
     * @param {HTMLElement} element
     * @returns {string}
     */
    getElementContent: function (element) {
      if (this.isTinyMCEActive(element)) {
        const editor = tinymce.get(element.id);
        return editor.getContent();
      }
      return element.value;
    },

    /**
     * Set content to element (handles TinyMCE)
     * @param {HTMLElement} element
     * @param {string} content
     */
    setElementContent: function (element, content) {
      if (this.isTinyMCEActive(element)) {
        const editor = tinymce.get(element.id);
        editor.setContent(content);
      } else {
        element.value = content;
      }

      // Trigger change event for OJS validation
      const event = new Event("change", { bubbles: true });
      element.dispatchEvent(event);
    },

    /**
     * Create debounced function
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function}
     */
    debounce: function (func, delay) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    },

    /**
     * Check if element matches any selector in array
     * @param {HTMLElement} element
     * @param {string[]} selectors
     * @returns {boolean}
     */
    matchesAnySelector: function (element, selectors) {
      if (!element || !element.matches) {
        return false;
      }

      return selectors.some((selector) => {
        try {
          return element.matches(selector);
        } catch (e) {
          // Invalid selector, skip
          return false;
        }
      });
    },

    /**
     * Wait for DOM ready
     * @param {Function} callback
     */
    onReady: function (callback) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
      } else {
        callback();
      }
    },

    /**
     * Create MutationObserver for dynamic content
     * @param {Function} callback - Called when mutations detected
     * @returns {MutationObserver}
     */
    observeDynamicContent: function (callback) {
      const observer = new MutationObserver(callback);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      return observer;
    },
  };

  // Export to global namespace
  window.OJSMetadataNormalizer.Shared = Shared;

  // Log initialization
  Shared.log("Shared", "Utilities loaded");
})(window);
