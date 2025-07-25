window.addEventListener("load", () => {
  console.log("🟡 signup-scheduler.js with multi-range drag support running");

  const scheduleData = {};
  const interval = 15;
  const totalMinutes = 24 * 60;

  document.querySelectorAll(".schedule-track").forEach(track => {
    const day = track.dataset.day;
    let selecting = false;
    let startX = 0;
    let selectionDiv = null;

    track.addEventListener("mousedown", (e) => {
      const rect = track.getBoundingClientRect();
      selecting = true;

      const rawX = e.clientX - rect.left;
      startX = snapToInterval(clamp(rawX, 0, rect.width), rect.width);

      // Create new visual block (do not remove existing)
      selectionDiv = document.createElement("div");
      selectionDiv.className = "selection-block";
      selectionDiv.style.left = `${startX}px`;
      selectionDiv.style.width = "0px";
      track.appendChild(selectionDiv);
    });

    track.addEventListener("mousemove", (e) => {
      if (!selecting || !selectionDiv) return;

      const rect = track.getBoundingClientRect();
      const currentX = snapToInterval(clamp(e.clientX - rect.left, 0, rect.width), rect.width);

      const left = Math.min(startX, currentX);
      const right = Math.max(startX, currentX);
      selectionDiv.style.left = `${left}px`;
      selectionDiv.style.width = `${right - left}px`;
    });

    track.addEventListener("mouseup", (e) => {
      if (!selectionDiv) return;
      const rect = track.getBoundingClientRect();
      const endX = snapToInterval(clamp(e.clientX - rect.left, 0, rect.width), rect.width);
    
      const startXFinal = Math.min(startX, endX);
      const endXFinal = Math.max(startX, endX);
      const [start, end] = toTimeRange(startXFinal, endXFinal, rect.width);
    
      // Position the selection visually
      selectionDiv.style.left = `${startXFinal}px`;
      selectionDiv.style.width = `${endXFinal - startXFinal}px`;
    
      // Create and insert label
      const label = document.createElement("span");
      label.className = "time-label";
      label.textContent = `${start} – ${end}`;
      selectionDiv.appendChild(label);
    
      // Store in schedule data
      if (!scheduleData[day]) scheduleData[day] = [];
      scheduleData[day].push([start, end]);
    
      console.log(`✅ ${day}: ${start} → ${end}`);
      selecting = false;
    });

  });

  document.getElementById("schedule-form").addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("📅 Final weekly schedule:", scheduleData);
    // TODO: send scheduleData to backend
    window.location.href = "/payment.html";
  });

  document.getElementById("clear-schedule")?.addEventListener("click", () => {
    document.querySelectorAll(".selection-block").forEach(el => el.remove());
    for (const key in scheduleData) delete scheduleData[key];
    console.log("🧹 Schedule cleared");
  });

  document.querySelectorAll(".clear-day").forEach(btn => {
    btn.addEventListener("click", () => {
      const day = btn.dataset.day;
      document.querySelectorAll(`.schedule-track[data-day="${day}"] .selection-block`).forEach(el => el.remove());
      delete scheduleData[day];
      console.log(`🧹 Cleared schedule for ${day}`);
      });
    });

  // --- Utilities ---

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function snapToInterval(x, width) {
    const totalBlocks = totalMinutes / interval;
    const blockWidth = width / totalBlocks;
    const snappedBlock = Math.round(x / blockWidth);
    return snappedBlock * blockWidth;
  }

  function toTimeRange(x1, x2, width) {
    const ratio1 = x1 / width;
    const ratio2 = x2 / width;
    const startMins = Math.round(ratio1 * totalMinutes / interval) * interval;
    const endMins = Math.round(ratio2 * totalMinutes / interval) * interval;
    return [formatTime(startMins), formatTime(endMins)];
  }

  function formatTime(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
});

