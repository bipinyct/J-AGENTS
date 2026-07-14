// ==UserScript==
// @name         J-Agents Application Autofill — Bipin Singh
// @namespace    https://github.com/bipinyct/J-AGENTS
// @version      2026-07-14T19-21
// @description  Fills common application-form fields (name, email, phone, links, experience, CTC) from Bipin Singh's profile. It never submits — you review and click Apply/Submit yourself.
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/bipinyct/J-AGENTS/main/autofill/apply-autofill.user.js
// @downloadURL  https://raw.githubusercontent.com/bipinyct/J-AGENTS/main/autofill/apply-autofill.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const FIELDS = {
  "firstName": "Bipin",
  "lastName": "Singh",
  "fullName": "Bipin Singh",
  "email": "bipinkainbox@gmail.com",
  "phone": "+91 7991702806",
  "linkedin": "https://linkedin.com/in/bipinyct",
  "github": "https://github.com/bipinyct",
  "city": "Gurugram",
  "currentCompany": "Infinite Locus",
  "currentTitle": "SDET-1",
  "yearsOfExperience": "1.5",
  "currentCtc": "9",
  "expectedCtc": "13",
  "noticePeriod": "",
  "degree": "B.Tech Electronics Engineering",
  "institute": "Harcourt Butler Technical University, Kanpur",
  "graduationYear": "2025"
};

  const RULES = [
    [/first.?name/i, FIELDS.firstName],
    [/last.?name|surname/i, FIELDS.lastName],
    [/full.?name|^name$|your.?name|applicant.?name|candidate.?name/i, FIELDS.fullName],
    [/e-?mail/i, FIELDS.email],
    [/phone|mobile|contact.?number/i, FIELDS.phone],
    [/linkedin/i, FIELDS.linkedin],
    [/github/i, FIELDS.github],
    [/portfolio|personal.?website/i, FIELDS.github],
    [/current.?city|^city$|location/i, FIELDS.city],
    [/current.?(company|employer)/i, FIELDS.currentCompany],
    [/current.?(title|role|designation)/i, FIELDS.currentTitle],
    [/years?.?of.?experience|total.?experience|experience.?\(years\)/i, FIELDS.yearsOfExperience],
    [/current.?(ctc|salary)/i, FIELDS.currentCtc],
    [/expected.?(ctc|salary)/i, FIELDS.expectedCtc],
    [/notice.?period/i, FIELDS.noticePeriod],
    [/^degree$|qualification/i, FIELDS.degree],
    [/college|university|institute/i, FIELDS.institute],
    [/graduation.?year|passing.?year/i, FIELDS.graduationYear],
  ];

  function labelFor(el) {
    const parts = [
      el.getAttribute("aria-label"),
      el.getAttribute("placeholder"),
      el.getAttribute("name"),
      el.id,
    ];
    if (el.id) {
      const lbl = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (lbl) parts.push(lbl.textContent);
    }
    const wrappingLabel = el.closest("label");
    if (wrappingLabel) parts.push(wrappingLabel.textContent);
    return parts.filter(Boolean).join(" ");
  }

  function setNativeValue(el, value) {
    const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fillField(el) {
    if (el.value) return false;
    const text = labelFor(el);
    for (const [pattern, value] of RULES) {
      if (value && pattern.test(text)) {
        setNativeValue(el, value);
        return true;
      }
    }
    return false;
  }

  function runFill() {
    const candidates = document.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"], input:not([type]), textarea',
    );
    let filled = 0;
    candidates.forEach((el) => {
      if (fillField(el)) filled += 1;
    });
    console.log("[J-Agents Autofill] filled " + filled + " field(s). Review everything before submitting.");
    return filled;
  }

  function addButton() {
    const btn = document.createElement("button");
    btn.textContent = "⚡ Autofill (J-Agents)";
    btn.type = "button";
    btn.style.cssText =
      "position:fixed;bottom:16px;right:16px;z-index:999999;padding:10px 14px;" +
      "background:#0066cc;color:#fff;border:none;border-radius:6px;font-size:13px;" +
      "font-family:sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3);";
    btn.addEventListener("click", runFill);
    document.body.appendChild(btn);
  }

  if (document.readyState === "complete") addButton();
  else window.addEventListener("load", addButton);
})();
