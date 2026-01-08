# Metadata Normalizer Plugin for OJS 3.5.0+

[![OJS Version](https://img.shields.io/badge/OJS-3.5.0+-blue.svg)](https://pkp.sfu.ca/ojs/)
[![License](https://img.shields.io/badge/license-GPL--3.0-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-success.svg)]()

A unified plugin for automatically normalizing submission metadata in Open Journal Systems (OJS) 3.5.0+.

---

## Features

✅ **Keywords Normalization**
- Converts Arabic commas (،) to English commas (,)
- Splits on multiple separators (commas, semicolons, newlines)
- Removes duplicate keywords (case-insensitive)
- Trims whitespace
- Compatible with Tag-it and Vue.js tag inputs

✅ **Title Normalization**
- Strips HTML tags from Title, Prefix, and Subtitle fields
- Removes line breaks and tabs
- Collapses multiple spaces into single space
- Ensures clean single-line titles

✅ **Abstract Normalization**
- Removes HTML formatting while preserving content
- Converts paragraphs to continuous text
- Handles TinyMCE WYSIWYG editor content
- Preserves sentence structure and punctuation
- Creates clean, indexable abstracts

---

## Why This Plugin?

**Problem:** Authors often copy-paste content from Word documents, PDFs, and web pages, introducing:
- HTML tags and formatting
- Line breaks and paragraph marks
- Arabic commas in keywords
- Duplicate keywords
- Extra whitespace

**Impact:** Poor metadata quality causes:
- Broken indexing in academic databases
- Problems with Crossref, DataCite, Google Scholar
- Inconsistent OAI-PMH harvesting
- Reduced discoverability

**Solution:** This plugin automatically cleans metadata at input time, ensuring high-quality metadata for all submissions.

---

## Technical Highlights

### Architecture

**Unified Design:**
- Single plugin handles all metadata fields
- Modular JavaScript architecture (shared utilities + field-specific modules)
- Event delegation for AJAX-loaded forms
- TinyMCE integration for WYSIWYG editors

**Upgrade-Safe:**
- Zero core file modifications
- Hook-based integration
- Selector-based targeting
- Defensive error handling

**Performance:**
- Client-side processing (no server load)
- Debounced event handlers
- < 100ms per normalization
- No impact on page load time

### Technology Stack

- **Backend:** PHP 8.2+ (OJS 3.5.0 namespace structure)
- **Frontend:** Vanilla JavaScript (ES6+)
- **Compatibility:** Vue.js 3, Smarty templates, jQuery (legacy)
- **Editors:** TinyMCE integration
- **I18n:** Multilingual field support

---


### File Structure

```
plugins/generic/metadataNormalizer/
├── MetadataNormalizerPlugin.php       # Main plugin class
├── index.php                           # Plugin loader
├── version.xml                         # Version metadata
├── js/
│   ├── shared.js                      # Shared utilities
│   ├── keywordsNormalizer.js          # Keywords module
│   └── metadataNormalizer.js          # Title & Abstract module
├── locale/
│   ├── en/locale.po                   # English translations
│   └── ar/locale.po                   # Arabic translations
└──  README.md                           # This file
```

### Enable Plugin

1. Log in as **Journal Manager**
2. Navigate to: **Settings → Website → Plugins**
3. Find **"Metadata Normalizer"** under Generic Plugins
4. Click checkbox to enable
5. Verify status shows "Enabled"

---

## Usage

**The plugin works automatically.** No configuration needed.

### For Authors

When submitting an article:
1. Enter metadata naturally (copy-paste is fine)
2. Click outside the field (blur event triggers normalization)
3. Plugin automatically cleans the content
4. Submit as usual

### For Editors

When editing metadata in the Publication tab:
1. Make changes to Title, Abstract, or Keywords
2. Click outside the field
3. Content is automatically normalized
4. Save as usual

### Supported Scenarios

✅ Author submission wizard (Vue.js)
✅ Editorial workflow metadata editing (AJAX modals)
✅ Quick metadata edit forms (Smarty templates)
✅ Multilingual fields (all languages)
✅ TinyMCE WYSIWYG editor (enabled or disabled)
✅ Plain textarea inputs
✅ Tag-it keyword inputs

---

## Examples

### Keywords Normalization

```
Input:  "research، analysis; methodology\nstatistics"
Output: "research, analysis, methodology, statistics"

Input:  "AI, machine learning, AI, MACHINE LEARNING"
Output: "AI, machine learning"
```

### Title Normalization

```
Input:  "<strong>Impact</strong> of Climate\nChange"
Output: "Impact of Climate Change"

Input:  "Title    with     extra  spaces  "
Output: "Title with extra spaces"
```

### Abstract Normalization

```
Input:  "<p><strong>Background:</strong> Study text...</p>
         <p><em>Methods:</em> We analyzed...</p>"
Output: "Background: Study text... Methods: We analyzed..."

Input:  "First line\nSecond line\nThird line"
Output: "First line Second line Third line"
```
---

## Troubleshooting

### Plugin Not Appearing

**Issue:** Plugin doesn't show in plugin list

**Solution:**
```bash
# Check file permissions
chmod 755 /path/to/ojs/plugins/generic/metadataNormalizer/
chmod 644 /path/to/ojs/plugins/generic/metadataNormalizer/*.php

# Clear cache
rm -rf /path/to/ojs/cache/*
```


### TinyMCE Issues

**Issue:** Abstract not normalizing with TinyMCE enabled

**Solution:**
1. Verify TinyMCE detected:
```javascript
console.log(typeof tinymce);  // Should be "object"
```
2. Check editor instances:
```javascript
console.log(tinymce.editors);  // Should show editors
```

---

### Monitoring

- Subscribe to PKP Development mailing list
- Watch GitHub: https://github.com/pkp/ojs
- Check PKP Forum: https://forum.pkp.sfu.ca/

---

## Known Limitations

1. **TinyMCE Timing:** If TinyMCE initializes slowly, normalization may run before editor loads. Workaround: Blur event will catch it when user leaves field.

2. **Complex HTML:** Very complex nested HTML may produce unexpected results. Mitigation: Uses browser's native text extraction.

3. **Character Encoding:** Works with UTF-8 (OJS standard). Non-standard encodings may need adjustment.

4. **Performance:** MutationObserver watches entire document. Minimal impact but could be optimized for extremely large forms.

## Future Enhancements (Design-Ready, Not Implemented)

### Configuration Panel
- Let journal managers toggle features on/off
- Configure which fields to normalize
- Set normalization rules per field

### Batch Processing
- Admin tool to normalize existing submissions
- SQL queries to clean historical data
- Progress tracking and rollback

### Advanced Normalization
- Keyword suggestions from controlled vocabulary
- Auto-correct common metadata mistakes
- Smart sentence case conversion
- Bibliography formatting cleanup

### Analytics
- Track normalization events
- Report on metadata quality improvements
- Alert editors to problematic submissions


## Support

**Report Issues:**
- GitHub: https://github.com/mohammed3200/metadataNormalizer.git
- PKP Forum: https://forum.pkp.sfu.ca/

**Documentation:**
- OJS Docs: https://docs.pkp.sfu.ca/
- Plugin Dev Guide: https://docs.pkp.sfu.ca/dev/plugin-guide/



## Acknowledgments

- **PKP Team** for OJS architecture and plugin system
- **Community** for feature requests and testing
- **Contributors** for code improvements

---

**Made with ❤️ for the academic publishing community**