(() => {
  const ring = document.querySelector(".curzr-ring-dot");
  if(!ring) return;

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia("(hover: none)").matches;
  if(coarsePointer || noHover){
    ring.style.display = "none";
    return;
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    active: false,
  };

  const setActive = (on) => {
    ring.classList.toggle("is-active", on);
  };

  const applyPosition = () => {
    ring.style.setProperty("--ring-x", `${state.x}px`);
    ring.style.setProperty("--ring-y", `${state.y}px`);
  };

  window.addEventListener("pointermove", (e) => {
    state.x = e.clientX;
    state.y = e.clientY;
    if(!state.active){
      state.active = true;
      setActive(true);
    }
    applyPosition();
  }, { passive: true });

  window.addEventListener("pointerdown", () => ring.classList.add("is-down"));
  window.addEventListener("pointerup", () => ring.classList.remove("is-down"));

  window.addEventListener("pointerleave", () => {
    state.active = false;
    setActive(false);
  });
  window.addEventListener("pointerenter", (e) => {
    state.x = e.clientX;
    state.y = e.clientY;
    setActive(true);
    applyPosition();
  });

  const interactiveSelector = "a, button, .btn, [role=\"button\"], input, select, textarea, summary, label";

  document.addEventListener("pointerover", (e) => {
    if(e.target.closest(interactiveSelector)){
      ring.classList.add("is-hover");
    }
  });

  document.addEventListener("pointerout", (e) => {
    const target = e.target.closest(interactiveSelector);
    if(!target) return;
    const related = e.relatedTarget;
    if(related && related.closest(interactiveSelector) === target) return;
    ring.classList.remove("is-hover");
  });

  ring.style.setProperty("--ring-x", `${state.x}px`);
  ring.style.setProperty("--ring-y", `${state.y}px`);
})();
