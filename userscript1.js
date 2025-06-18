// ==UserScript==
// @name         Upwork → Google Sheet Parser
// @author       bulbulkae
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Parses Upwork job to Google Sheet
// @match        https://www.upwork.com/jobs/*
// @grant        GM.xmlHttpRequest
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @connect      *
// ==/UserScript==

(function () {
  'use strict';

  const BASE_URL =
        'https://script.google.com/macros/s/AKfycbxsDvDNZs0xkPiuz7T7PJCPN48m3wMq_dcMt4khYyEe-qLIwbKtcrgqDA8iZ_gR6jZB/exec';
  const jobLink = location.href;
  let btn;

  function waitForSelector(selector, timeout = 10000) {
      return new Promise((resolve, reject) => {
          const start = Date.now();
          const timer = setInterval(() => {
              const el = document.querySelector(selector);
              if (el) {
                  clearInterval(timer);
                  resolve(el);
              } else if (Date.now() - start > timeout) {
                  clearInterval(timer);
                  reject(new Error(`Timeout waiting for selector: ${selector}`));
              }
          }, 300);
      });
  }

  function createButton(text, color, onClick) {
      if (btn) btn.remove();

      btn = document.createElement('button');
      btn.textContent = text;
      btn.disabled = true;
      Object.assign(btn.style, {
          position: 'fixed',
          top: '70px',
          right: '20px',
          padding: '10px 16px',
          backgroundColor: color,
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
          zIndex: 999999,
          opacity: '0.6',
      });

      btn.addEventListener('click', () => {
          btn.disabled = true;
          btn.textContent = '⏳ Processing…';
          btn.style.opacity = '0.6';
          onClick();
      });

      document.body.appendChild(btn);
  }

  function extractData() {
      const titleEl = document.querySelector('h4.d-flex span.flex-1');
      const title = titleEl ? titleEl.textContent.trim() : '';

      return {
          title,
          link: jobLink,
          aboutJob: extractFeatures(),
          activity: extractClientActivityDataAsText(),
          qualifications: extractQualificationDataAsString(),
          client: extractAboutClient(),
      };
  }

  function extractFeatures() {
      const featureList = document.querySelector('ul.features.list-unstyled');
      if (!featureList) return '';

      const features = [];

      featureList.querySelectorAll('li').forEach((li) => {
          const value = li.querySelector('strong')?.innerText.trim() || '';
          const label =
                li.querySelector('.description span')?.innerText.trim() ||
                li.querySelector('.description')?.innerText.trim() ||
                '';

          if (label || value) {
              features.push(`- ${label}${value ? `: ${value}` : ''}`);
          }
      });

      return features.join('\n');
  }

  function extractAboutClient() {
      const aboutClient = document.querySelector('[data-test="AboutClientUser"]');
      if (!aboutClient) return '';

      const lines = [];

      aboutClient.querySelectorAll('strong.text-light-on-muted').forEach((el) => {
          lines.push(`- ${el.innerText.trim()}`);
      });

      const ratingText = aboutClient.querySelector('[data-testid="buyer-rating"] .air3-rating-value-text');
      const ratingDetail = aboutClient.querySelector('[data-testid="buyer-rating"] span.nowrap');
      if (ratingText) {
          lines.push(`- Rating: ${ratingText.innerText.trim()} (${ratingDetail?.innerText.trim() || ''})`);
      }

      const featuresList = aboutClient.querySelector('ul.features');
      if (featuresList) {
          featuresList.querySelectorAll('li').forEach((li) => {
              const label = li.querySelector('strong')?.innerText.trim() || '';
              const detail = li.querySelector('div')?.innerText.trim() || '';
              const extra = li.querySelector('small')?.innerText.trim() || '';
              const content = [label, detail || extra].filter(Boolean).join(': ');
              if (content) lines.push(`- ${content}`);
          });
      }

      return lines.join('\n');
  }

  function extractClientActivityDataAsText() {
      let data = '';
      const items = document.querySelectorAll('.client-activity-items .ca-item');

      items.forEach((item) => {
          const titleElem = item.querySelector('.title');
          const valueElem = item.querySelector('.value');

          if (titleElem && valueElem) {
              const key = titleElem.textContent.trim().replace(/:$/, '');
              const value = valueElem.textContent.trim();
              data += `-${key}: ${value}\n`;
          }
      });

      return data;
  }

  function extractQualificationDataAsString() {
      let result = '';
      const items = document.querySelectorAll('.qualification-items li');

      items.forEach((item) => {
          const labelElem = item.querySelector('strong');
          const valueElem = item.querySelector('span:not(.icons)');

          if (labelElem && valueElem) {
              const key = labelElem.textContent.trim().replace(/:$/, '');
              const value = valueElem.textContent.trim();
              result += `-${key}: ${value}\n`;
          }
      });

      return result.trim();
  }

  function sendPost(payload, wasExisting) {
      GM.xmlHttpRequest({
          method: 'POST',
          url: BASE_URL,
          data: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          onload(res) {
              if (res.status >= 200 && res.status < 300) {
                  alert('✅ Saved to Google Sheet!');
                  btn.textContent = '🔄 Update Info';
                  btn.style.backgroundColor = '#1E90FF';
                  btn.disabled = false;
                  btn.style.opacity = '1';
                  btn.onclick = () => {
                      btn.disabled = true;
                      btn.textContent = '⏳ Processing…';
                      btn.style.opacity = '0.6';
                      sendPost(extractData(), true);
                  };
              } else {
                  alert(`❌ Server error ${res.status}: ${res.responseText}`);
                  btn.disabled = false;
                  btn.textContent = wasExisting ? '🔄 Update Info' : '✅ Save to Sheet';
                  btn.style.opacity = '1';
              }
          },

          onerror(err) {
              console.error('❌ Network error', err);
              alert('❌ Network error');
              btn.disabled = false;
              btn.textContent = wasExisting ? '🔄 Update Info' : '✅ Save to Sheet';
              btn.style.opacity = '1';
          },
      });
  }

  function checkExists(cb) {
      GM.xmlHttpRequest({
          method: 'GET',
          url: `${BASE_URL}?link=${encodeURIComponent(jobLink)}`,
          onload(res) {
              let exists = false;
              if (res.status >= 200 && res.status < 300) {
                  try {
                      exists = JSON.parse(res.responseText).exists;
                  } catch (e) {}
              }
              cb(exists);
          },
          onerror() {
              cb(false);
          },
      });
  }

  // === START FLOW ===

  // 1. Create a disabled button
  createButton('⏳ Loading...', '#6c757d', () => {});
  btn.disabled = true;
  btn.style.opacity = '0.6';

  // 2. Wait for main element to exist, then proceed
  waitForSelector('h4.d-flex span.flex-1')
      .then(() => {
      checkExists((exists) => {
          const label = exists ? '🔄 Update Info' : '✅ Save to Sheet';
          const color = exists ? '#1E90FF' : '#28a745';

          btn.textContent = label;
          btn.style.backgroundColor = color;
          btn.disabled = false;
          btn.style.opacity = '1';

          btn.onclick = () => {
              btn.disabled = true;
              btn.textContent = '⏳ Processing…';
              btn.style.opacity = '0.6';
              sendPost(extractData(), exists);
          };
      });
  })
      .catch((err) => {
      console.error(err);
      btn.textContent = '❌ Load Failed';
      btn.disabled = true;
      btn.style.opacity = '0.6';
  });
})();
