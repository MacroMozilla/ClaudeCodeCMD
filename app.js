/* ClaudeCodeCMD — 渲染 commands.json 成一张大表。
   这个文件里不含任何具体命令内容：文案、分组、顺序、标签全部来自 JSON。 */

(function () {
  "use strict";

  var DATA = null;
  var STATE = { filter: "all", query: "", open: null };

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

  function byId(id) {
    for (var i = 0; i < DATA.commands.length; i++) if (DATA.commands[i].id === id) return DATA.commands[i];
    return null;
  }
  function riskMeta(id) {
    var r = DATA.taxonomy.risk;
    for (var i = 0; i < r.length; i++) if (r[i].id === id) return r[i];
    return { id: id, label: id, desc: "" };
  }

  function commandFileText(cmd) {
    var fm = cmd.commandFile.frontmatter, lines = ["---"];
    Object.keys(fm).forEach(function (k) {
      var v = fm[k];
      lines.push(k + ": " + (v === true ? "true" : v === false ? "false" : v));
    });
    lines.push("---", "", cmd.prompt, "");
    return lines.join("\n");
  }

  // ── 复制 ────────────────────────────────────────────

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
    var cmd = byId(btn.dataset.for);
    if (!cmd) return;
    var text = btn.dataset.copy === "file" ? commandFileText(cmd) : cmd.prompt;
    var original = btn.dataset.label;
    btn.dataset.busy = "1";
    writeClipboard(text).then(function () {
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

  // ── ① 流程横带 ─────────────────────────────────────

  function renderFlowStrip() {
    var f = DATA.flow, host = $("#flow-strip"), html = [];
    html.push('<span class="fs-lead">' + esc(DATA.sections.filter(function (s) {
      return s.id === "flow";
    })[0].title) + "</span>");

    f.steps.forEach(function (s, i) {
      if (i) html.push('<span class="fs-arrow">›</span>');
      html.push('<a class="fs-step" href="#' + esc(s.commands[0]) + '" title="' + esc(s.why) + '">' +
        '<span class="fs-n">' + esc(s.n) + "</span>" + esc(s.title) + "</a>");
    });

    var rail = byId(f.rail.id);
    html.push('<span class="fs-rail"><b>' + esc(f.rail.label) + "</b></span>");
    if (rail) html.push('<a class="fs-step" href="#' + esc(rail.id) + '">' + esc(rail.name) + "</a>");
    host.innerHTML = html.join("");
  }

  // ── ② 大表 ─────────────────────────────────────────

  /* 没有单独的「写文件」列：风险等级已经区分只读/低/中/高，再列一次是重复信息 */
  var COLS = [
    { key: "command", cls: "c-command" },
    { key: "risk",    cls: "c-risk" },
    { key: "summary", cls: "c-summary" },
    { key: "pairs",   cls: "c-pairs" },
    { key: "copy",    cls: "c-copy" }
  ];
  var COL_LABEL = {
    command: "colCommand", risk: "colRisk",
    summary: "colSummary", pairs: "colPairs", copy: "colCopy"
  };

  function renderHead() {
    $("#table-head").innerHTML = COLS.map(function (c) {
      return '<th class="' + c.cls + '">' + esc(DATA.ui[COL_LABEL[c.key]]) + "</th>";
    }).join("");
  }

  function pairsMini(cmd) {
    var out = [];
    (cmd.pairs.before || []).forEach(function (p) {
      var t = byId(p.id);
      if (t) out.push('<a class="pair-mini" href="#' + esc(p.id) + '" title="' + esc(p.reason) +
        '"><span class="arr">←</span> ' + esc(t.name) + "</a>");
    });
    (cmd.pairs.after || []).forEach(function (p) {
      var t = byId(p.id);
      if (t) out.push('<a class="pair-mini" href="#' + esc(p.id) + '" title="' + esc(p.reason) +
        '"><span class="arr">→</span> ' + esc(t.name) + "</a>");
    });
    return out.slice(0, 2).join(" ") + (out.length > 2 ? ' <span class="pair-mini">+' + (out.length - 2) + "</span>" : "");
  }

  function renderRow(cmd) {
    var risk = riskMeta(cmd.risk), ui = DATA.ui;
    var shadow = cmd.shadowsBuiltin
      ? ' <span class="shadow-dot" title="' + esc(ui.shadowsLabel + " " + cmd.shadowsBuiltin.command) + '">🔁</span>'
      : "";

    return el(
      '<tr class="cmd-row" id="' + esc(cmd.id) + '" data-cmd="' + esc(cmd.id) + '" data-cat="' + esc(cmd.category) + '">' +
        '<td class="c-command"><button type="button" class="cmd-name" aria-expanded="false">' +
          esc(cmd.name) + "</button>" + shadow + "</td>" +
        '<td class="c-risk"><span class="badge risk-' + esc(cmd.risk) + '" title="' + esc(risk.desc) + '">' +
          esc(risk.label) + "</span></td>" +
        '<td class="c-summary" title="' + esc(cmd.summary) + '">' + inline(cmd.summary) + "</td>" +
        '<td class="c-pairs">' + pairsMini(cmd) + "</td>" +
        '<td class="c-copy">' +
          '<button type="button" class="mini-btn" data-copy="prompt" data-for="' + esc(cmd.id) +
            '" title="' + esc(ui.copyPromptHint) + '" data-label="' + esc(ui.copyPromptShort) + '">' +
            esc(ui.copyPromptShort) + "</button>" +
          '<button type="button" class="mini-btn" data-copy="file" data-for="' + esc(cmd.id) +
            '" title="' + esc(ui.copyFileHint) + '" data-label="' + esc(ui.copyFileShort) + '">' +
            esc(ui.copyFileShort) + "</button>" +
        "</td>" +
      "</tr>"
    );
  }

  function fieldList(cls, label, items) {
    if (!items || !items.length) return "";
    return '<div class="' + cls + '"><p class="field-label">' + esc(label) + "</p><ul>" +
      items.map(function (x) { return "<li>" + inline(x) + "</li>"; }).join("") + "</ul></div>";
  }

  function renderDetail(cmd) {
    var ui = DATA.ui, parts = [];

    if (cmd.shadowsBuiltin) {
      parts.push('<div class="shadow-warn">🔁 ' + esc(ui.shadowsLabel) + " <code>" +
        esc(cmd.shadowsBuiltin.command) + "</code> — " + inline(cmd.shadowsBuiltin.note) + "</div>");
    }
    parts.push(fieldList("f-use", ui.whenToUse, cmd.whenToUse));
    parts.push(fieldList("f-dont", ui.whenNotToUse, cmd.whenNotToUse));
    parts.push(fieldList("f-pit", ui.pitfalls, cmd.pitfalls));

    var pr = [];
    [["before", ui.pairsBefore], ["after", ui.pairsAfter]].forEach(function (d) {
      (cmd.pairs[d[0]] || []).forEach(function (p) {
        var t = byId(p.id);
        if (!t) return;
        pr.push('<span class="pair-item"><span class="pair-dir">' + esc(d[1]) + "</span>" +
          '<a class="chip" href="#' + esc(p.id) + '">' + esc(t.name) + "</a>" +
          '<span class="pair-reason">' + inline(p.reason) + "</span></span>");
      });
    });
    if (pr.length) {
      parts.push('<div class="detail-full"><p class="field-label">' + esc(ui.colPairs) +
        '</p><div class="detail-pairs">' + pr.join("") + "</div></div>");
    }

    var notes = (cmd.commandFile.frontmatterNotes || []).length
      ? '<ul class="fm-notes">' + cmd.commandFile.frontmatterNotes.map(function (n) {
          return "<li>" + inline(n) + "</li>";
        }).join("") + "</ul>" : "";

    parts.push('<div class="prompt-wrap">' +
      '<p class="field-label">' + esc(ui.promptToggle) + "</p>" +
      '<pre class="prompt">' + esc(cmd.prompt) + "</pre>" +
      '<p class="file-path">' + esc(ui.saveAs) + " <code>" + esc(cmd.commandFile.path) + "</code></p>" +
      notes +
      '<div class="detail-actions">' +
        '<div class="action-col">' +
          '<button type="button" class="btn primary" data-copy="prompt" data-for="' + esc(cmd.id) +
            '" data-label="' + esc(ui.copyPrompt) + '">' + esc(ui.copyPrompt) + "</button>" +
          '<span class="action-hint">' + esc(ui.copyPromptHint) + "</span>" +
        "</div>" +
        '<div class="action-col">' +
          '<button type="button" class="btn" data-copy="file" data-for="' + esc(cmd.id) +
            '" data-label="' + esc(ui.copyFile) + '">' + esc(ui.copyFile) + "</button>" +
          '<span class="action-hint">' + esc(ui.copyFileHint) + "</span>" +
        "</div>" +
      "</div></div>");

    return el('<tr class="detail-row" data-detail="' + esc(cmd.id) + '"><td colspan="' + COLS.length + '">' +
      '<div class="detail">' + parts.join("") + "</div></td></tr>");
  }

  function renderTable() {
    var body = $("#table-body");
    DATA.groups.forEach(function (grp) {
      body.appendChild(el(
        '<tr class="group-row" data-group="' + esc(grp.id) + '"><td colspan="' + COLS.length + '">' +
          '<span class="group-title"><span class="group-n">' + esc(grp.n) + "</span>" + esc(grp.title) + "</span>" +
          '<span class="group-why">' + inline(grp.why) + "</span>" +
        "</td></tr>"
      ));
      grp.commands.forEach(function (id) {
        var c = byId(id);
        if (c) body.appendChild(renderRow(c));
      });
    });
  }

  /* 手风琴：一次只展开一条，保持「一屏看完」 */
  function toggle(id) {
    var open = STATE.open;
    if (open) {
      var prevRow = document.getElementById(open);
      var prevDetail = $('tr[data-detail="' + open + '"]');
      if (prevRow) { prevRow.classList.remove("open"); $(".cmd-name", prevRow).setAttribute("aria-expanded", "false"); }
      if (prevDetail) prevDetail.remove();
      STATE.open = null;
      if (open === id) return;
    }
    var row = document.getElementById(id), cmd = byId(id);
    if (!row || !cmd) return;
    row.classList.add("open");
    $(".cmd-name", row).setAttribute("aria-expanded", "true");
    row.insertAdjacentElement("afterend", renderDetail(cmd));
    STATE.open = id;
  }

  // ── ③④ ─────────────────────────────────────────────

  function renderBuiltins() {
    var b = DATA.builtins, ui = DATA.ui, host = $("#builtin-body");
    var authority = '<p class="builtin-authority">⚠️ ' + ui.builtinAuthority +
      ' <a href="' + esc(b.officialDocs) + '" rel="noopener">' + esc(ui.builtinDocsLink) + "</a><br>" +
      '<span class="builtin-based">' + esc(ui.builtinBasedOn) + "：" + esc(b.basedOn) + "。" +
      esc(b.caveat) + "</span></p>";

    if (!b.items || !b.items.length) {
      host.appendChild(el('<div class="builtin-empty">' + inline(ui.builtinEmpty) + authority + "</div>"));
      return;
    }

    host.appendChild(el('<p class="builtin-lead">' + inline(b.reason) + "</p>"));

    (b.groups || [{ title: "", why: "" }]).forEach(function (g) {
      var rows = b.items.filter(function (it) { return it.group === g.title; });
      if (!rows.length) return;
      host.appendChild(el(
        '<div class="builtin-group">' +
          '<div class="bg-head"><b>' + esc(g.title) + "</b>" +
            '<span class="bg-why">' + esc(g.why) + "</span></div>" +
          '<div class="table-scroll"><table class="builtins"><tbody>' +
            rows.map(function (it) {
              var tag = it.kind === "skill" ? '<span class="kind-tag">' + esc(ui.builtinKindSkill) + "</span>"
                      : it.kind === "workflow" ? '<span class="kind-tag wf">' + esc(ui.builtinKindWorkflow) + "</span>"
                      : "";
              var extra = "";
              if (it.aliases && it.aliases.length) {
                extra += ' <span class="bi-alias">' + esc(ui.aliasLabel) + " " +
                         it.aliases.map(esc).join(" ") + "</span>";
              }
              if (it.formerName) {
                extra += ' <span class="bi-alias former">' + esc(ui.formerLabel) + " " +
                         esc(it.formerName) + "</span>";
              }
              if (it.source && it.source !== "table") {
                extra += ' <span class="bi-alias offtable" title="' + esc(it.source) + '">' +
                         esc(ui.offTableLabel) + "</span>";
              }
              return "<tr><td>" + esc(it.command) +
                (it.args ? '<span class="bi-args">' + esc(it.args) + "</span>" : "") + tag +
                "</td><td>" + inline(it.purpose) + extra + "</td></tr>";
            }).join("") +
          "</tbody></table></div>" +
        "</div>"
      ));
    });
    host.appendChild(el(authority));
  }

  function renderAntipatterns() {
    var host = $("#antipatterns"), ui = DATA.ui;
    DATA.antipatterns.forEach(function (a) {
      var related = (a.related || []).map(function (id) {
        var c = byId(id);
        return c ? '<a class="chip" href="#' + esc(id) + '">' + esc(c.name) + "</a>" : "";
      }).join("");
      host.appendChild(el(
        '<li class="antipattern">' +
          '<div class="ap-title">' + inline(a.title) +
            (a.example ? ' <span class="ap-example">' + inline(a.example) + "</span>" : "") + "</div>" +
          '<div class="ap-line"><span class="k">' + esc(ui.antipatternWhy) + "</span>" + inline(a.why) + "</div>" +
          '<div class="ap-line"><span class="k">' + esc(ui.antipatternInstead) + "</span>" + inline(a.instead) +
            '<span class="ap-related">' + related + "</span></div>" +
        "</li>"
      ));
    });
  }

  // ── 筛选与搜索（纯前端，不跳页）─────────────────────

  function haystack(cmd) {
    if (!cmd._hay) {
      cmd._hay = [cmd.name, cmd.summary, cmd.prompt]
        .concat(cmd.whenToUse, cmd.whenNotToUse, cmd.pitfalls || [])
        .join(" ").toLowerCase();
    }
    return cmd._hay;
  }

  function apply() {
    var shown = 0;
    DATA.commands.forEach(function (c) {
      var ok = (STATE.filter === "all" || c.category === STATE.filter) &&
               (!STATE.query || haystack(c).indexOf(STATE.query) !== -1);
      var row = document.getElementById(c.id);
      if (row) row.hidden = !ok;
      if (!ok && STATE.open === c.id) toggle(c.id);
      if (ok) shown++;
    });

    // 组里一条都不剩就把组标题也收起来
    DATA.groups.forEach(function (grp) {
      var any = grp.commands.some(function (id) {
        var r = document.getElementById(id);
        return r && !r.hidden;
      });
      var gr = $('tr[data-group="' + grp.id + '"]');
      if (gr) gr.hidden = !any;
    });

    $("#empty-state").hidden = shown !== 0;
    if (shown === 0) $("#empty-state").textContent = DATA.ui.noResults;
    $("#search-clear").hidden = STATE.query === "";
  }

  function renderFilters() {
    var host = $("#filters"), ui = DATA.ui, counts = { all: DATA.commands.length };
    DATA.commands.forEach(function (c) { counts[c.category] = (counts[c.category] || 0) + 1; });

    [{ id: "all", label: ui.filterAll }].concat(DATA.taxonomy.category).forEach(function (o) {
      if (o.id !== "all" && !counts[o.id]) return; // 没有条目的分类不显示按钮
      host.appendChild(el('<button type="button" class="filter" data-filter="' + esc(o.id) +
        '" aria-pressed="' + (o.id === "all") + '">' + esc(o.label) +
        '<span class="n">' + (counts[o.id] || 0) + "</span></button>"));
    });

    host.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      STATE.filter = btn.dataset.filter;
      $$(".filter", host).forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      apply();
    });
  }

  // ── 杂项 ────────────────────────────────────────────

  function jumpTo(id) {
    var row = document.getElementById(id);
    if (!row) return;
    if (row.hidden) { // 目标被筛掉了就先解除筛选
      STATE.filter = "all"; STATE.query = ""; $("#search").value = "";
      $$(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === "all")); });
      apply();
    }
    if (STATE.open !== id) toggle(id);
    row.scrollIntoView({ block: "center" });
  }

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

    $("#copy-help").innerHTML = inline(DATA.ui.copyHelp);

    $("#sources").innerHTML = esc(DATA.ui.sourcesLabel) + "：" + m.sources.map(function (s) {
      return '<a href="' + esc(s.url) + '" rel="noopener">' + esc(s.title) + "</a>（" +
             esc(DATA.ui.checkedOn) + " " + esc(s.checkedOn) + "）";
    }).join(" · ");
  }

  function wireEvents() {
    document.addEventListener("click", function (e) {
      var copyBtn = e.target.closest("[data-copy]");
      if (copyBtn) { e.stopPropagation(); handleCopy(copyBtn); return; }

      var name = e.target.closest(".cmd-name");
      if (name) { toggle(name.closest("[data-cmd]").dataset.cmd); return; }

      var link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        var id = decodeURIComponent(link.getAttribute("href").slice(1));
        if (id) { history.replaceState(null, "", "#" + id); jumpTo(id); }
      }
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
      if (e.key === "Escape" && STATE.open) toggle(STATE.open);
    });
  }

  // ── 启动 ────────────────────────────────────────────

  fetch("commands.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (json) {
      DATA = json;
      renderChrome();
      renderFilters();
      renderFlowStrip();
      renderHead();
      renderTable();
      renderBuiltins();
      renderAntipatterns();
      wireEvents();
      apply();
      if (location.hash) jumpTo(decodeURIComponent(location.hash.slice(1)));
    })
    .catch(function (err) {
      $("#main").prepend(el(
        '<p class="empty-state">加载 <code>commands.json</code> 失败：' + esc(err.message) +
        "<br><small>本地预览请用 HTTP 服务起（<code>python3 -m http.server</code>），" +
        "直接双击打开 index.html 会被浏览器的同源策略挡住。</small></p>"
      ));
    });
})();
