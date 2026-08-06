/* ClaudeCodeCMD — 渲染 commands.json。
   这个文件里不含任何具体命令内容：文案、标签、顺序全部来自 JSON。 */

(function () {
  "use strict";

  var DATA = null;
  var STATE = { filter: "all", query: "" };

  // ── 工具 ────────────────────────────────────────────

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* 先转义再做行内标记，所以内容里的尖括号不会变成标签 */
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

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function byId(id) {
    for (var i = 0; i < DATA.commands.length; i++) {
      if (DATA.commands[i].id === id) return DATA.commands[i];
    }
    return null;
  }

  function riskMeta(id) {
    var r = DATA.taxonomy.risk;
    for (var i = 0; i < r.length; i++) if (r[i].id === id) return r[i];
    return { id: id, label: id, desc: "" };
  }

  function sectionMeta(id) {
    var s = DATA.sections;
    for (var i = 0; i < s.length; i++) if (s[i].id === id) return s[i];
    return null;
  }

  /* 把 frontmatter + 提示词拼成可直接存盘的 .md */
  function commandFileText(cmd) {
    var fm = cmd.commandFile.frontmatter;
    var lines = ["---"];
    Object.keys(fm).forEach(function (k) {
      var v = fm[k];
      lines.push(k + ": " + (v === true ? "true" : v === false ? "false" : v));
    });
    lines.push("---", "", cmd.prompt, "");
    return lines.join("\n");
  }

  // ── 复制 ────────────────────────────────────────────

  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length); // iOS
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("execCommand failed"));
    });
  }

  /* 按钮自己变「已复制 ✓」，两秒后恢复。不弹 toast，不跳转。 */
  function handleCopy(btn) {
    if (btn.dataset.busy === "1") return;
    var cmd = byId(btn.closest("[data-cmd]").dataset.cmd);
    if (!cmd) return;
    var text = btn.dataset.copy === "file" ? commandFileText(cmd) : cmd.prompt;
    var original = btn.dataset.label;

    btn.dataset.busy = "1";
    writeClipboard(text).then(function () {
      btn.textContent = DATA.ui.copied;
      btn.classList.add("done");
    }).catch(function () {
      btn.textContent = DATA.ui.copyFailed;
      btn.classList.add("failed");
    }).then(function () {
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("done", "failed");
        btn.dataset.busy = "0";
      }, 2000);
    });
  }

  // ── 渲染：① 流程 ───────────────────────────────────

  function renderFlow() {
    var flow = DATA.flow;
    $("#flow-lead").textContent = flow.lead;

    var pivotAfter = {};
    flow.pivots.forEach(function (p) {
      var at = Math.max(p.between[0], p.between[1]);
      (pivotAfter[at] = pivotAfter[at] || []).push(p);
    });

    var ol = $("#flow-steps");
    flow.steps.forEach(function (s) {
      var chips = s.commands.map(function (id) {
        var c = byId(id);
        return c ? '<a class="chip" href="#' + esc(id) + '">' + esc(c.name) + "</a>" : "";
      }).join("");

      ol.appendChild(el(
        '<li class="flow-step">' +
          '<div class="flow-num">' + esc(s.n) + "</div>" +
          '<div class="flow-step-title">' + esc(s.title) + "</div>" +
          '<div class="flow-why">' + inline(s.why) + "</div>" +
          '<div class="flow-cmds">' + chips + "</div>" +
        "</li>"
      ));

      (pivotAfter[s.n] || []).forEach(function (p) {
        ol.appendChild(el(
          '<div class="flow-pivot"><b>' + esc(DATA.ui.flowPivotLabel) + "：" + esc(p.rule) +
          "</b> <span>" + inline(p.why) + "</span></div>"
        ));
      });
    });

    var rail = byId(flow.rail.id);
    ol.insertAdjacentElement("afterend", el(
      '<p class="flow-rail">' +
        (rail ? '<a class="chip" href="#' + esc(rail.id) + '">' + esc(rail.name) + "</a> " : "") +
        "<b>" + esc(flow.rail.label) + "</b> " +
        '<span class="flow-rail-note">' + inline(flow.rail.note) + "</span>" +
      "</p>"
    ));

    var wrap = $("#flow-shortcuts");
    wrap.appendChild(el('<div class="field-label">' + esc(DATA.ui.flowShortcutLabel) + "</div>"));
    flow.shortcuts.forEach(function (s) {
      var c = byId(s.id);
      if (!c) return;
      wrap.appendChild(el(
        '<div class="shortcut">' +
          '<a class="chip" href="#' + esc(s.id) + '">' + esc(c.name) + "</a>" +
          "<b>" + esc(s.label) + "</b>" +
          '<span class="shortcut-note">' + inline(s.note) + "</span>" +
        "</div>"
      ));
    });
  }

  // ── 渲染：命令卡片 ─────────────────────────────────

  function fieldList(cls, label, items) {
    if (!items || !items.length) return "";
    return '<div class="field ' + cls + '"><p class="field-label">' + esc(label) + "</p><ul>" +
      items.map(function (x) { return "<li>" + inline(x) + "</li>"; }).join("") +
      "</ul></div>";
  }

  function pairRows(cmd) {
    var rows = [];
    [["before", DATA.ui.pairsBefore], ["after", DATA.ui.pairsAfter]].forEach(function (pair) {
      (cmd.pairs[pair[0]] || []).forEach(function (p) {
        var t = byId(p.id);
        if (!t) return;
        rows.push(
          '<div class="pair-row">' +
            '<span class="pair-dir">' + esc(pair[1]) + "</span>" +
            '<a class="chip" href="#' + esc(p.id) + '">' + esc(t.name) + "</a>" +
            '<span class="pair-reason">' + inline(p.reason) + "</span>" +
          "</div>"
        );
      });
    });
    return rows.length ? '<div class="pairs">' + rows.join("") + "</div>" : "";
  }

  function renderCard(cmd) {
    var risk = riskMeta(cmd.risk);
    var ui = DATA.ui;

    var shadow = cmd.shadowsBuiltin
      ? '<div class="shadow-warn">🔁 ' + esc(ui.shadowsLabel) + " <code>" +
        esc(cmd.shadowsBuiltin.command) + "</code> — " + inline(cmd.shadowsBuiltin.note) + "</div>"
      : "";

    var notes = (cmd.commandFile.frontmatterNotes || []).length
      ? '<ul class="fm-notes">' + cmd.commandFile.frontmatterNotes.map(function (n) {
          return "<li>" + inline(n) + "</li>";
        }).join("") + "</ul>"
      : "";

    return el(
      '<article class="card" id="' + esc(cmd.id) + '" data-cmd="' + esc(cmd.id) + '">' +
        '<div class="card-head">' +
          '<h3 class="card-name">' + esc(cmd.name) + "</h3>" +
          '<span class="badge risk-' + esc(cmd.risk) + '" title="' + esc(risk.desc) + '">' +
            esc(risk.label) + "</span>" +
          '<p class="card-summary">' + inline(cmd.summary) + "</p>" +
        "</div>" +
        '<div class="card-body">' +
          shadow +
          fieldList("use", ui.whenToUse, cmd.whenToUse) +
          fieldList("dont", ui.whenNotToUse, cmd.whenNotToUse) +
          fieldList("pit", ui.pitfalls, cmd.pitfalls) +
          pairRows(cmd) +
          '<details class="prompt-details">' +
            '<summary class="prompt-summary">' + esc(ui.promptToggle) + "</summary>" +
            '<pre class="prompt">' + esc(cmd.prompt) + "</pre>" +
            '<p class="file-path">' + esc(ui.saveAs) + " <code>" +
              esc(cmd.commandFile.path) + "</code></p>" +
            notes +
          "</details>" +
          '<div class="card-actions">' +
            '<button type="button" class="btn primary" data-copy="prompt" data-label="' +
              esc(ui.copyPrompt) + '">' + esc(ui.copyPrompt) + "</button>" +
            '<button type="button" class="btn" data-copy="file" data-label="' +
              esc(ui.copyFile) + '">' + esc(ui.copyFile) + "</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderCards() {
    ["modify", "review", "combo"].forEach(function (sec) {
      var host = $("#sec-" + sec + " .cards");
      DATA.commands.filter(function (c) { return c.section === sec; })
                   .forEach(function (c) { host.appendChild(renderCard(c)); });
    });
  }

  // ── 渲染：⑤ 内置 / ⑥ 反模式 ────────────────────────

  function renderBuiltins() {
    var b = DATA.builtins, ui = DATA.ui;
    var host = $("#builtin-body");
    var authority =
      '<p class="builtin-authority">⚠️ ' + ui.builtinAuthority +
      ' <a href="' + esc(b.officialDocs) + '" rel="noopener">' + esc(ui.builtinDocsLink) + "</a></p>";

    if (!b.items || !b.items.length) {
      host.appendChild(el('<div class="builtin-empty">' + inline(ui.builtinEmpty) + authority + "</div>"));
      return;
    }
    var rows = b.items.map(function (it) {
      return "<tr><td>" + esc(it.command) + "</td><td>" + inline(it.purpose) + "</td></tr>";
    }).join("");
    host.appendChild(el(
      '<div class="table-scroll"><table class="builtins"><tbody>' + rows + "</tbody></table></div>" + authority
    ));
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
          '<div class="ap-line"><span class="k">' + esc(ui.antipatternWhy) +
            '</span><span class="v">' + inline(a.why) + "</span></div>" +
          '<div class="ap-line"><span class="k">' + esc(ui.antipatternInstead) +
            '</span><span class="v">' + inline(a.instead) + "</span></div>" +
          '<div class="ap-related">' + related + "</div>" +
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

  function matches(cmd) {
    if (STATE.filter !== "all" && cmd.category !== STATE.filter) return false;
    if (!STATE.query) return true;
    return haystack(cmd).indexOf(STATE.query) !== -1;
  }

  function apply() {
    var active = STATE.filter !== "all" || STATE.query !== "";
    var total = 0;

    DATA.commands.forEach(function (c) {
      var ok = matches(c);
      var node = document.getElementById(c.id);
      if (node) node.hidden = !ok;
      if (ok) total++;
    });

    ["modify", "review", "combo"].forEach(function (sec) {
      var node = $("#sec-" + sec);
      node.hidden = !$$(".card:not([hidden])", node).length;
    });

    // 这三区不是命令，筛选/搜索时收起来，免得干扰结果
    ["flow", "builtin", "antipatterns"].forEach(function (sec) {
      var node = $("#sec-" + sec);
      if (sec === "builtin") {
        node.hidden = active && !(STATE.filter === "builtin" && !STATE.query);
      } else {
        node.hidden = active;
      }
    });

    var empty = $("#empty-state");
    var nothing = total === 0 && !(STATE.filter === "builtin" && !STATE.query);
    empty.hidden = !nothing;
    if (nothing) empty.textContent = DATA.ui.noResults;

    $("#search-clear").hidden = STATE.query === "";
  }

  function renderFilters() {
    var host = $("#filters"), ui = DATA.ui;
    var counts = { all: DATA.commands.length };
    DATA.commands.forEach(function (c) { counts[c.category] = (counts[c.category] || 0) + 1; });

    var opts = [{ id: "all", label: ui.filterAll }].concat(DATA.taxonomy.category);
    opts.forEach(function (o) {
      var n = counts[o.id] || 0;
      var b = el(
        '<button type="button" class="filter" data-filter="' + esc(o.id) + '" aria-pressed="' +
        (o.id === "all") + '">' + esc(o.label) + '<span class="n">' + n + "</span></button>"
      );
      host.appendChild(b);
    });

    host.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      STATE.filter = btn.dataset.filter;
      $$(".filter", host).forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      apply();
      // 不跳页：只把视口带回内容区顶部
      var main = $("#main");
      if (main.getBoundingClientRect().top < 0) main.scrollIntoView({ block: "start" });
    });
  }

  // ── 杂项 ────────────────────────────────────────────

  function flash(id) {
    var node = document.getElementById(id);
    if (!node || !node.classList.contains("card")) return;
    if (node.hidden) { // 目标被筛掉了就先解除筛选
      STATE.filter = "all"; STATE.query = ""; $("#search").value = "";
      $$(".filter").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.filter === "all"));
      });
      apply();
    }
    node.classList.remove("flash");
    void node.offsetWidth;
    node.classList.add("flash");
    var d = node.querySelector("details");
    if (d) d.open = false;
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
      $(".sec-index", node).textContent = s.index;
      $(".sec-title", node).textContent = s.title;
      $(".sec-subtitle", node).textContent = s.subtitle;
    });

    $("#sources").innerHTML = esc(DATA.ui.sourcesLabel) + "：" +
      m.sources.map(function (s) {
        return '<a href="' + esc(s.url) + '" rel="noopener">' + esc(s.title) + "</a>（" +
               esc(DATA.ui.checkedOn) + " " + esc(s.checkedOn) + "）";
      }).join(" · ");
  }

  function wireEvents() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-copy]");
      if (btn) { handleCopy(btn); return; }
      var chip = e.target.closest("a.chip");
      if (chip) setTimeout(function () { flash(chip.getAttribute("href").slice(1)); }, 0);
    });

    var search = $("#search"), t;
    search.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        STATE.query = search.value.trim().toLowerCase();
        apply();
      }, 120);
    });
    search.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { search.value = ""; STATE.query = ""; apply(); }
    });
    $("#search-clear").addEventListener("click", function () {
      search.value = ""; STATE.query = ""; apply(); search.focus();
    });

    // "/" 聚焦搜索框
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); search.focus();
      }
    });

    var toTop = $("#to-top");
    window.addEventListener("scroll", function () {
      toTop.hidden = window.scrollY < 600;
    }, { passive: true });
    toTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("hashchange", function () {
      flash(decodeURIComponent(location.hash.slice(1)));
    });
  }

  // ── 启动 ────────────────────────────────────────────

  fetch("commands.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (json) {
      DATA = json;
      renderChrome();
      renderFilters();
      renderFlow();
      renderCards();
      renderBuiltins();
      renderAntipatterns();
      wireEvents();
      apply();
      if (location.hash) {
        var id = decodeURIComponent(location.hash.slice(1));
        var node = document.getElementById(id);
        if (node) { node.scrollIntoView({ block: "start" }); flash(id); }
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
