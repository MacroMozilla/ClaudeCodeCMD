/* ClaudeCodeCMD — Claude Code 内置命令速查表。
   这个文件里不含任何具体命令内容：文案、分组、顺序、标签全部来自 commands.json。 */

(function () {
  "use strict";

  var DATA = null;
  var STATE = { kind: "all", query: "" };

  // ── 工具 ────────────────────────────────────────────

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* 先转义再做行内标记，内容里的尖括号不会变成标签 */
  function inline(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* 命令名 -> DOM id，斜杠不能直接进 id */
  function slug(cmd) { return "bi-" + cmd.replace(/^\//, ""); }

  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, ta.value.length);
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("execCommand failed"));
    });
  }

  /* 按钮自己变「已复制 ✓」，两秒后恢复。不弹 toast，不跳转。 */
  function handleCopy(btn) {
    if (btn.dataset.busy === "1") return;
    var original = btn.dataset.label;
    btn.dataset.busy = "1";
    writeClipboard(btn.dataset.copy).then(function () {
      btn.textContent = DATA.ui.copied; btn.classList.add("done");
    }).catch(function () {
      btn.textContent = DATA.ui.copyFailed; btn.classList.add("failed");
    }).then(function () {
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("done", "failed");
        btn.dataset.busy = "0";
      }, 2000);
    });
  }

  // ── ① 内置命令主表 ─────────────────────────────────

  /* 类型标签并进命令列，腾出的位置给「配对」—— 配对是这张表最有用的一列 */
  var BI_COLS = [
    { key: "colCommand", cls: "c-bicmd" },
    { key: "colPairs",   cls: "c-bipairs" },
    { key: "colPurpose", cls: "c-bipurpose" },
    { key: "colCopy",    cls: "c-bicopy" }
  ];

  function kindLabel(k) {
    var ui = DATA.ui;
    return k === "skill" ? ui.builtinKindSkill
         : k === "workflow" ? ui.builtinKindWorkflow
         : ui.kindBuiltin;
  }

  function renderBuiltinHead() {
    $("#table-head").innerHTML = BI_COLS.map(function (c) {
      return '<th class="' + c.cls + '">' + esc(DATA.ui[c.key]) + "</th>";
    }).join("");
  }

  function pairCell(it) {
    var ui = DATA.ui, out = [];
    ((it.pairs || {}).before || []).forEach(function (p) {
      out.push('<a class="pair-mini" href="#' + esc(slug(p.command)) + '" title="' +
        esc(ui.pairsBefore + "：" + p.why) + '"><span class="arr">←</span>' + esc(p.command) + "</a>");
    });
    ((it.pairs || {}).after || []).forEach(function (p) {
      out.push('<a class="pair-mini" href="#' + esc(slug(p.command)) + '" title="' +
        esc(ui.pairsAfter + "：" + p.why) + '"><span class="arr">→</span>' + esc(p.command) + "</a>");
    });
    return out.length ? out.join(" ") : '<span class="bi-dash">—</span>';
  }

  function renderBuiltinRow(it) {
    var ui = DATA.ui;
    var aliases = (it.aliases || []).map(function (a) {
      return '<span class="bi-alias">' + esc(a) + "</span>";
    }).join("");
    if (it.formerName) {
      aliases += '<span class="bi-alias former" title="' + esc(ui.formerLabel) + '">' +
                 esc(it.formerName) + "</span>";
    }
    var offtable = it.source && it.source !== "table"
      ? '<span class="bi-alias offtable" title="' + esc(it.source) + '">' + esc(ui.offTableLabel) + "</span>"
      : "";
    var kind = it.kind !== "builtin"
      ? '<span class="kind-tag k-' + esc(it.kind) + '">' + esc(kindLabel(it.kind)) + "</span>" : "";

    return el(
      '<tr class="cmd-row bi-row" id="' + esc(slug(it.command)) + '" data-kind="' + esc(it.kind) +
        '" data-off="' + (offtable ? "1" : "0") + '">' +
        '<td class="c-bicmd" title="' + esc(it.command + (it.args ? " " + it.args : "")) + '">' +
          '<code class="bi-name">' + esc(it.command) + "</code>" +
          (it.args ? '<span class="bi-args">' + esc(it.args) + "</span>" : "") +
          kind + offtable + (aliases ? '<span class="bi-alias-wrap">' + aliases + "</span>" : "") + "</td>" +
        '<td class="c-bipairs">' + pairCell(it) + "</td>" +
        '<td class="c-bipurpose">' + inline(it.purpose) + "</td>" +
        '<td class="c-bicopy">' +
          '<button type="button" class="mini-btn" data-copy="' + esc(it.command) +
            '" title="' + esc(ui.copyCmdHint) + '" data-label="' + esc(ui.copyCmd) + '">' +
            esc(ui.copyCmd) + "</button></td>" +
      "</tr>"
    );
  }

  function renderBuiltins() {
    var b = DATA.builtins, ui = DATA.ui, body = $("#builtin-body");

    $("#builtin-lead").innerHTML = inline(ui.builtinLead);

    (b.groups || []).forEach(function (g, gi) {
      var rows = b.items.filter(function (it) { return it.group === g.title; });
      if (!rows.length) return;
      var card = el(
        '<section class="group-card" data-group="' + esc(g.title) + '" id="g-' +
          esc(g.title.replace(/[^\w一-鿿]/g, "")) + '">' +
          '<header class="gc-head">' +
            '<span class="gc-n">' + (gi + 1) + "</span>" +
            '<h2 class="gc-title">' + esc(g.title) + "</h2>" +
            '<span class="gc-count">' + rows.length + " 条</span>" +
            '<span class="gc-why">' + esc(g.why) + "</span>" +
          "</header>" +
          '<table class="bi-table"><colgroup>' +
            '<col class="w-bicmd"><col class="w-bipairs"><col class="w-bipurpose"><col class="w-bicopy">' +
          "</colgroup><tbody></tbody></table>" +
        "</section>"
      );
      var tb = card.querySelector("tbody");
      rows.forEach(function (it) { tb.appendChild(renderBuiltinRow(it)); });
      body.appendChild(card);
    });

    $("#builtin-authority").innerHTML =
      "⚠️ " + ui.builtinAuthority +
      ' <a href="' + esc(b.officialDocs) + '" rel="noopener">' + esc(ui.builtinDocsLink) + "</a><br>" +
      '<span class="builtin-based">' + esc(ui.builtinBasedOn) + "：" + esc(b.basedOn) + "。" +
      esc(b.caveat) + "</span>";
  }

  /* 分组跳转条：111 行时这是主要导航方式 */
  function renderGroupJump() {
    var b = DATA.builtins, host = $("#group-jump"), html = [];
    html.push('<span class="fs-lead">' + esc(DATA.ui.groupJumpLead) + "</span>");
    (b.groups || []).forEach(function (g) {
      var n = b.items.filter(function (it) { return it.group === g.title; }).length;
      if (!n) return;
      html.push('<a class="fs-step" href="#g-' + esc(g.title.replace(/[^\w一-鿿]/g, "")) +
        '" title="' + esc(g.why) + '">' + esc(g.title) +
        '<span class="fs-n">' + n + "</span></a>");
    });
    host.innerHTML = html.join("");
  }

  // ── 筛选与搜索（作用于内置命令主表）──────────────

  function haystack(it) {
    if (!it._hay) {
      it._hay = [it.command, it.purpose, it.group, it.args || "", it.formerName || ""]
        .concat(it.aliases || []).join(" ").toLowerCase();
    }
    return it._hay;
  }

  function apply() {
    var b = DATA.builtins, shown = 0;
    b.items.forEach(function (it) {
      var ok = true;
      if (STATE.kind === "offtable") ok = (it.source && it.source !== "table");
      else if (STATE.kind !== "all") ok = it.kind === STATE.kind;
      if (ok && STATE.query) ok = haystack(it).indexOf(STATE.query) !== -1;
      var row = document.getElementById(slug(it.command));
      if (row) row.hidden = !ok;
      if (ok) shown++;
    });

    (b.groups || []).forEach(function (g) {
      var any = b.items.some(function (it) {
        if (it.group !== g.title) return false;
        var r = document.getElementById(slug(it.command));
        return r && !r.hidden;
      });
      var card = $('section.group-card[data-group="' + g.title + '"]');
      if (card) card.hidden = !any;
    });

    $("#empty-state").hidden = shown !== 0;
    if (shown === 0) $("#empty-state").textContent = DATA.ui.noResults;
    $("#search-clear").hidden = STATE.query === "";
    $$(".filter").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === STATE.kind));
    });
  }

  function renderFilters() {
    var b = DATA.builtins, ui = DATA.ui, host = $("#filters");
    var counts = { all: b.items.length, builtin: 0, skill: 0, workflow: 0, offtable: 0 };
    b.items.forEach(function (it) {
      counts[it.kind] = (counts[it.kind] || 0) + 1;
      if (it.source && it.source !== "table") counts.offtable++;
    });
    var opts = [
      { id: "all",      label: ui.filterAll },
      { id: "builtin",  label: ui.kindBuiltin },
      { id: "skill",    label: ui.builtinKindSkill },
      { id: "workflow", label: ui.builtinKindWorkflow },
      { id: "offtable", label: ui.offTableLabel }
    ];
    opts.forEach(function (o) {
      if (!counts[o.id]) return;
      host.appendChild(el('<button type="button" class="filter" data-filter="' + esc(o.id) +
        '" aria-pressed="' + (o.id === "all") + '">' + esc(o.label) +
        '<span class="n">' + counts[o.id] + "</span></button>"));
    });
    host.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      STATE.kind = btn.dataset.filter;
      apply();
    });
  }

  // ── 杂项 ────────────────────────────────────────────

  function renderChrome() {
    var m = DATA.meta;
    $("#site-tagline").textContent = m.tagline;
    $("#search").placeholder = DATA.ui.searchPlaceholder;
    $("#disclaimer").textContent = m.disclaimer;
    $("#version").textContent = "v" + m.contentVersion + " · " + m.updated;
    document.title = m.name + " · " + m.tagline;

    DATA.sections.forEach(function (s) {
      var node = $("#sec-" + s.id);
      if (!node) return;
      var i = $(".sec-index", node), t = $(".sec-title", node), b = $(".sec-subtitle", node);
      if (i) i.textContent = s.index;
      if (t) t.textContent = s.title;
      if (b) b.textContent = s.subtitle;
    });

    $("#sources").innerHTML = esc(DATA.ui.sourcesLabel) + "：" + m.sources.map(function (s) {
      return '<a href="' + esc(s.url) + '" rel="noopener">' + esc(s.title) + "</a>（" +
             esc(DATA.ui.checkedOn) + " " + esc(s.checkedOn) + "）";
    }).join(" · ");
  }

  function wireEvents() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-copy]");
      if (btn) { handleCopy(btn); return; }

      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = decodeURIComponent(link.getAttribute("href").slice(1));
      var target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      // 目标可能被筛选或搜索藏起来了，先清掉过滤再跳
      if (target.hidden) {
        STATE.kind = "all"; STATE.query = ""; $("#search").value = "";
        apply();
      }
      history.replaceState(null, "", "#" + id);
      target.scrollIntoView({ block: "center" });
      target.classList.remove("flash");
      void target.offsetWidth;
      target.classList.add("flash");
    });

    var search = $("#search"), t;
    search.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () { STATE.query = search.value.trim().toLowerCase(); apply(); }, 120);
    });
    search.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { search.value = ""; STATE.query = ""; apply(); }
    });
    $("#search-clear").addEventListener("click", function () {
      search.value = ""; STATE.query = ""; apply(); search.focus();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); search.focus();
      }
    });

    var toTop = $("#to-top");
    window.addEventListener("scroll", function () { toTop.hidden = window.scrollY < 600; }, { passive: true });
    toTop.addEventListener("click", function (e) {
      e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ── 启动 ────────────────────────────────────────────

  fetch("commands.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (json) {
      DATA = json;
      renderChrome();
      renderFilters();
      renderGroupJump();
      renderBuiltinHead();
      renderBuiltins();
      wireEvents();
      apply();
      if (location.hash) {
        var node = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (node) node.scrollIntoView({ block: "start" });
      }
    })
    .catch(function (err) {
      $("#main").prepend(el(
        '<p class="empty-state">加载 <code>commands.json</code> 失败：' + esc(err.message) +
        "<br><small>本地预览请用 HTTP 服务起（<code>python3 -m http.server</code>），" +
        "直接双击打开 index.html 会被浏览器的同源策略挡住。</small></p>"
      ));
    });
})();
