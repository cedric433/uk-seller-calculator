(function () {
  var F = ["price","ship","cost","shipCost","other","qty","cat","target"], C = ["vat","ads","boost"], KEY = "ukspc.v1";
  var DEF = {price:30, ship:3, cost:8, shipCost:3, other:0.5, qty:1, cat:11.9, target:5, vat:true, ads:false, boost:false};
  var PRE = {low:{price:6,ship:2.5,cost:1.5,shipCost:2.5,other:0.3}, free:{price:25,ship:0,cost:10,shipCost:6,other:0.5}, high:{price:250,ship:10,cost:150,shipCost:10,other:1}, vatreg:{vat:false}};
  var $ = function (i) { return document.getElementById(i === "cat" ? "ebay-fee-input" : i); };
  var saveNameField = function () { return $("save-calc-name") || $("note"); };
  var saveButton = function () { return $("save-calc-btn") || $("saveCalc"); };
  var gbp = function (n) { return (n < 0 ? "-" : "") + "£" + Math.abs(n).toFixed(2); };
  function syncCategory() {
    var select = $("ebay-category");
    if (!select) return;
    var rate = $("cat").value;
    select.value = Array.prototype.some.call(select.options, function (option) { return option.value === rate; }) ? rate : "";
  }
  function apply(s) { F.forEach(function (f) { if (s[f] !== undefined) $(f).value = s[f]; }); C.forEach(function (c) { if (s[c] !== undefined) $(c).checked = !!s[c]; }); syncCategory(); }
  function save() { try { var s = {}; F.forEach(function (f) { s[f] = $(f).value; }); C.forEach(function (c) { s[c] = $(c).checked; }); localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ } }
  function load() { var s = DEF; try { var r = localStorage.getItem(KEY); if (r) s = Object.assign({}, DEF, JSON.parse(r)); } catch { /* storage unavailable */ } apply(s); }
  function read() {
    var o = {}, w = [], negative = [];
    F.forEach(function (f) {
      var raw = parseFloat($(f).value);
      if (f === "qty") {
        var validQty = Number.isInteger(raw) && raw >= 1;
        if (!validQty) w.push("Quantity must be a whole number of 1 or more.");
        o[f] = Number.isFinite(raw) ? Math.max(1, Math.min(Math.floor(raw), 100000)) : 1;
        $(f).setAttribute("aria-invalid", validQty ? "false" : "true");
      } else {
        if (raw < 0) negative.push(($(f).labels && $(f).labels[0]) ? $(f).labels[0].textContent : f);
        o[f] = clean(raw, f === "cat" ? 100 : 100000);
        $(f).setAttribute("aria-invalid", raw < 0 ? "true" : "false");
      }
    });
    C.forEach(function (c) { o[c] = $(c).checked; });
    if (o.price === 0) w.push("Enter an item price above £0 to see results.");
    if (negative.length) w.push("Use £0 or more for " + negative.join(", ") + ". Negative values are treated as £0.");
    if (o.cat > 30) w.push("The eBay business fee is above 30%. Check your category rate against eBay’s fee page.");
    return {o: o, w: w};
  }
  function node(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function metric(label, value) {
    var wrap = node("div"), dt = node("dt", "", label), dd = node("dd", "", value);
    wrap.appendChild(dt); wrap.appendChild(dd);
    return wrap;
  }
  function renderPlatform(x, best, targetProfit) {
    var card = node("article", "platform-result" + (x.profit === best ? " best" : ""));
    var head = node("div", "result-head");
    var identity = node("div", "platform-identity");
    var icon = node("img", "platform-icon");
    icon.src = x.p.k + ".svg";
    icon.alt = "";
    icon.width = 24;
    icon.height = 24;
    var title = node("h3", "", x.p.name);
    var tag = node("span", "platform-tag", x.p.tag);
    var profitWrap = node("div", "profit-wrap");
    var profitLabel = node("span", "profit-label", "Estimated profit");
    var profitValue = node("p", "profit" + (x.profit < 0 ? " neg" : " pos"), gbp(x.profit));

    identity.appendChild(icon);
    identity.appendChild(title);
    identity.appendChild(tag);
    if (x.profit === best) identity.appendChild(node("span", "best-badge", "Highest profit"));
    head.appendChild(identity);
    profitWrap.appendChild(profitLabel);
    profitWrap.appendChild(profitValue);
    head.appendChild(profitWrap);
    card.appendChild(head);

    if (x.p.caveat) card.appendChild(node("p", "caveat", x.p.caveat));

    var stats = node("dl", "result-stats");
    stats.appendChild(metric("Seller fees", gbp(x.f.total)));
    stats.appendChild(metric("Margin", (x.f.base ? (x.profit / x.f.base * 100).toFixed(1) : "0.0") + "%"));
    stats.appendChild(metric("Price for " + gbp(targetProfit) + " profit", x.need === null ? "Not reached" : gbp(x.need)));
    card.appendChild(stats);

    var details = node("details", "fee-details");
    var summary = node("summary", "", "Fee breakdown and assumptions");
    var list = node("ul", "fee-list");
    x.f.L.forEach(function (line) {
      var row = node("li"), name = node("span", "", line[0]), amount = node("b", "", gbp(line[1]));
      row.appendChild(name); row.appendChild(amount); list.appendChild(row);
    });
    var total = node("li", "fee-total"), totalLabel = node("b", "", "Total seller fees"), totalValue = node("b", "", gbp(x.f.total));
    total.appendChild(totalLabel); total.appendChild(totalValue); list.appendChild(total);
    details.appendChild(summary);
    details.appendChild(list);
    details.appendChild(node("p", "assumption", "Included: " + x.p.incl));
    details.appendChild(node("p", "assumption", "Not included: " + x.p.excl));
    if (x.p.src) {
      var source = node("a", "source-link", "View " + x.p.srcName);
      source.href = x.p.src;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      details.appendChild(source);
    }
    card.appendChild(details);

    var profitDetails = node("details", "profit-details");
    var profitSummary = node("summary", "", "Profit breakdown");
    var breakdown = node("ul", "profit-breakdown");
    [
      ["Total Revenue", gbp(x.revenue)],
      ["Platform Fee", gbp(-x.f.total)],
      ["Total Item Cost", gbp(-x.itemCost)],
      ["Shipping & Packaging", gbp(-(x.shippingCost + x.packagingCost))],
      ["Net Profit", gbp(x.profit)]
    ].forEach(function (line, index) {
      var row = node("li", index === 4 ? "net-profit" : "");
      row.appendChild(node("span", "", line[0]));
      row.appendChild(node("b", "", line[1]));
      breakdown.appendChild(row);
    });
    profitDetails.appendChild(profitSummary);
    profitDetails.appendChild(breakdown);
    card.appendChild(profitDetails);
    return card;
  }
  var shimmerPlayed = false;
  var shimmerObserver = "IntersectionObserver" in window ? new window.IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || shimmerPlayed) return;
      entry.target.classList.add("shimmer-active");
      shimmerPlayed = true;
      shimmerObserver.unobserve(entry.target);
    });
  }, {threshold: 0.25}) : null;
  function render() {
    var r = read(), o = r.o;
    $("warn").textContent = r.w.join(" ");
    var output = $("platformCards"), summary = $("summary");
    if (shimmerObserver) shimmerObserver.disconnect();
    output.textContent = "";
    summary.textContent = "";
    if (o.price === 0) {
      summary.appendChild(node("h2", "", "Add your sale price to compare platforms"));
      summary.appendChild(node("p", "", "Enter an item price above £0 to see estimated profit, fees, margin, and target price."));
      return;
    }
    var res = CONFIG.platforms.map(function (p) {
      var f = fees(p.k, o.price, o), itemCost = o.cost * o.qty;
      return {p: p, f: f, revenue: f.base, itemCost: itemCost, shippingCost: o.shipCost, packagingCost: o.other,
        profit: f.base - f.total - itemCost - o.shipCost - o.other, need: need(p.k, o)};
    });
    var best = Math.max.apply(null, res.map(function (x) { return x.profit; })), worst = Math.min.apply(null, res.map(function (x) { return x.profit; }));
    var top = res.filter(function (x) { return x.profit === best; }).map(function (x) { return x.p.name; });
    var sorted = res.slice().sort(function (a, b) { return b.profit - a.profit; });
    var resultTitle = node("h2", "", "Highest estimated profit");
    var resultValue = node("p", "summary-value", top.join(" and ") + " · " + gbp(best));
    var resultNote = node("p", "summary-note", "The gap to the lowest estimate is " + gbp(best - worst) + ". Profit only; check each platform’s fee and eligibility notes before deciding.");
    summary.appendChild(resultTitle);
    summary.appendChild(resultValue);
    summary.appendChild(resultNote);
    sorted.forEach(function (x) { output.appendChild(renderPlatform(x, best, o.target)); });
    var bestCard = output.querySelector(".platform-result.best");
    if (bestCard && !shimmerPlayed) {
      if (shimmerObserver) shimmerObserver.observe(bestCard);
      else {
        bestCard.classList.add("shimmer-active");
        shimmerPlayed = true;
      }
    }
  }
  function sources(updatedDate, failed) {
    var updateMessage = updatedDate
      ? "Rates last updated <b>" + updatedDate + "</b>. Platforms change fees often, so confirm on each site."
      : failed
        ? "The rate update date could not be verified. Platforms change fees often, so confirm current rates on each site."
        : "Checking when rates were last updated…";
    $("sources").innerHTML = "<p>" + updateMessage + "</p>" + CONFIG.platforms.map(function (p) {
      return "<details><summary>" + p.name + "</summary><p><b>Included:</b> " + p.incl + "</p><p><b>Not included:</b> " + p.excl + "</p><p>Source: " + (p.src ? '<a href="' + p.src + '" target="_blank" rel="noopener noreferrer">' + p.srcName + "</a>" : p.srcName) + "</p></details>";
    }).join("");
  }
  function updateRateDate() {
    var updated = $("upd");
    var statusDot = updated.querySelector(".status-dot");
    window.fetch("fees.js?rate-date", {method: "HEAD", cache: "no-store"}).then(function (response) {
      if (!response.ok) throw new Error("Rate source returned HTTP " + response.status);
      var lastModified = response.headers.get("Last-Modified");
      var date = lastModified && new Date(lastModified);
      if (!date || !Number.isFinite(date.getTime())) throw new Error("Rate source has no valid Last-Modified date");
      var formatted = date.toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"});
      updated.replaceChildren(statusDot, document.createTextNode("Rates updated " + formatted));
      sources(formatted);
    }).catch(function (error) {
      window.console.warn("Unable to verify when rates were last updated.", error);
      updated.replaceChildren(statusDot, document.createTextNode("Rate update date unavailable"));
      sources(null, true);
    });
  }
  var HKEY = "ukspc.history.v1", HMAX = 20;
  function hload() { try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch { return []; } }
  function hsave(a) { try { localStorage.setItem(HKEY, JSON.stringify(a)); } catch { /* storage unavailable */ } }
  function mk(t, fn) { var b = document.createElement("button"); b.type = "button"; b.textContent = t; b.addEventListener("click", fn); return b; }
  function addHistory() {
    var o = read().o;
    if (o.price === 0) { $("warn").textContent = "Enter an item price above £0 before saving."; return; }
    var inp = {}; F.forEach(function (f) { inp[f] = $(f).value; }); C.forEach(function (c) { inp[c] = $(c).checked; });
    var best = null;
    CONFIG.platforms.forEach(function (p) { var v = profit(p.k, o.price, o); if (!best || v > best.v) best = {n: p.name, v: v}; });
    var nameField = saveNameField();
    var a = hload(); a.unshift({t: Date.now(), note: (nameField ? nameField.value : "").slice(0, 40), inp: inp, best: best.n, profit: best.v});
    hsave(a.slice(0, HMAX));
    if (nameField) nameField.value = "";
    renderHistory();
    $("resultStatus").textContent = "Calculation saved on this device.";
  }
  function renderHistory() {
    var a = hload(), box = $("history"); box.textContent = ""; $("clearHist").hidden = !a.length;
    if (!a.length) { var p = document.createElement("p"); p.textContent = "No saved calculations yet."; box.appendChild(p); return; }
    a.forEach(function (e, i) {
      var row = document.createElement("div"), txt = document.createElement("div");
      row.className = "hrow";
      var d = new Date(e.t).toLocaleString("en-GB", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"});
      txt.textContent = (e.note ? e.note + " · " : "") + (e.inp.qty || 1) + " × " + gbp(clean(e.inp.price)) + " item · " +
        gbp(clean(e.inp.ship)) + " postage charged · " + gbp(clean(e.inp.cost)) + " item cost · " +
        gbp(clean(e.inp.shipCost)) + " postage cost · eBay fee " + clean(e.inp.cat) + "% · VAT " +
        (e.inp.vat ? "on" : "off") + " · Etsy ads " + (e.inp.ads ? "on" : "off") +
        " · Depop boost " + (e.inp.boost ? "on" : "off") + " → " + e.best + " " + gbp(e.profit) + " (" + d + ")";
      row.appendChild(txt);
      var label = (e.note || gbp(clean(e.inp.price)) + " item");
      var load = mk("Load", function () { apply(Object.assign({qty: 1}, e.inp)); save(); render(); $("resultStatus").textContent = label + " loaded."; });
      load.setAttribute("aria-label", "Load " + label);
      row.appendChild(load);
      var remove = mk("Delete", function () { var h = hload(); h.splice(i, 1); hsave(h); renderHistory(); $("resultStatus").textContent = label + " removed from saved calculations."; });
      remove.setAttribute("aria-label", "Delete " + label);
      row.appendChild(remove);
      box.appendChild(row);
    });
  }
  var historySaveButton = saveButton(), historyNameField = saveNameField();
  if (historySaveButton) historySaveButton.addEventListener("click", addHistory);
  if (historyNameField) historyNameField.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && historySaveButton) {
      event.preventDefault();
      historySaveButton.click();
    }
  });
  $("clearHist").addEventListener("click", function () {
    if (confirm("Delete all saved calculations?")) {
      hsave([]); renderHistory(); $("resultStatus").textContent = "All saved calculations deleted from this device.";
    }
  });
  document.querySelectorAll(".inputs input").forEach(function (e) {
    e.addEventListener("input", function () { if (e.id === "ebay-fee-input") syncCategory(); clearPresetState(); save(); render(); });
    e.addEventListener("change", function () { clearPresetState(); save(); render(); $("resultStatus").textContent = "Platform comparison updated."; });
    if (e.type === "number") {
      e.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          e.blur();
        }
      });
    }
  });
  var ebayCategory = $("ebay-category");
  if (ebayCategory) {
    ebayCategory.addEventListener("change", function () {
      if (this.value !== "") $("cat").value = this.value;
      save(); render(); $("resultStatus").textContent = "eBay category fee updated.";
    });
  }
  function clearPresetState() {
    document.querySelectorAll("[data-preset]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
  }
  if ("IntersectionObserver" in window && $("mobileJump") && $("results")) {
    var mobileJump = $("mobileJump");
    var resultsObserver = new window.IntersectionObserver(function (entries) {
      var editing = entries[0].isIntersecting;
      mobileJump.href = editing ? "#price" : "#platformResults";
      mobileJump.textContent = editing ? "Edit sale details ↑" : "Compare platforms ↓";
      mobileJump.setAttribute("aria-label", editing ? "Edit sale details" : "Compare platform results");
    }, {threshold: 0});
    resultsObserver.observe($("results"));
  }
  document.querySelectorAll("[data-preset]").forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      var preset = b.getAttribute("data-preset");
      apply(PRE[preset]); save(); render(); clearPresetState(); b.setAttribute("aria-pressed", "true");
      var descriptions = {
        low: "Low-value example applied. Sale price, postage and costs changed; your fee options were kept.",
        free: "Free-postage example applied. Sale price, postage and costs changed; your fee options were kept.",
        high: "High-value example applied. Sale price, postage and costs changed; your fee options were kept.",
        vatreg: "VAT-registered example applied. VAT on seller fees was turned off; other values were kept."
      };
      $("resultStatus").textContent = descriptions[preset];
    });
  });
  $("reset").addEventListener("click", function () {
    apply(DEF); clearPresetState();
    try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    render(); $("resultStatus").textContent = "Calculator reset to the example values.";
  });
  load(); sources(); render(); renderHistory(); updateRateDate();
})();
