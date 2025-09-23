export function buildTrajetsQuery(raw = {}) {
  const qs = new URLSearchParams();

  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined || v === null) continue;

    if (typeof v === "string") {
      const s = v.trim().replace(/[}\s]+$/, "");
      if (s === "") continue;
      qs.append(k, s);
      continue;
    }

    if (v instanceof Date) {
      if (!Number.isNaN(v.getTime()))
        qs.append(k, v.toISOString().slice(0, 10));
      continue;
    }

    if (typeof v === "number") {
      if (Number.isFinite(v)) qs.append(k, String(v));
      continue;
    }

    if (typeof v === "boolean") {
      qs.append(k, String(v));
      continue;
    }

    if (Array.isArray(v)) {
      v.forEach((item) => {
        if (item != null && String(item).trim() !== "")
          qs.append(k, String(item).trim());
      });
      continue;
    }
  }

  return qs.toString();
}
