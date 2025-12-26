# Vanilla JavaScript Dynamic Data Table

This project is a **deliberate demonstration of first-principles JavaScript knowledge**, built using **only raw browser technologies**.

There are **no frameworks, no libraries, no build tools, and no abstractions**.

If you can open `index.html` in a browser, the project works.

---

## 🚫 What This Project Does NOT Use

To be completely explicit:

- ❌ React
- ❌ Vue
- ❌ Angular
- ❌ jQuery
- ❌ Any framework or UI library
- ❌ npm / yarn / pnpm
- ❌ Bundlers (Vite, Webpack, Rollup, etc.)
- ❌ Transpilers
- ❌ ES module imports / exports
- ❌ CDN scripts
- ❌ Utility libraries
- ❌ Test frameworks

**Only these files exist:**


This is intentional.

---

## 🎯 Project Goal

The goal of this project is to prove **deep understanding of JavaScript and the browser**, without relying on abstractions provided by frameworks.

This reassures reviewers that the developer:
- Understands the DOM
- Knows how state actually works
- Can manage events manually
- Can write maintainable logic without helpers
- Is not “React-only”

---

## 🧩 Features

### Dynamic Data Table
- Column sorting (ascending / descending)
- Text-based filtering
- Search across rows
- Client-side pagination
- Column visibility toggles

All functionality is implemented **manually** using native DOM APIs.

---

## 🛠 Technical Implementation

### JavaScript
- Single `script.js` file
- Plain functions and objects
- Manual state management
- Explicit DOM creation and updates
- Event listeners wired by hand
- No globals beyond the script itself

### DOM Interaction
- `document.querySelector`
- `document.createElement`
- `addEventListener`
- Controlled re-rendering to avoid unnecessary DOM work

### CSS
- No frameworks
- Layout and styling written from scratch
- Focus styles and accessibility considered

---

## ♿ Accessibility

Accessibility is handled **without libraries**:

- Semantic HTML elements
- Keyboard navigation
- Focus management
- Clear visual focus indicators
- ARIA attributes where appropriate

---

## 🧪 Testing (Without Frameworks)

This project includes a **minimal custom test utility** inside `script.js`.

- Simple assertions
- Console-based pass/fail output
- Core logic tested (sorting, filtering, pagination)

This demonstrates understanding of **what testing actually is**, not just how to use a test runner.

---

## 🧠 Why One JavaScript File?

Modern tooling encourages splitting code into many files, but that often hides whether someone truly understands JavaScript fundamentals.

This project intentionally uses **one JavaScript file** to show:
- Clear logical organization without file boundaries
- Discipline in naming and structure
- Ability to reason about state and behavior holistically

In real production environments, modules are valuable — but fundamentals come first.

---

## 🚀 How to Run

1. Clone or download the repository
2. Open `index.html` in any modern browser
3. No setup required

---

## 👀 What Reviewers Should Look For

- Clear, readable JavaScript
- No unnecessary abstractions
- Intentional DOM updates
- Thoughtful handling of edge cases
- Clean separation via functions (not files)

---

## 🧾 Summary

This project exists to answer one question clearly:

> **“Can this developer write JavaScript without a framework?”**

The answer is **yes**.
