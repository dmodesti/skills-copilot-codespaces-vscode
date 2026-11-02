(function () {
  const STORAGE_KEY = "fc27-dicas-dominadas";
  const ALL = "Todas";
  const NEW = "Novidades FC 27";

  const grid = document.getElementById("tips");
  const empty = document.getElementById("empty");
  const search = document.getElementById("search");
  const chipsEl = document.getElementById("chips");
  const hideDone = document.getElementById("hide-done");
  const barFill = document.getElementById("bar-fill");
  const progressText = document.getElementById("progress-text");

  let done = new Set();
  try { done = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch (e) {}
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...done])); } catch (e) {} };

  const categories = [ALL, NEW, ...new Set(TIPS.map(t => t.cat))];
  let active = ALL;

  categories.forEach(cat => {
    const b = document.createElement("button");
    b.className = "chip";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.textContent = cat;
    b.addEventListener("click", () => { active = cat; render(); });
    chipsEl.appendChild(b);
  });

  const normalize = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function card(t) {
    const el = document.createElement("article");
    el.className = "card" + (done.has(t.id) ? " done" : "");
    el.innerHTML = `
      <div class="card-top">
        <span class="tag">${t.cat}</span>
        <span class="level">${t.level}</span>
      </div>
      ${t.isNew ? '<span class="new">Novo no FC 27</span>' : ""}
      <h3>${t.title}</h3>
      <p>${t.text}</p>
      ${t.combo ? `<div class="combo">${t.combo}</div>` : ""}
      <label class="check"><input type="checkbox" ${done.has(t.id) ? "checked" : ""}> Já dominei</label>`;
    el.querySelector("input").addEventListener("change", e => {
      e.target.checked ? done.add(t.id) : done.delete(t.id);
      save();
      render();
    });
    return el;
  }

  function render() {
    const q = normalize(search.value.trim());
    [...chipsEl.children].forEach(c => c.setAttribute("aria-selected", c.textContent === active));

    const list = TIPS.filter(t => {
      if (active === NEW && !t.isNew) return false;
      if (active !== ALL && active !== NEW && t.cat !== active) return false;
      if (hideDone.checked && done.has(t.id)) return false;
      if (q && !normalize(t.title + " " + t.text + " " + t.cat).includes(q)) return false;
      return true;
    });

    grid.replaceChildren(...list.map(card));
    empty.hidden = list.length > 0;

    const count = TIPS.filter(t => done.has(t.id)).length;
    barFill.style.width = (count / TIPS.length) * 100 + "%";
    progressText.textContent = `${count} de ${TIPS.length} dicas dominadas`;
  }

  search.addEventListener("input", render);
  hideDone.addEventListener("change", render);
  render();
})();
