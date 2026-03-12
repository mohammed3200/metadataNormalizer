/**
 * test/normalizer.test.js
 * Automated verification of normalization logic
 */

// --- Mocking the environment for Node.js ---

// Mocking window and DOMParser for XSS test simulation
global.DOMParser = class {
    parseFromString(html, type) {
        return {
            body: {
                // In a real browser, this would be safe. 
                // Here we just simulate tag stripping for logic verification.
                textContent: html.replace(/<[^>]+>/g, '')
            }
        };
    }
};

const Shared = {
    stripHtmlTags: function (html) {
        if (!html || typeof html !== "string") return "";
        try {
            const doc = new DOMParser().parseFromString(html, "text/html");
            return doc.body.textContent || "";
        } catch (e) {
            return html.replace(/<[^>]+>/g, '');
        }
    }
};

function normalizeKeywords(input) {
    if (!input || typeof input !== "string") return [];
    let normalized = input.replace(/،/g, ",").replace(/;/g, ",")
        .replace(/\n/g, ",").replace(/\t/g, ",");
    let keywords = normalized.split(",").map(k => k.trim()).filter(k => k.length > 0);
    const seen = new Map(), unique = [];
    keywords.forEach(kw => {
        const lower = kw.toLowerCase();
        if (!seen.has(lower)) { seen.set(lower, true); unique.push(kw); }
    });
    return unique;
}

function normalizeTitle(input) {
    if (!input || typeof input !== "string") return "";
    let n = Shared.stripHtmlTags(input).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
    return n;
}

function normalizeAbstract(input) {
    if (!input || typeof input !== "string") return "";
    let n = input.replace(/<\/p>\s*<p[^>]*>/gi, " ")
        .replace(/<\/?p[^>]*>/gi, " ")
        .replace(/<\/li>\s*<li[^>]*>/gi, " ")
        .replace(/<\/?[uo]l[^>]*>/gi, " ")
        .replace(/<\/?li[^>]*>/gi, " ")
        .replace(/<br\s*\/?>/gi, " ");
    n = Shared.stripHtmlTags(n).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
    return n;
}

// --- Test runner ---
let passed = 0, failed = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (e) {
        console.error(`  ❌ ${name}: ${e.message}`);
        failed++;
    }
}
function assert(actual, expected, msg) {
    const a = JSON.stringify(actual), e = JSON.stringify(expected);
    if (a !== e) throw new Error(`${msg || ''}\n     Got:      ${a}\n     Expected: ${e}`);
}

// --- Keywords tests ---
console.log("\n📋 Keywords Normalization");
test("Arabic comma converted", () =>
    assert(normalizeKeywords("research،analysis"), ["research", "analysis"]));
test("Semicolon separator", () =>
    assert(normalizeKeywords("AI;ML;NLP"), ["AI", "ML", "NLP"]));
test("Duplicate removal case-insensitive", () =>
    assert(normalizeKeywords("AI, machine learning, AI, MACHINE LEARNING"), ["AI", "machine learning"]));
test("Mixed separators", () =>
    assert(normalizeKeywords("a،b;c\nd"), ["a", "b", "c", "d"]));

// --- Title tests ---
console.log("\n📋 Title Normalization");
test("Strips HTML tags", () =>
    assert(normalizeTitle("<strong>Hello</strong> World"), "Hello World"));
test("Removes line breaks", () =>
    assert(normalizeTitle("Hello\nWorld"), "Hello World"));
test("XSS Payload (Simulated stripping)", () => {
    const payload = "<img src=x onerror='alert(1)'>Safe text";
    assert(normalizeTitle(payload), "Safe text");
});

// --- Abstract tests ---
console.log("\n📋 Abstract Normalization");
test("Paragraph tags to space", () =>
    assert(normalizeAbstract("<p>Para 1</p><p>Para 2</p>"), "Para 1 Para 2"));
test("List items to space", () =>
    assert(normalizeAbstract("<ul><li>Item 1</li><li>Item 2</li></ul>"), "Item 1 Item 2"));

// --- Summary ---
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
