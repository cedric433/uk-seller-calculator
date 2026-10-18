(function () {
  var F = ["price","ship","cost","shipCost","other","cat","target"], C = ["vat","ads","boost"], KEY = "ukspc.v1";
  var DEF = {price:30, ship:3, cost:8, shipCost:3, other:0.5, cat:11.9, target:5, vat:true, ads:false, boost:false};
  var PRE = {low:{price:6,ship:2.5,cost:1.5,shipCost:2.5,other:0.3}, free:{price:25,ship:0,cost:10,shipCost:6,other:0.5}, high:{price:250,ship:10,cost:150,shipCost:10,other:1}, vatreg:{vat:false}};
  var $ = function (i) { return document.getElementById(i); };
  var gbp = function (n) { return (n < 0 ? "-" : "") + "£" + Math.abs(n).toFixed(2); };
  function apply(s) { F.forEach(function (f) { if (s[f] !== undefined) $(f).value = s[f]; }); C.forEach(function (c) { if (s[c] !== undefined) $(c).checked = !!s[c]; }); }
  function save() { try { var s = {}; F.forEach(function (f) { s[f] = $(f).value; }); C.forEach(function (c) { s[c] = $(c).checked; }); localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function load() { var s = DEF; try { var r = localStorage.getItem(KEY); if (r) s = Object.assign({}, DEF, JSON.parse(r)); } catch (e) {} apply(s); }
  function read() {
    var o = {}, w = [];
    F.forEach(function (f) { var raw = parseFloat($(f).value); if (raw < 0 && w.indexOf("Negative values are treated as £0.") < 0) w.push("Negative values are treated as £0."); o[f] = clean(raw, f === "cat" ? 100 : 100000); });
    C.forEach(function (c) { o[c] = $(c).checked; });
    if (o.price === 0) w.push("Enter an item price above £0 to see results.");
    if (o.cat > 30) w.push("A category fee above 30% looks unusual. Check eBay’s fee page.");
    return {o: o, w: w};
  }
  function render() {
    var r = read(), o = r.o;
    $("warn").textContent = r.w.join(" ");
    if (o.price === 0) { $("table").innerHTML = ""; $("cards").innerHTML = ""; $("summary").textContent = ""; return; }
    var res = CONFIG.platforms.map(function (p) { var f = fees(p.k, o.price, o); return {p: p, f: f, profit: f.base - f.total - o.cost - o.shipCost - o.other, need: need(p.k, o)}; });
    var best = Math.max.apply(null, res.map(function (x) { return x.profit; })), worst = Math.min.apply(null, res.map(function (x) { return x.profit; }));
    var top = res.filter(function (x) { return x.profit === best; }).map(function (x) { return x.p.name; });
    $("summary").textContent = "Highest profit: " + top.join(" and ") + " (" + gbp(best) + "). The gap to the lowest option is " + gbp(best - worst) + ". This compares profit only, not demand or account eligibility.";
    var sorted = res.slice().sort(function (a, b) { return b.profit - a.profit; });
    $("table").innerHTML = "<thead><tr><th>Platform</th><th>Fees</th><th>Profit</th><th>Margin</th><th>Price for " + gbp(o.target) + " profit</th></tr></thead><tbody>" +
      sorted.map(function (x) { return "<tr" + (x.profit === best ? ' class="best"' : "") + "><td>" + x.p.name + "</td><td>" + gbp(x.f.total) + "</td><td>" + gbp(x.profit) + "</td><td>" + (x.f.base ? (x.profit / x.f.base * 100).toFixed(1) : "0.0") + "%</td><td>" + (x.need === null ? "n/a" : gbp(x.need)) + "</td></tr>"; }).join("") + "</tbody>";
    $("cards").innerHTML = res.map(function (x) {
      return '<div class="card' + (x.profit === best ? " best" : "") + '"><h3>' + x.p.name + '</h3><div class="badge">' + (x.profit === best ? "HIGHEST PROFIT · " : "") + x.p.tag + '</div>' +
        '<div class="profit ' + (x.profit < 0 ? "neg" : "pos") + '">' + gbp(x.profit) + '</div>' +
        "<ul>" + x.f.L.map(function (l) { return "<li><span>" + l[0] + "</span><span>" + gbp(l[1]) + "</span></li>"; }).join("") + "<li><span><b>Total fees</b></span><span><b>" + gbp(x.f.total) + "</b></span></li></ul></div>";
    }).join("");
  }
  function sources() {
    $("sources").innerHTML = "<p>Rates last updated <b>" + CONFIG.updated + "</b>. Platforms change fees often, so confirm on each site.</p>" + CONFIG.platforms.map(function (p) {
      return "<details><summary>" + p.name + "</summary><p><b>Included:</b> " + p.incl + "</p><p><b>Not included:</b> " + p.excl + "</p><p>Source: " + (p.src ? '<a href="' + p.src + '" rel="noopener">' + p.srcName + "</a>" : p.srcName) + "</p></details>";
    }).join("");
  }
  document.querySelectorAll("input").forEach(function (e) { e.addEventListener("input", function () { save(); render(); }); e.addEventListener("change", function () { save(); render(); }); });
  document.querySelectorAll("[data-preset]").forEach(function (b) { b.addEventListener("click", function () { apply(PRE[b.getAttribute("data-preset")]); save(); render(); }); });
  $("reset").addEventListener("click", function () { apply(DEF); try { localStorage.removeItem(KEY); } catch (e) {} render(); });
  load(); sources(); render();
})();
