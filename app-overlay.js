// app-overlay.js — 맥미니 대표가 앱(Capacitor) 쪽에서 index.html 위에 덧입혀 온 화면 손질 셋(2026-10-14)
// index.html 에 합친 뒤 앱 쪽은 지운다. 앱 전용 것(로그인·광고·위젯·알림)은 넣지 않았다 — 화면 손질만.
//   ① 머리말: 제목 줄 + 아이콘 단추 둘(문구·설정) / 그 아래 늘 열린 한 줄 검색칸(findBar 를 옮겨 씀) / 반투명 흐림
//   ② 입력 줄 접기: 평소엔 「할 일 추가」 한 줄, 입력칸을 누르면 프로젝트·날짜 줄 펼침
//   ③ 켜자마자 저장된 state 로 render() 먼저(로그인·드라이브 읽기를 기다리던 빈 화면)
(function () {
  // ───── 머리말 정리(앱판) — 사장님 「상단이 이상하다 · 검색이 용이하게 · 난잡하다」 ─────
  // 글자 단추 셋(검색·문구·설정) → 제목 줄엔 아이콘 둘, 그 아래 늘 열린 검색칸 한 줄. 검색칸은 원래 것(findText)을 옮겨 쓰니 검색 동작은 그대로.
  // 머리말은 반투명 유리(뒤 목록이 흐리게 비침). 같은 모양을 index.html 에도 넣도록 「앱 개발」 세션에 제안함.
  const SVG = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  function tidyHeader() {
    const top = document.querySelector("header .top"), bar = document.getElementById("findBar"), q = document.getElementById("findText");
    if (!top || !bar || !q || top.dataset.tidy) return;
    top.dataset.tidy = "1";
    ["search", "findClose"].forEach(id => { const b = document.getElementById(id); if (b) b.style.display = "none"; });
    bar.hidden = false; bar.classList.add("tidy");
    bar.insertAdjacentHTML("afterbegin", '<span class="lens">' + SVG('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>') + '</span>');
    top.after(bar);   // 사장님: 검색이 맨 위면 어색 — 제목 줄 «아래»에 한 줄 통째로
    q.placeholder = "검색";
    const icon = (id, d, label) => { const b = document.getElementById(id); if (b) { b.innerHTML = SVG(d); b.classList.add("icon"); b.setAttribute("aria-label", label); } };
    icon("phrases", '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>', "문구");
    icon("settings", '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>', "설정");
    const css = document.createElement("style");
    css.textContent = `
      header { background: var(--back); background: color-mix(in srgb, var(--back) 70%, transparent); -webkit-backdrop-filter: blur(20px) saturate(180%); backdrop-filter: blur(20px) saturate(180%); }
      .top[data-tidy] { gap: 6px; }
      .find.tidy { margin: 10px 0 2px; position: relative; display: flex; }
      .find.tidy input { width: 100%; height: 42px; border-radius: 21px; padding: 0 14px 0 40px; font-size: 16px; background: var(--card); border: 1px solid var(--line); }
      .find.tidy .lens { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: var(--faint); pointer-events: none; }
      .top .icon { flex: none; width: 42px; height: 42px; padding: 0; border-radius: 21px; display: grid; place-items: center; }
      .top .icon svg, .find.tidy .lens svg { width: 100%; height: 100%; }
      .top .icon svg { width: 20px; height: 20px; }`;
    document.head.appendChild(css);
  }
  document.addEventListener("DOMContentLoaded", tidyHeader);

  // ───── 입력 칸 접기(앱판) — 평소엔 「할 일 추가」 한 줄, 누르면 프로젝트·마감일 줄이 펼쳐진다 ─────
  // 아래쪽(입력 두 줄 + 광고)이 화면의 22% 를 먹었다(실측). 목록 아래 여백도 접힌 높이에 맞춘다.
  function foldInput() {
    const f = document.querySelector("footer"), t = document.getElementById("newText");
    const rows = f ? f.querySelectorAll(".row") : [];
    if (!f || !t || rows.length < 2 || f.dataset.fold) return;
    f.dataset.fold = "1";
    const set = open => f.classList.toggle("open", open);
    f.addEventListener("focusin", () => set(true));
    // 날짜·프로젝트를 고르는 동안엔 접지 않는다 — 칸 밖으로 나가고 글자가 비었을 때만 접는다
    f.addEventListener("focusout", () => setTimeout(() => { if (!f.contains(document.activeElement) && !t.value.trim()) set(false); }, 200));
    // 입력 줄이 화면에 «떠 있을» 때(옛 틀 · position:fixed)만 목록 아래 여백을 맞춘다.
    // v18 부터 입력 줄은 틀 안에 들어가 있어, 여기서 여백을 더하면 그만큼 아래가 빈 띠가 됐다(사장님 아이폰 10:19 실측)
    new ResizeObserver(() => {
      const floating = getComputedStyle(f).position === "fixed";
      document.body.style.paddingBottom = floating && f.offsetHeight ? "calc(" + (f.offsetHeight + 12) + "px + var(--ad, 0px))" : "";
    }).observe(f);
    const css = document.createElement("style");
    css.textContent = "footer[data-fold]:not(.open) .row + .row { display: none; }";
    document.head.appendChild(css);
  }
  document.addEventListener("DOMContentLoaded", foldInput);

  // ───── 켜자마자 지난번 목록부터 — 사장님 「앱 켤 때 내용 볼 때까지 대기가 길다」 ─────
  // index.html 은 로그인 → 드라이브 읽기가 끝나야 첫 화면을 그린다(그동안 빈 화면). 이 폰에 저장된 지난 목록을 먼저 그리고,
  // 받아 오면 그쪽이 다시 그린다. 로그인한 적 있으면 「구글에 연결하면…」 띠가 잠깐 뜨지 않게 가린다.
  document.addEventListener("DOMContentLoaded", () => {
    try {
      if (!localStorage.getItem("state") || typeof render !== "function") return;
      render();
      const b = document.getElementById("banner");
      if (b && localStorage.getItem("signInDeclined") !== "1") b.hidden = true;
    } catch (e) {}
  });

})();
