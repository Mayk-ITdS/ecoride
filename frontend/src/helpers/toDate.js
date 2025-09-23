export const toDate = (val) => {
  if (val instanceof Date) return val;

  if (typeof val === "string") {
    const s = val.trim().replace(/\u00A0/g, " ");

    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
    if (m) {
      const [, yyyy, MM, dd, hh, mm] = m.map(Number);
      const d = new Date(yyyy, MM - 1, dd, hh, mm, 0, 0);
      if (!Number.isNaN(d.getTime())) return d;
    }

    m = s.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );
    if (m) {
      let [, MM, dd, yyyy, hh, mm, ap] = m;
      MM = Number(MM);
      dd = Number(dd);
      yyyy = Number(yyyy);
      hh = Number(hh) % 12;
      if (/PM/i.test(ap)) hh += 12;
      const d = new Date(yyyy, MM - 1, dd, hh, Number(mm), 0, 0);
      if (!Number.isNaN(d.getTime())) return d;
    }

    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }

  if (typeof val === "number") {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d;
  }

  throw new Error(`Invalid date value: ${JSON.stringify(val)}`);
};
