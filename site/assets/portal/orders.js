/* MW Acoustics order dashboard — https://mwacoustic.com/orders
 * Built against SUPPLIER-ORDER-DASHBOARD-CONTRACT.md (2026-09-16).
 * Source: portal/orders.js; build.py copies it verbatim to site/assets/portal/orders.js.
 *
 * Every piece of server data is inserted with textContent / DOM nodes (the h() helper), never innerHTML.
 */
(function () {
  'use strict';

  // A meta CSP cannot set frame-ancestors (GitHub Pages sends no headers), so refuse to run framed:
  // an approve button inside someone else's frame is a clickjacking target.
  if (window.top !== window.self) {
    document.body.textContent = 'This page cannot be shown inside another site.';
    return;
  }

  var SUPABASE_URL = 'https://krmpfqluefhkiahphyiw.supabase.co';
  // Publishable key: designed to be public in a browser. All authorization happens server-side
  // (verify_jwt + an active supplier_portal_users row).
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_R78YXzpvEKDwvpou4rbjIA_5SKKBBiV';
  var FUNCTION_URL = SUPABASE_URL + '/functions/v1/supplier-portal';
  var PAGE_SIZE = 50;
  var CARRIERS = ['UPS', 'FedEx', 'USPS', 'DHL', 'Other'];
  var MIN_PASSWORD = 15;

  // ---------------------------------------------------------------------------------------------
  // LOCAL MOCK MODE (verification only).
  // Enabled only when BOTH: the page is served from localhost / 127.0.0.1 over plain http, AND the
  // URL carries ?mock=1. On mwacoustic.com the hostname can never be localhost, so no URL, hash,
  // storage value or link can switch a real visitor into a fake backend (which could otherwise be
  // used to show Beverly fabricated orders or fake "approved" confirmations).
  // ---------------------------------------------------------------------------------------------
  var MOCK = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') &&
    location.protocol === 'http:' &&
    new URLSearchParams(location.search).get('mock') === '1';

  // ---------- tiny DOM helpers ----------
  function $(id) { return document.getElementById(id); }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function show(el, text) { el.textContent = text; el.hidden = false; }
  function hide(el) { el.textContent = ''; el.hidden = true; }

  // ---------- formatting ----------
  var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  function fmtMoney(cents) { return (cents === null || cents === undefined) ? '—' : money.format(cents / 100); }
  function fmtDate(iso, withYear) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    var sameYear = d.getFullYear() === new Date().getFullYear();
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: (withYear || !sameYear) ? 'numeric' : undefined,
      hour: 'numeric', minute: '2-digit'
    });
  }
  var STATUS = {
    cancellation_requested: ['Cancellation requested', 'pill-action'],
    ready_for_purchase_order: ['Ready for PO', 'pill-open'],
    purchase_order_sent: ['PO sent', 'pill-open'],
    supplier_confirmed: ['Confirmed', 'pill-open'],
    shipped: ['Shipped', 'pill-shipped'],
    delivered: ['Delivered', 'pill-shipped'],
    cancelled: ['Cancelled', 'pill-cancelled'],
    payment_pending: ['Payment pending', 'pill-other'],
    payment_failed: ['Payment failed', 'pill-other']
  };
  var OPEN_STATUSES = ['ready_for_purchase_order', 'purchase_order_sent', 'supplier_confirmed'];
  function pill(status) {
    var s = STATUS[status] || [String(status || 'Unknown').replace(/_/g, ' '), 'pill-other'];
    return h('span', { class: 'pill ' + s[1] }, s[0]);
  }
  var RESOLUTION = {
    approved: 'Approved — cancelled and refunded',
    declined_shipped: 'Declined — already shipped',
    declined_other: 'Declined',
    auto_approved_not_sent: 'Cancelled automatically (PO had not reached Parts Express)'
  };
  function humanize(s) { s = String(s || '').replace(/_/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); }
  function trackingUrl(carrier, number) {
    var n = encodeURIComponent(number || '');
    switch (carrier) {
      case 'UPS': return 'https://www.ups.com/track?tracknum=' + n;
      case 'FedEx': return 'https://www.fedex.com/fedextrack/?trknbr=' + n;
      case 'USPS': return 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' + n;
      case 'DHL': return 'https://www.dhl.com/us-en/home/tracking.html?tracking-id=' + n;
      default: return null;
    }
  }

  // ---------- errors ----------
  function ApiError(status, code, detail) { this.status = status; this.code = code; this.detail = detail; }
  var NETWORK_MSG = "Couldn't reach the server. Check your connection and try again.";

  // ---------- backend: real ----------
  function realBackend() {
    if (!window.supabase || !window.supabase.createClient) return null;
    var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: window.sessionStorage,   // signed out when the browser closes (contract)
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false          // we never use links; also keeps #po=… untouched
      }
    });
    async function call(action, body) {
      var s = await client.auth.getSession();
      var session = s && s.data && s.data.session;
      if (!session) throw new ApiError(401, 'not_signed_in', 'Your session ended. Sign in again.');
      var res;
      try {
        res = await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token,
            'apikey': SUPABASE_PUBLISHABLE_KEY
          },
          body: JSON.stringify(Object.assign({ action: action }, body || {}))
        });
      } catch (e) { throw new ApiError(0, 'network', NETWORK_MSG); }
      var json = null;
      try { json = await res.json(); } catch (e) { json = null; }
      if (!res.ok) {
        var detail = json && typeof json.detail === 'string' && json.detail ? json.detail : null;
        if (res.status === 401) detail = 'Your session ended. Sign in again.';
        throw new ApiError(res.status, (json && json.error) || 'http_' + res.status,
          detail || 'Something went wrong (' + res.status + '). Try again in a moment.');
      }
      if (!json) throw new ApiError(res.status, 'bad_response', 'The server sent an unreadable response. Try again.');
      return json;
    }
    return { auth: client.auth, api: call };
  }

  // ---------- backend: mock (see MOCK comment above) ----------
  function mockBackend() {
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 350); }); };
    var SKEY = 'mw-mock-session';
    var listeners = [];
    function session() { try { return JSON.parse(sessionStorage.getItem(SKEY)); } catch (e) { return null; } }
    function setSession(email) {
      var s = email ? { access_token: 'mock', user: { email: email } } : null;
      if (s) sessionStorage.setItem(SKEY, JSON.stringify(s)); else sessionStorage.removeItem(SKEY);
      listeners.forEach(function (fn) { fn(s ? 'SIGNED_IN' : 'SIGNED_OUT', s); });
      return s;
    }
    var pendingCodeEmail = null;
    var auth = {
      getSession: async function () { return { data: { session: session() }, error: null }; },
      onAuthStateChange: function (fn) { listeners.push(fn); return { data: { subscription: { unsubscribe: function () {} } } }; },
      signInWithPassword: async function (p) {
        await wait();
        if (p.password !== 'mock-password-123') return { data: {}, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
        return { data: { session: setSession(p.email) }, error: null };
      },
      signInWithOtp: async function (p) {
        await wait();
        if (!p.options || p.options.shouldCreateUser !== false) throw new Error('mock: shouldCreateUser must be false');
        pendingCodeEmail = p.email;
        return { data: {}, error: null };
      },
      verifyOtp: async function (p) {
        await wait();
        if (p.type !== 'email' || p.token !== '12345678' || p.email !== pendingCodeEmail) return { data: {}, error: { status: 403, code: 'otp_expired', message: 'Token has expired or is invalid' } };
        return { data: { session: setSession(p.email) }, error: null };
      },
      updateUser: async function (p) {
        await wait();
        if (!p.password || p.password.length < MIN_PASSWORD) return { data: {}, error: { status: 422, code: 'weak_password', message: 'Password is too weak' } };
        return { data: {}, error: null };
      },
      signOut: async function () { setSession(null); return { error: null }; }
    };

    // fixture ------------------------------------------------------------
    var now = Date.now(), HOUR = 3600e3;
    var ago = function (hours) { return new Date(now - hours * HOUR).toISOString(); };
    var CATALOG = [
      ['295-514', 'Dayton Audio RS180-8 7" Reference Woofer 8 Ohm', 6798, 5100],
      ['275-070', 'Dayton Audio ND25FA-4 1" Soft Dome Neodymium Tweeter', 2198, 1650],
      ['260-1640', 'Dayton Audio DMPC-4.7 4.7uF 250V Polypropylene Capacitor', 498, 374],
      ['266-236', 'Jantzen 1.0mH 18 AWG Air Core Inductor', 1698, 1274],
      ['268-526', 'Sonic Barrier 1" Acoustic Foam 18" x 24"', 1998, 1499],
      ['091-1120', 'Parts Express Binding Post Pair Gold', 898, 674],
      ['295-563', 'Dayton Audio RSS265HF-4 10" Reference HF Subwoofer', 16998, 12749]
    ];
    var PEOPLE = [
      ['Ada Brennan', 'Dayton', 'OH', '(937) 555-0142'], ['Marcus Hale', 'Austin', 'TX', '(512) 555-0199'],
      ['Priya Natarajan', 'Portland', 'OR', '(503) 555-0110'], ['Tomás Ortega', 'Tucson', 'AZ', '(520) 555-0133'],
      ['Grace Whitfield', 'Burlington', 'VT', '(802) 555-0157'], ['Jonah Feld', 'Madison', 'WI', '(608) 555-0121'],
      ['Leilani Kahale', 'Honolulu', 'HI', '(808) 555-0176'], ['Samuel Okafor', 'Raleigh', 'NC', '(919) 555-0188']
    ];
    var orders = [];
    function makeOrder(n, hoursAgo, status, personIdx, lineSpec, extra) {
      var p = PEOPLE[personIdx % PEOPLE.length];
      var lines = lineSpec.map(function (ls) {
        var c = CATALOG[ls[0]];
        return { supplierItemId: c[0], title: c[1], qty: ls[1], listUnitCents: c[2], dealerUnitCents: c[3], backordered: !!ls[2] };
      });
      var placedAt = ago(hoursAgo);
      var o = {
        fulfillmentOrderId: 'mock-' + n, poNumber: 'MW-PO-' + String(n).padStart(6, '0'), poRevision: 0,
        placedAt: placedAt, status: status, customerName: p[0], shipCity: p[1], shipState: p[2],
        shipTo: { name: p[0], line1: (100 + n) + ' Maple Street', line2: n % 3 === 0 ? 'Apt 2B' : null, city: p[1], state: p[2], postalCode: String(10000 + n * 7).slice(0, 5), country: 'US', phone: p[3] },
        shippingMethod: n % 2 ? 'UPS Ground' : 'FedEx Home Delivery',
        lines: lines, cancellation: null, cancellationRequestedAt: null, shippedAt: null, carrier: null, trackingNumber: null,
        documents: [], events: []
      };
      if (status !== 'ready_for_purchase_order') {
        o.documents.push({ kind: 'new', revision: 0, status: 'sent', sentAt: ago(hoursAgo - 0.02), subject: 'MW Acoustics purchase order ' + o.poNumber });
      }
      o.events.push({ at: placedAt, actorKind: 'system', actorEmail: null, action: 'order_recorded', detail: {} });
      if (o.documents.length) o.events.push({ at: o.documents[0].sentAt, actorKind: 'system', actorEmail: null, action: 'purchase_order_sent', detail: { revision: 0 } });
      Object.assign(o, extra || {});
      orders.push(o);
      return o;
    }
    // hand-made: every state
    var o;
    o = makeOrder(1234, 5, 'cancellation_requested', 0, [[0, 2], [1, 2], [2, 4, true]]);
    o.cancellationRequestedAt = ago(1.5);
    o.cancellation = { requestedAt: o.cancellationRequestedAt, reason: 'Ordered the wrong woofer size.', resolution: null, resolvedAt: null, note: null };
    o.events.push({ at: o.cancellationRequestedAt, actorKind: 'customer', actorEmail: null, action: 'cancellation_requested', detail: { reason: o.cancellation.reason } });
    o = makeOrder(1229, 30, 'cancellation_requested', 1, [[6, 1]]);
    o.failRefund = true; // approve returns refund_failed so the error path can be exercised
    o.cancellationRequestedAt = ago(26);
    o.cancellation = { requestedAt: o.cancellationRequestedAt, reason: null, resolution: null, resolvedAt: null, note: null };
    o.events.push({ at: o.cancellationRequestedAt, actorKind: 'customer', actorEmail: null, action: 'cancellation_requested', detail: {} });
    makeOrder(1233, 8, 'purchase_order_sent', 2, [[3, 2], [2, 6]]);
    makeOrder(1232, 20, 'supplier_confirmed', 3, [[0, 4], [5, 2]]);
    makeOrder(1235, 0.3, 'ready_for_purchase_order', 4, [[1, 1]]);
    makeOrder(1231, 44, 'purchase_order_sent', 5, [[4, 3], [1, 2, true]]);
    o = makeOrder(1230, 70, 'shipped', 6, [[0, 2], [1, 2]]);
    Object.assign(o, { shippedAt: ago(40), carrier: 'UPS', trackingNumber: '1Z999AA10123456784' });
    o.events.push({ at: o.shippedAt, actorKind: 'supplier', actorEmail: 'beverly@parts-express.com', action: 'marked_shipped', detail: { carrier: 'UPS', trackingNumber: o.trackingNumber } });
    o = makeOrder(1228, 120, 'cancelled', 7, [[3, 1]]);
    o.cancellationRequestedAt = ago(110);
    o.cancellation = { requestedAt: ago(110), reason: 'Found a local supplier.', resolution: 'approved', resolvedAt: ago(100), note: null };
    o.documents.push({ kind: 'cancelled', revision: 1, status: 'sent', sentAt: ago(100), subject: 'CANCEL purchase order MW-PO-001228' });
    o.events.push({ at: ago(110), actorKind: 'customer', actorEmail: null, action: 'cancellation_requested', detail: {} });
    o.events.push({ at: ago(100), actorKind: 'supplier', actorEmail: 'beverly@parts-express.com', action: 'cancellation_approved', detail: { refundCents: 1698 } });
    o = makeOrder(1227, 150, 'cancelled', 0, [[5, 1]]);
    o.documents = [];
    o.events = o.events.slice(0, 1);
    o.cancellation = { requestedAt: ago(149.9), reason: null, resolution: 'auto_approved_not_sent', resolvedAt: ago(149.9), note: null };
    o.events.push({ at: ago(149.9), actorKind: 'system', actorEmail: null, action: 'cancellation_auto_approved', detail: { reason: 'not_sent' } });
    o = makeOrder(1226, 200, 'delivered', 1, [[6, 2], [3, 2]]);
    Object.assign(o, { shippedAt: ago(170), carrier: 'FedEx', trackingNumber: '794612345678' });
    // older history, enough to need "Load more" on the All and Shipped tabs
    for (var i = 0; i < 58; i++) {
      var n = 1225 - i;
      o = makeOrder(n, 220 + i * 26, i % 9 === 4 ? 'cancelled' : 'shipped', i + 2, [[i % 7, 1 + (i % 3)], [(i + 3) % 7, 1]]);
      if (o.status === 'shipped') Object.assign(o, { shippedAt: ago(200 + i * 26), carrier: CARRIERS[i % 4], trackingNumber: 'TRK' + (100000 + i) });
      else o.cancellation = { requestedAt: ago(215 + i * 26), reason: null, resolution: 'approved', resolvedAt: ago(214 + i * 26), note: null };
    }

    function group(s) {
      if (s === 'cancellation_requested') return 'needs_action';
      if (OPEN_STATUSES.indexOf(s) >= 0) return 'open';
      if (s === 'shipped' || s === 'delivered') return 'shipped';
      if (s === 'cancelled') return 'cancelled';
      return 'other';
    }
    function summary(o) {
      var s = {};
      ['fulfillmentOrderId', 'poNumber', 'poRevision', 'placedAt', 'status', 'customerName', 'shipCity', 'shipState',
        'cancellationRequestedAt', 'shippedAt', 'carrier', 'trackingNumber'].forEach(function (k) { s[k] = o[k]; });
      s.itemCount = o.lines.length;
      s.unitCount = o.lines.reduce(function (a, l) { return a + l.qty; }, 0);
      s.itemsSummary = o.lines.map(function (l) { return l.qty + '× ' + l.title; }).join(', ');
      s.listTotalCents = o.lines.reduce(function (a, l) { return a + l.qty * l.listUnitCents; }, 0);
      s.dealerTotalCents = o.lines.reduce(function (a, l) { return a + l.qty * l.dealerUnitCents; }, 0);
      s.backordered = o.lines.some(function (l) { return l.backordered; });
      return s;
    }
    function detail(o) {
      var d = summary(o);
      ['shipTo', 'shippingMethod', 'lines', 'cancellation', 'documents', 'events'].forEach(function (k) { d[k] = JSON.parse(JSON.stringify(o[k])); });
      return d;
    }
    function fail(status, code, det) { throw new ApiError(status, code, det); }
    function find(id) {
      var o = orders.filter(function (x) { return x.fulfillmentOrderId === id; })[0];
      if (!o) fail(404, 'not_found', "That order wasn't found.");
      return o;
    }
    function actor() { var s = session(); return s ? s.user.email : null; }
    function event(o, action, det) { o.events.push({ at: new Date().toISOString(), actorKind: 'supplier', actorEmail: actor(), action: action, detail: det || {} }); }

    async function api(action, body) {
      await wait();
      var s = session();
      if (!s) fail(401, 'not_signed_in', 'Your session ended. Sign in again.');
      if (/^noaccess@/i.test(s.user.email)) fail(403, 'not_authorized', 'This account does not have dashboard access.');
      body = body || {};
      switch (action) {
        case 'whoami': return { email: s.user.email, displayName: 'Mock supplier', role: 'supplier' };
        case 'list': {
          var q = String(body.search || '').trim().toLowerCase();
          var pool = orders.filter(function (o) {
            if (!q) return true;
            return o.poNumber.toLowerCase().indexOf(q) >= 0 || o.customerName.toLowerCase().indexOf(q) >= 0 ||
              o.shipCity.toLowerCase().indexOf(q) >= 0 || o.lines.some(function (l) { return l.supplierItemId.toLowerCase().indexOf(q) >= 0; });
          });
          var counts = { needs_action: 0, open: 0, shipped: 0, cancelled: 0, all: pool.length };
          pool.forEach(function (o) { var g = group(o.status); if (counts[g] !== undefined) counts[g]++; });
          var filter = body.filter || (counts.needs_action > 0 ? 'needs_action' : 'open');
          var hits = pool.filter(function (o) { return filter === 'all' || group(o.status) === filter; })
            .sort(function (a, b) { return a.placedAt < b.placedAt ? 1 : -1; });
          var limit = Math.min(body.limit || 50, 100), offset = body.offset || 0;
          return { orders: hits.slice(offset, offset + limit).map(summary), total: hits.length, counts: counts };
        }
        case 'get': return { order: detail(find(body.fulfillmentOrderId)) };
        case 'approve_cancellation': {
          o = find(body.fulfillmentOrderId);
          if (o.status !== 'cancellation_requested') fail(409, 'invalid_state', 'This order no longer has a pending cancellation request.');
          if (o.failRefund) fail(502, 'refund_failed', "The refund couldn't be completed, so the order was not cancelled. MW Acoustics has been alerted — try again later.");
          var refund = summary(o).listTotalCents;
          o.status = 'cancelled';
          Object.assign(o.cancellation, { resolution: 'approved', resolvedAt: new Date().toISOString() });
          o.documents.push({ kind: 'cancelled', revision: o.poRevision + 1, status: 'sent', sentAt: new Date().toISOString(), subject: 'CANCEL purchase order ' + o.poNumber });
          event(o, 'cancellation_approved', { refundCents: refund });
          return { ok: true, order: detail(o), refundCents: refund };
        }
        case 'decline_cancellation': {
          o = find(body.fulfillmentOrderId);
          if (o.status !== 'cancellation_requested') fail(409, 'invalid_state', 'This order no longer has a pending cancellation request.');
          if (body.reason === 'already_shipped') {
            if (CARRIERS.indexOf(body.carrier) < 0 || !String(body.trackingNumber || '').trim()) fail(400, 'invalid_input', 'Choose a carrier and enter the tracking number.');
            Object.assign(o, { status: 'shipped', shippedAt: new Date().toISOString(), carrier: body.carrier, trackingNumber: body.trackingNumber.trim() });
            Object.assign(o.cancellation, { resolution: 'declined_shipped', resolvedAt: o.shippedAt });
            event(o, 'cancellation_declined_shipped', { carrier: o.carrier, trackingNumber: o.trackingNumber });
          } else if (body.reason === 'other') {
            if (!String(body.note || '').trim()) fail(400, 'invalid_input', 'Add a note explaining why.');
            o.status = 'purchase_order_sent';
            Object.assign(o.cancellation, { resolution: 'declined_other', resolvedAt: new Date().toISOString(), note: body.note.trim() });
            event(o, 'cancellation_declined_other', { note: o.cancellation.note });
          } else fail(400, 'invalid_input', 'Unknown decline reason.');
          return { ok: true, order: detail(o) };
        }
        case 'mark_shipped': {
          o = find(body.fulfillmentOrderId);
          if (['purchase_order_sent', 'supplier_confirmed', 'cancellation_requested'].indexOf(o.status) < 0) fail(409, 'invalid_state', "This order can't be marked shipped in its current state.");
          if (CARRIERS.indexOf(body.carrier) < 0 || !String(body.trackingNumber || '').trim()) fail(400, 'invalid_input', 'Choose a carrier and enter the tracking number.');
          if (o.status === 'cancellation_requested') Object.assign(o.cancellation, { resolution: 'declined_shipped', resolvedAt: new Date().toISOString() });
          Object.assign(o, { status: 'shipped', shippedAt: new Date().toISOString(), carrier: body.carrier, trackingNumber: body.trackingNumber.trim() });
          event(o, 'marked_shipped', { carrier: o.carrier, trackingNumber: o.trackingNumber });
          return { ok: true, order: detail(o) };
        }
        default: fail(400, 'invalid_input', 'Unknown action.');
      }
    }
    return { auth: auth, api: api };
  }

  // =============================================================================================
  // App
  // =============================================================================================
  var backend = MOCK ? mockBackend() : realBackend();
  var state = {
    me: null, filter: null, search: '', orders: [], total: 0, counts: null,
    selectedId: null, detail: null, listSeq: 0, detailSeq: 0, busy: false, codeEmail: '',
    lastRowFocus: null, openForm: null
  };

  var VIEWS = ['view-boot', 'view-signin', 'view-code-request', 'view-code-verify', 'view-set-password', 'view-app'];
  function showView(id) {
    VIEWS.forEach(function (v) { $(v).hidden = v !== id; });
    $('account').hidden = id !== 'view-app';
    var first = $(id).querySelector('h1, input');
    if (id !== 'view-app' && first) {
      var input = $(id).querySelector('input:not([hidden])');
      if (input && !input.value) input.focus(); else $('main').focus();
    }
  }
  function setBusy(btn, busy, label) {
    if (busy) { btn.dataset.label = btn.textContent; btn.textContent = label || 'Working…'; btn.disabled = true; }
    else { if (btn.dataset.label) btn.textContent = btn.dataset.label; btn.disabled = false; }
  }
  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
  function isRateLimit(err) { return err && (err.status === 429 || /rate limit|too many/i.test(err.message || '')); }
  function isNetwork(err) { return err && (err.status === 0 || err.name === 'AuthRetryableFetchError' || /fetch|network/i.test(err.message || '')); }

  // ---------- sign-in ----------
  function goSignIn(message, info) {
    hide($('signin-error')); hide($('signin-info'));
    if (message) show($('signin-error'), message);
    if (info) show($('signin-info'), info);
    $('signin-password').value = '';
    showView('view-signin');
  }

  $('signin-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = $('signin-email').value.trim(), password = $('signin-password').value;
    hide($('signin-error')); hide($('signin-info'));
    if (!validEmail(email) || !password) { show($('signin-error'), 'Enter your email address and password.'); return; }
    var btn = $('signin-submit');
    setBusy(btn, true, 'Signing in…');
    try {
      var r = await backend.auth.signInWithPassword({ email: email, password: password });
      if (r.error) {
        if (isRateLimit(r.error)) show($('signin-error'), 'Too many attempts. Wait a few minutes, then try again.');
        else if (isNetwork(r.error)) show($('signin-error'), NETWORK_MSG);
        // Same message whether the address exists or not.
        else show($('signin-error'), "That email and password didn't match. Try again, or email yourself a sign-in code.");
        return;
      }
      $('signin-password').value = '';
      await afterSignIn(false);
    } catch (err) {
      show($('signin-error'), NETWORK_MSG);
    } finally { setBusy(btn, false); }
  });

  $('to-code').addEventListener('click', function () {
    $('code-email').value = $('signin-email').value.trim();
    hide($('code-request-error'));
    showView('view-code-request');
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-back-to-signin]'), function (b) {
    b.addEventListener('click', function () { goSignIn(); });
  });

  async function requestCode(email) {
    // Never a magic link: signInWithOtp + shouldCreateUser:false sends the project's email OTP template (8-digit code).
    var r = await backend.auth.signInWithOtp({ email: email, options: { shouldCreateUser: false } });
    if (r.error && isRateLimit(r.error)) return 'rate';
    if (r.error && isNetwork(r.error)) return 'network';
    // Any other error (including "signups not allowed" for an unknown address) is deliberately treated as
    // success, so this screen never reveals whether an address has an account.
    return 'ok';
  }

  $('code-request-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = $('code-email').value.trim();
    hide($('code-request-error'));
    if (!validEmail(email)) { show($('code-request-error'), 'Enter a valid email address.'); return; }
    var btn = $('code-request-submit');
    setBusy(btn, true, 'Sending…');
    try {
      var result = await requestCode(email);
      if (result === 'rate') { show($('code-request-error'), 'A code was requested very recently. Wait a minute, then try again — or use the code already sent.'); return; }
      if (result === 'network') { show($('code-request-error'), NETWORK_MSG); return; }
      state.codeEmail = email;
      $('code-verify-lead').textContent = 'If ' + email + ' has dashboard access, an email with an 8-digit code is on its way. It can take a minute to arrive — check spam if you don’t see it.';
      hide($('code-verify-error')); hide($('code-verify-info'));
      $('code-token').value = '';
      showView('view-code-verify');
      $('code-token').focus();
    } catch (err) { show($('code-request-error'), NETWORK_MSG); }
    finally { setBusy(btn, false); }
  });

  $('code-token').addEventListener('input', function () {
    var digits = this.value.replace(/\D/g, '').slice(0, 8);
    if (digits !== this.value) this.value = digits;
  });

  $('code-verify-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var token = $('code-token').value.replace(/\D/g, '');
    hide($('code-verify-error')); hide($('code-verify-info'));
    if (token.length !== 8) { show($('code-verify-error'), 'Enter all 8 digits of the code.'); $('code-token').setAttribute('aria-invalid', 'true'); return; }
    $('code-token').removeAttribute('aria-invalid');
    var btn = $('code-verify-submit');
    setBusy(btn, true, 'Checking…');
    try {
      var r = await backend.auth.verifyOtp({ email: state.codeEmail, token: token, type: 'email' });
      if (r.error) {
        if (isRateLimit(r.error)) show($('code-verify-error'), 'Too many attempts. Wait a few minutes, then request a new code.');
        else if (isNetwork(r.error)) show($('code-verify-error'), NETWORK_MSG);
        else show($('code-verify-error'), "That code didn't work. It may have expired or been replaced by a newer one — request a new code and try again.");
        return;
      }
      await afterSignIn(true);
    } catch (err) { show($('code-verify-error'), NETWORK_MSG); }
    finally { setBusy(btn, false); }
  });

  var resendAt = 0;
  $('code-resend').addEventListener('click', async function () {
    hide($('code-verify-error')); hide($('code-verify-info'));
    var waitS = Math.ceil((resendAt - Date.now()) / 1000);
    if (waitS > 0) { show($('code-verify-info'), 'You can request another code in ' + waitS + ' seconds.'); return; }
    var btn = this;
    btn.disabled = true;
    try {
      var result = await requestCode(state.codeEmail);
      if (result === 'rate') show($('code-verify-error'), 'A code was requested very recently. Wait a minute, then try again.');
      else if (result === 'network') show($('code-verify-error'), NETWORK_MSG);
      else { resendAt = Date.now() + 60e3; show($('code-verify-info'), 'If the address has dashboard access, a new code is on its way. Only the newest code works.'); }
    } catch (err) { show($('code-verify-error'), NETWORK_MSG); }
    finally { btn.disabled = false; }
  });

  $('set-password-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var p1 = $('new-password').value, p2 = $('confirm-password').value;
    var err = $('set-password-error');
    hide(err);
    $('new-password').removeAttribute('aria-invalid'); $('confirm-password').removeAttribute('aria-invalid');
    if (p1.length < MIN_PASSWORD) { show(err, 'Use at least ' + MIN_PASSWORD + ' characters.'); $('new-password').setAttribute('aria-invalid', 'true'); $('new-password').focus(); return; }
    if (p1 !== p2) { show(err, "The two passwords don't match."); $('confirm-password').setAttribute('aria-invalid', 'true'); $('confirm-password').focus(); return; }
    var btn = $('set-password-submit');
    setBusy(btn, true, 'Saving…');
    try {
      var r = await backend.auth.updateUser({ password: p1 });
      if (r.error) {
        var code = r.error.code || '';
        if (code === 'same_password') show(err, "That's already your password. Choose a different one, or continue with it by signing in again.");
        else if (code === 'weak_password' || r.error.status === 422) show(err, 'That password is too easy to guess. Choose a longer or less common one.');
        else if (code === 'reauthentication_needed' || r.error.status === 401) { await signOut('Your sign-in expired before the password was saved. Request a new code to try again.'); }
        else if (isNetwork(r.error)) show(err, NETWORK_MSG);
        else show(err, "The password couldn't be saved. Try again.");
        return;
      }
      $('new-password').value = ''; $('confirm-password').value = '';
      await enterApp();
    } catch (x) { show(err, NETWORK_MSG); }
    finally { setBusy(btn, false); }
  });

  async function afterSignIn(fromCode) {
    try {
      state.me = await backend.api('whoami');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) { await signOut("This account doesn't have dashboard access."); return; }
      if (err instanceof ApiError && err.status === 401) { await signOut('Your session ended. Sign in again.'); return; }
      await backend.auth.signOut();
      goSignIn(err instanceof ApiError ? err.detail : NETWORK_MSG);
      return;
    }
    if (fromCode) {
      $('set-password-username').value = state.me.email || state.codeEmail;
      hide($('set-password-error'));
      showView('view-set-password');
      $('new-password').focus();
      return;
    }
    await enterApp();
  }

  async function signOut(message) {
    try { await backend.auth.signOut(); } catch (e) { /* local session is cleared regardless */ }
    try { sessionStorage.clear(); } catch (e) {}
    state.me = null; state.orders = []; state.detail = null; state.selectedId = null; state.filter = null;
    clear($('rows')); closeDetail(true);
    goSignIn(message);
  }
  $('sign-out').addEventListener('click', function () { signOut(null).then(function () { show($('signin-info'), 'You are signed out.'); }); });

  function handleAuthError(err) {
    if (err instanceof ApiError && err.status === 401) { signOut('Your session ended. Sign in again.'); return true; }
    if (err instanceof ApiError && err.status === 403 && err.code === 'not_authorized') { signOut("This account doesn't have dashboard access."); return true; }
    return false;
  }

  // ---------- inbox ----------
  async function enterApp() {
    $('who-email').textContent = state.me.email + (state.me.role === 'admin' ? ' (admin)' : '');
    $('who-email').title = state.me.displayName || state.me.email;
    showView('view-app');
    var po = poFromHash();
    await loadList({ initial: true });
    if (po) await openPo(po);
    else $('main').focus();
  }

  var FILTER_EMPTY = {
    needs_action: 'Nothing needs your action.', open: 'No open orders.', shipped: 'No shipped orders yet.',
    cancelled: 'No cancelled orders.', all: 'No orders yet.'
  };

  async function fetchList(filter, offset) {
    var body = { filter: filter, limit: PAGE_SIZE, offset: offset || 0 };
    if (state.search) body.search = state.search;
    return backend.api('list', body);
  }

  async function loadList(opts) {
    opts = opts || {};
    var seq = ++state.listSeq;
    var status = $('list-status');
    $('rows').setAttribute('aria-busy', 'true');
    if (!opts.quiet) status.textContent = 'Loading…';
    try {
      var filter = state.filter, res;
      if (opts.initial || !filter) {
        // Contract default: Needs action when anything needs action, else Open. Asked explicitly (the list
        // response does not echo which filter the server defaulted to).
        res = await fetchList('needs_action', 0);
        filter = 'needs_action';
        if (seq !== state.listSeq) return;
        if (!res.counts || !res.counts.needs_action) { res = await fetchList('open', 0); filter = 'open'; }
      } else {
        res = await fetchList(filter, 0);
      }
      if (seq !== state.listSeq) return;
      state.filter = filter;
      state.orders = res.orders || [];
      state.total = res.total || 0;
      state.counts = res.counts || null;
      renderFilters(); renderRows();
    } catch (err) {
      if (seq !== state.listSeq) return;
      if (handleAuthError(err)) return;
      clear($('rows'));
      $('rows').appendChild(h('li', { class: 'empty' },
        h('p', null, err instanceof ApiError ? err.detail : NETWORK_MSG),
        h('button', { type: 'button', class: 'btn btn-secondary', onclick: function () { loadList(opts); } }, 'Try again')));
      status.textContent = '';
      $('load-more').hidden = true;
    } finally {
      if (seq === state.listSeq) $('rows').removeAttribute('aria-busy');
    }
  }

  $('load-more').addEventListener('click', async function () {
    var btn = this, seq = state.listSeq;
    setBusy(btn, true, 'Loading…');
    try {
      var res = await fetchList(state.filter, state.orders.length);
      if (seq !== state.listSeq) return;
      var firstNew = state.orders.length;
      var seen = {};
      state.orders.forEach(function (o) { seen[o.fulfillmentOrderId] = true; });
      state.orders = state.orders.concat((res.orders || []).filter(function (o) { return !seen[o.fulfillmentOrderId]; }));
      state.total = res.total || state.total; state.counts = res.counts || state.counts;
      renderFilters(); renderRows();
      var next = $('rows').children[firstNew];
      if (next && next.querySelector('button')) next.querySelector('button').focus();
    } catch (err) {
      if (!handleAuthError(err)) $('list-status').textContent = err instanceof ApiError ? err.detail : NETWORK_MSG;
    } finally { setBusy(btn, false); }
  });

  function renderFilters() {
    Array.prototype.forEach.call(document.querySelectorAll('.filter'), function (b) {
      var f = b.dataset.filter;
      b.setAttribute('aria-pressed', f === state.filter ? 'true' : 'false');
      var c = state.counts ? state.counts[f] : null;
      var span = b.querySelector('.count');
      span.textContent = (c === null || c === undefined) ? '' : String(c);
      if (f === 'needs_action') b.classList.toggle('has-items', !!c);
    });
  }

  function renderRows() {
    var ul = $('rows');
    clear(ul);
    if (!state.orders.length) {
      ul.appendChild(h('li', { class: 'empty' }, state.search ? 'No orders match “' + state.search + '” in this view.' : FILTER_EMPTY[state.filter] || 'No orders.'));
    }
    state.orders.forEach(function (o) {
      var needs = o.status === 'cancellation_requested';
      var place = [o.shipCity, o.shipState].filter(Boolean).join(', ');
      var items = (o.itemCount ? o.itemCount + (o.itemCount === 1 ? ' item' : ' items') + (o.unitCount && o.unitCount !== o.itemCount ? ' (' + o.unitCount + ' units)' : '') : '');
      var label = o.poNumber + ', ' + (STATUS[o.status] ? STATUS[o.status][0] : o.status) + ', ' + (o.customerName || '') + (place ? ', ' + place : '') + ', placed ' + fmtDate(o.placedAt);
      var btn = h('button', {
        type: 'button', class: 'row' + (needs ? ' needs-action' : ''), 'data-id': o.fulfillmentOrderId,
        'aria-current': o.fulfillmentOrderId === state.selectedId ? 'true' : null, 'aria-label': label,
        onclick: function () { state.lastRowFocus = o.fulfillmentOrderId; openOrder(o.fulfillmentOrderId, o.poNumber); }
      },
        h('span', { class: 'c-status' }, pill(o.status), o.backordered ? h('span', { class: 'bo', title: 'Has backordered items' }, 'Backorder') : null),
        h('span', { class: 'c-po' }, h('span', { class: 'po' }, o.poNumber + (o.poRevision ? ' · Rev ' + o.poRevision : '')), h('span', { class: 'sub' }, fmtDate(o.placedAt))),
        h('span', { class: 'c-cust' }, h('span', { class: 'cust' }, o.customerName || '—'), h('span', { class: 'sub' }, place || '—')),
        h('span', { class: 'c-items' }, h('span', { class: 'items', title: o.itemsSummary || '' }, o.itemsSummary || '—'), h('span', { class: 'sub' }, items)),
        h('span', { class: 'c-money money' }, fmtMoney(o.listTotalCents))
      );
      ul.appendChild(h('li', null, btn));
    });
    var shown = state.orders.length;
    $('list-status').textContent = state.total ? ('Showing ' + shown + ' of ' + state.total + (state.search ? ' matching “' + state.search + '”' : '') + ' · newest first') : '';
    $('load-more').hidden = shown >= state.total;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.filter'), function (b) {
    b.addEventListener('click', function () {
      if (state.filter === b.dataset.filter) return;
      state.filter = b.dataset.filter;
      renderFilters();
      loadList();
    });
  });

  var searchTimer = null;
  $('search').addEventListener('input', function () {
    clearTimeout(searchTimer);
    var v = this.value.trim().slice(0, 100);
    searchTimer = setTimeout(function () {
      if (v === state.search) return;
      state.search = v;
      loadList();
    }, 300);
  });
  $('search').addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && this.value) { this.value = ''; clearTimeout(searchTimer); state.search = ''; loadList(); }
  });
  $('refresh').addEventListener('click', function () { loadList(); if (state.selectedId) refreshDetail(); });

  // ---------- deep link ----------
  function poFromHash() {
    var m = /(?:^|[#&])po=([A-Za-z0-9-]{1,40})/.exec(location.hash);
    return m ? decodeURIComponent(m[1]).toUpperCase() : null;
  }
  async function openPo(po) {
    var hit = state.orders.filter(function (o) { return o.poNumber.toUpperCase() === po; })[0];
    if (!hit) {
      try {
        var res = await backend.api('list', { filter: 'all', search: po, limit: 10, offset: 0 });
        hit = (res.orders || []).filter(function (o) { return o.poNumber.toUpperCase() === po; })[0];
      } catch (err) { if (handleAuthError(err)) return; }
    }
    if (!hit) { $('list-status').textContent = 'Order ' + po + ' was not found.'; return; }
    await openOrder(hit.fulfillmentOrderId, hit.poNumber);
  }
  window.addEventListener('hashchange', function () {
    if (!state.me) return;
    var po = poFromHash();
    if (po && (!state.detail || state.detail.poNumber.toUpperCase() !== po)) openPo(po);
    if (!po && state.selectedId) closeDetail();
  });
  function setHash(po) {
    var url = location.pathname + location.search + (po ? '#po=' + encodeURIComponent(po) : '');
    history.replaceState(null, '', url);
  }

  // ---------- detail ----------
  async function openOrder(id, po) {
    state.selectedId = id;
    state.openForm = null;
    setHash(po);
    markSelected();
    var panel = $('detail'), body = $('detail-body');
    panel.hidden = false;
    $('view-app').classList.add('detail-open');
    clear(body);
    body.appendChild(h('div', { class: 'd-wrap' }, h('p', { class: 'muted', role: 'status' }, 'Loading ' + (po || 'order') + '…')));
    if (window.matchMedia('(max-width:1000px)').matches) window.scrollTo(0, 0);
    panel.focus();
    await refreshDetail();
  }
  async function refreshDetail(notice) {
    var id = state.selectedId, seq = ++state.detailSeq;
    try {
      var res = await backend.api('get', { fulfillmentOrderId: id });
      if (seq !== state.detailSeq || id !== state.selectedId) return;
      state.detail = res.order;
      renderDetail(notice);
    } catch (err) {
      if (seq !== state.detailSeq) return;
      if (handleAuthError(err)) return;
      var body = $('detail-body');
      clear(body);
      body.appendChild(h('div', { class: 'd-wrap' },
        h('div', { class: 'notice notice-error', role: 'alert' }, err instanceof ApiError ? err.detail : NETWORK_MSG),
        h('p', null, h('button', { type: 'button', class: 'btn btn-secondary', onclick: function () { refreshDetail(); } }, 'Try again'))));
    }
  }
  function markSelected() {
    Array.prototype.forEach.call(document.querySelectorAll('.row'), function (r) {
      if (r.dataset.id === state.selectedId) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current');
    });
  }
  function closeDetail(silent) {
    state.selectedId = null; state.detail = null; state.detailSeq++; state.openForm = null;
    $('detail').hidden = true;
    $('view-app').classList.remove('detail-open');
    clear($('detail-body'));
    markSelected();
    if (!silent) {
      setHash(null);
      var row = state.lastRowFocus && document.querySelector('.row[data-id="' + CSS.escape(state.lastRowFocus) + '"]');
      if (row) row.focus(); else $('main').focus();
    }
  }
  $('detail-close').addEventListener('click', function () { closeDetail(); });
  $('detail-back').addEventListener('click', function () { closeDetail(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.selectedId && !$('confirm-dialog').open && !state.busy &&
      !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) closeDetail();
  });

  function kv(pairs) {
    var dl = h('dl', { class: 'kv' });
    pairs.forEach(function (p) { if (p) { dl.appendChild(h('dt', null, p[0])); dl.appendChild(h('dd', null, p[1])); } });
    return dl;
  }
  function section(title, content) { return h('section', { class: 'd-section' }, h('h3', null, title), content); }

  function timeline(o) {
    var sentDoc = (o.documents || []).filter(function (d) { return d.kind === 'new' && (d.status === 'sent' || d.status === 'sending'); })[0];
    var c = o.cancellation;
    var steps = [{ label: 'Placed', when: o.placedAt, cls: 'done' },
      { label: 'PO sent', when: sentDoc ? sentDoc.sentAt : null, cls: sentDoc ? 'done' : '' }];
    if (c && c.requestedAt) steps.push({ label: 'Cancellation requested', when: c.requestedAt, cls: c.resolution ? 'done' : 'alert' });
    if (o.status === 'cancelled') steps.push({ label: 'Cancelled', when: c && c.resolvedAt, cls: 'stop' });
    else if (o.status === 'delivered') steps.push({ label: 'Shipped', when: o.shippedAt, cls: 'done' }, { label: 'Delivered', when: null, cls: 'done' });
    else steps.push({ label: 'Shipped', when: o.shippedAt, cls: o.shippedAt ? 'done' : '' });
    return h('ol', { class: 'timeline', 'aria-label': 'Order progress' }, steps.map(function (s) {
      return h('li', { class: s.cls || null },
        h('span', { class: 't-label' }, s.label),
        h('span', { class: 't-when' }, s.when ? fmtDate(s.when) : (s.cls ? '' : 'Not yet')));
    }));
  }

  function renderDetail(notice) {
    var o = state.detail, body = $('detail-body');
    clear(body);
    var wrap = h('div', { class: 'd-wrap' });
    wrap.appendChild(h('div', { class: 'd-title' }, h('h2', { id: 'detail-title' }, o.poNumber), o.poRevision ? h('span', { class: 'muted' }, 'Rev ' + o.poRevision) : null, pill(o.status)));
    wrap.appendChild(h('p', { class: 'd-meta' }, 'Placed ' + fmtDate(o.placedAt, true)));
    if (notice) wrap.appendChild(h('div', { class: 'notice notice-ok', role: 'status' }, notice));
    var actions = renderActions(o);
    if (actions) wrap.appendChild(actions);

    wrap.appendChild(section('Progress', timeline(o)));

    if (o.cancellation) {
      var c = o.cancellation;
      wrap.appendChild(section('Cancellation request', kv([
        ['Requested', fmtDate(c.requestedAt, true)],
        c.reason ? ['Customer reason', c.reason] : null,
        ['Outcome', c.resolution ? (RESOLUTION[c.resolution] || humanize(c.resolution)) : 'Waiting for your decision'],
        c.resolvedAt ? ['Decided', fmtDate(c.resolvedAt, true)] : null,
        c.note ? ['Note', c.note] : null
      ])));
    }

    if (o.shippedAt || o.trackingNumber) {
      var url = trackingUrl(o.carrier, o.trackingNumber);
      wrap.appendChild(section('Tracking', kv([
        ['Shipped', fmtDate(o.shippedAt, true)],
        ['Carrier', o.carrier || '—'],
        ['Tracking #', url ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, o.trackingNumber) : (o.trackingNumber || '—')]
      ])));
    }

    var st = o.shipTo || {};
    var addr = h('address', { class: 'address' },
      [st.name, st.line1, st.line2, [[st.city, st.state].filter(Boolean).join(', '), st.postalCode].filter(Boolean).join(' '), st.country]
        .filter(Boolean).map(function (line) { return h('span', { class: 'sub-line' }, line, h('br')); }),
      st.phone ? h('a', { href: 'tel:' + String(st.phone).replace(/[^\d+]/g, '') }, st.phone) : h('span', { class: 'muted' }, 'No phone on file'));
    wrap.appendChild(h('div', { class: 'two-col' },
      section('Ship to', addr),
      section('Shipping method', h('p', { class: 'address' }, o.shippingMethod || '—'))));

    var lines = o.lines || [];
    var table = h('table', null,
      h('caption', { class: 'sr-only' }, 'Line items for ' + o.poNumber),
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'PE item #'), h('th', { scope: 'col' }, 'Description'), h('th', { scope: 'col', class: 'num' }, 'Qty'),
        h('th', { scope: 'col', class: 'num' }, 'List'), h('th', { scope: 'col', class: 'num' }, 'Dealer'))),
      h('tbody', null, lines.map(function (l) {
        return h('tr', null,
          h('td', { class: 'item-id' }, l.supplierItemId),
          h('td', null, l.title, l.backordered ? h('span', { class: 'bo' }, 'Backorder') : null),
          h('td', { class: 'num' }, l.qty),
          h('td', { class: 'num' }, fmtMoney(l.listUnitCents)),
          h('td', { class: 'num' }, fmtMoney(l.dealerUnitCents)));
      })),
      h('tfoot', null, h('tr', null, h('td', { colspan: '2' }, 'Total (' + (o.unitCount || 0) + ' units)'), h('td'),
        h('td', { class: 'num' }, fmtMoney(o.listTotalCents)), h('td', { class: 'num' }, fmtMoney(o.dealerTotalCents)))));
    wrap.appendChild(section('Items', h('div', { class: 'table-wrap' }, table)));

    var docs = o.documents || [];
    wrap.appendChild(section('Documents sent', docs.length ? h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Document'), h('th', { scope: 'col' }, 'Rev'), h('th', { scope: 'col' }, 'Status'), h('th', { scope: 'col' }, 'Sent'))),
      h('tbody', null, docs.map(function (d) {
        return h('tr', null, h('td', null, h('span', { class: 'cust' }, docKind(d.kind)), d.subject ? h('span', { class: 'sub' }, d.subject) : null),
          h('td', null, d.revision === null || d.revision === undefined ? '—' : d.revision), h('td', null, humanize(d.status)), h('td', null, fmtDate(d.sentAt)));
      })))) : h('p', { class: 'muted' }, 'No documents have been sent for this order.')));

    var events = (o.events || []).slice().sort(function (a, b) { return a.at < b.at ? -1 : 1; });
    wrap.appendChild(section('History', events.length ? h('ol', { class: 'events' }, events.map(function (ev) {
      return h('li', null, h('time', { datetime: ev.at }, fmtDate(ev.at)),
        h('span', null, h('span', null, humanize(ev.action)), ' ',
          h('span', { class: 'e-actor' }, '· ' + (ev.actorEmail || humanize(ev.actorKind))),
          eventDetail(ev.detail)));
    })) : h('p', { class: 'muted' }, 'No history recorded.')));

    body.appendChild(wrap);
  }
  function docKind(k) { return { new: 'Purchase order', revised: 'Revised purchase order', cancelled: 'Cancellation notice' }[k] || humanize(k); }
  function eventDetail(d) {
    if (!d || typeof d !== 'object') return null;
    var parts = [];
    Object.keys(d).forEach(function (k) {
      var v = d[k];
      if (v === null || v === undefined || v === '' || typeof v === 'object') return;
      if (/cents$/i.test(k) && typeof v === 'number') parts.push(humanize(k.replace(/Cents$/, '').replace(/([A-Z])/g, ' $1').toLowerCase()) + ': ' + fmtMoney(v));
      else parts.push(humanize(k.replace(/([A-Z])/g, ' $1').toLowerCase()) + ': ' + v);
    });
    return parts.length ? h('span', { class: 'e-detail' }, parts.join(' · ')) : null;
  }

  // ---------- actions ----------
  function renderActions(o) {
    if (o.status === 'cancellation_requested') {
      var box = h('div', { class: 'actions urgent', role: 'region', 'aria-label': 'Cancellation decision' },
        h('h3', null, 'Cancellation requested'),
        h('p', null, 'The customer asked to cancel this order' + (o.cancellationRequestedAt ? ' on ' + fmtDate(o.cancellationRequestedAt, true) : '') + '. Nothing is refunded unless you approve. If it has already shipped, decline and add the tracking number.'),
        errorSlot(),
        h('div', { class: 'action-buttons' },
          h('button', { type: 'button', class: 'btn btn-danger', 'data-action': true, onclick: function () { confirmApprove(o); } }, 'Approve cancellation & refund customer'),
          h('button', { type: 'button', class: 'btn btn-secondary', 'data-action': true, 'aria-expanded': state.openForm === 'decline_shipped' ? 'true' : 'false', onclick: function () { toggleForm('decline_shipped'); } }, 'Decline — already shipped'),
          h('button', { type: 'button', class: 'btn btn-secondary', 'data-action': true, 'aria-expanded': state.openForm === 'decline_other' ? 'true' : 'false', onclick: function () { toggleForm('decline_other'); } }, 'Decline — other reason')));
      if (state.openForm === 'decline_shipped') box.appendChild(shipForm(o, 'decline_shipped'));
      if (state.openForm === 'decline_other') box.appendChild(noteForm(o));
      return box;
    }
    if (OPEN_STATUSES.indexOf(o.status) >= 0) {
      var open = h('div', { class: 'actions', role: 'region', 'aria-label': 'Order actions' },
        h('h3', null, 'Open order'),
        h('p', null, 'When this order ships, record the carrier and tracking number. The customer is emailed the tracking details.'),
        errorSlot(),
        h('div', { class: 'action-buttons' },
          h('button', { type: 'button', class: 'btn btn-primary', 'data-action': true, 'aria-expanded': state.openForm === 'mark_shipped' ? 'true' : 'false', onclick: function () { toggleForm('mark_shipped'); } }, 'Mark shipped')));
      if (state.openForm === 'mark_shipped') open.appendChild(shipForm(o, 'mark_shipped'));
      return open;
    }
    return null;
  }
  function errorSlot() { return h('div', { class: 'notice notice-error', role: 'alert', id: 'action-error', hidden: true }); }
  function toggleForm(name) {
    state.openForm = state.openForm === name ? null : name;
    renderDetail();
    var f = document.querySelector('.action-form select, .action-form textarea, .action-form input');
    if (f) f.focus();
    else { var b = document.querySelector('[aria-expanded][data-action]'); if (b) b.focus(); }
  }

  function fieldError(input, msg) {
    var id = input.id + '-error';
    var old = document.getElementById(id);
    if (old) old.remove();
    var hint = input.dataset.hint || '';
    input.removeAttribute('aria-invalid');
    if (hint) input.setAttribute('aria-describedby', hint); else input.removeAttribute('aria-describedby');
    if (!msg) return;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', (hint ? hint + ' ' : '') + id);
    input.insertAdjacentElement('afterend', h('p', { class: 'field-error', id: id }, msg));
  }

  function shipForm(o, kind) {
    var carrier = h('select', { id: 'f-carrier', required: true },
      h('option', { value: '' }, 'Choose…'), CARRIERS.map(function (c) { return h('option', { value: c }, c); }));
    var tracking = h('input', { id: 'f-tracking', type: 'text', required: true, autocomplete: 'off', spellcheck: 'false', maxlength: '64' });
    var submitLabel = kind === 'mark_shipped' ? 'Mark shipped' : 'Decline and record shipment';
    var form = h('form', { class: 'action-form', method: 'post', novalidate: true },
      h('div', { class: 'form-row' },
        h('div', null, h('label', { for: 'f-carrier' }, 'Carrier'), carrier),
        h('div', null, h('label', { for: 'f-tracking' }, 'Tracking number'), tracking)),
      h('div', { class: 'form-buttons' },
        h('button', { type: 'submit', class: 'btn btn-primary', 'data-action': true }, submitLabel),
        h('button', { type: 'button', class: 'btn btn-quiet', 'data-action': true, onclick: function () { toggleForm(kind); } }, 'Cancel')));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var c = carrier.value, t = tracking.value.trim();
      fieldError(carrier, c ? null : 'Choose the carrier.');
      fieldError(tracking, t ? null : 'Enter the tracking number.');
      if (!c) { carrier.focus(); return; }
      if (!t) { tracking.focus(); return; }
      var btn = form.querySelector('button[type=submit]');
      if (kind === 'mark_shipped') {
        run(btn, 'Saving…', 'mark_shipped', { fulfillmentOrderId: o.fulfillmentOrderId, carrier: c, trackingNumber: t },
          function () { return 'Marked shipped via ' + c + '. The customer has been emailed the tracking number.'; });
      } else {
        run(btn, 'Declining…', 'decline_cancellation', { fulfillmentOrderId: o.fulfillmentOrderId, reason: 'already_shipped', carrier: c, trackingNumber: t },
          function () { return 'Cancellation declined. The order is recorded as shipped and the customer has the tracking number.'; });
      }
    });
    return form;
  }

  function noteForm(o) {
    var note = h('textarea', { id: 'f-note', required: true, maxlength: '1000', rows: '3', 'aria-describedby': 'f-note-hint', 'data-hint': 'f-note-hint' });
    var form = h('form', { class: 'action-form', method: 'post', novalidate: true },
      h('label', { for: 'f-note' }, 'Note for the customer'), note,
      h('p', { class: 'hint', id: 'f-note-hint' }, 'The customer receives this note by email. The order continues as normal.'),
      h('div', { class: 'form-buttons' },
        h('button', { type: 'submit', class: 'btn btn-primary', 'data-action': true }, 'Decline request'),
        h('button', { type: 'button', class: 'btn btn-quiet', 'data-action': true, onclick: function () { toggleForm('decline_other'); } }, 'Cancel')));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = note.value.trim();
      fieldError(note, v ? null : 'Add a note explaining why.');
      if (!v) { note.focus(); return; }
      run(form.querySelector('button[type=submit]'), 'Declining…', 'decline_cancellation', { fulfillmentOrderId: o.fulfillmentOrderId, reason: 'other', note: v },
        function () { return 'Cancellation declined. The customer has been emailed your note.'; });
    });
    return form;
  }

  function confirmApprove(o) {
    var dlg = $('confirm-dialog');
    $('confirm-title').textContent = 'Approve cancellation of ' + o.poNumber + '?';
    $('confirm-text').textContent = 'The order will be cancelled and the customer will be refunded automatically. Parts Express receives a cancellation notice. This can’t be undone.';
    $('confirm-ok').textContent = 'Approve & refund customer';
    dlg.returnValue = '';
    var trigger = document.activeElement;
    dlg.addEventListener('close', function onClose() {
      dlg.removeEventListener('close', onClose);
      if (dlg.returnValue === 'ok') {
        var btn = document.querySelector('.actions [data-action].btn-danger');
        run(btn, 'Approving…', 'approve_cancellation', { fulfillmentOrderId: o.fulfillmentOrderId }, function (res) {
          return 'Cancellation approved' + (typeof res.refundCents === 'number' ? '. ' + fmtMoney(res.refundCents) + ' is being refunded to the customer.' : ' and the customer is being refunded.');
        });
      } else if (trigger && trigger.focus) trigger.focus();
    });
    dlg.showModal();
    $('confirm-cancel').focus();   // safe default
  }

  async function run(btn, busyLabel, action, body, successText) {
    if (state.busy) return;
    state.busy = true;
    var id = state.selectedId;
    var buttons = document.querySelectorAll('.actions [data-action], .actions select, .actions input, .actions textarea');
    Array.prototype.forEach.call(buttons, function (b) { b.disabled = true; });
    if (btn) { btn.dataset.label = btn.textContent; btn.textContent = busyLabel; }
    var errBox = $('action-error');
    if (errBox) hide(errBox);
    try {
      var res = await backend.api(action, body);
      if (id !== state.selectedId) return;
      state.openForm = null;
      if (res && res.order) { state.detail = res.order; renderDetail(successText(res)); }
      else await refreshDetail(successText(res || {}));
      var ok = document.querySelector('.notice-ok');
      if (ok) { ok.setAttribute('tabindex', '-1'); ok.focus(); }
      loadList({ quiet: true });
    } catch (err) {
      if (handleAuthError(err)) return;
      Array.prototype.forEach.call(buttons, function (b) { b.disabled = false; });
      if (btn && btn.dataset.label) btn.textContent = btn.dataset.label;
      var msg = err instanceof ApiError ? err.detail : NETWORK_MSG;
      if (err instanceof ApiError && (err.code === 'invalid_state' || err.code === 'conflict' || err.code === 'not_found')) {
        // Someone else changed the order: show the current state along with the server's explanation.
        state.openForm = null;
        await refreshDetail();
        loadList({ quiet: true });
      }
      errBox = $('action-error');
      if (errBox) { show(errBox, msg); errBox.setAttribute('tabindex', '-1'); errBox.focus(); }
    } finally {
      state.busy = false;
    }
  }

  // ---------- boot ----------
  async function boot() {
    if (MOCK) $('mock-banner').hidden = false;
    if (!backend) {
      $('view-boot').textContent = '';
      $('view-boot').appendChild(h('p', { class: 'notice notice-error', role: 'alert' }, "The sign-in service couldn't load. Check your connection, then reload the page."));
      return;
    }
    backend.auth.onAuthStateChange(function (event) {
      if (event === 'SIGNED_OUT' && state.me) { state.me = null; closeDetail(true); goSignIn('You were signed out.'); }
    });
    var s = null;
    try { s = (await backend.auth.getSession()).data.session; } catch (e) { s = null; }
    $('view-boot').removeAttribute('aria-busy');
    if (s) await afterSignIn(false);
    else goSignIn();
  }
  boot();
})();
