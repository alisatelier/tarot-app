type Category = {
  id: string;
  title: string;
  intentions: Array<{ id: string; kind: "simple"; label: string; requiresName?: boolean }>;
};

type Spread = {
  id: string;
  title: string;
  slots: unknown[];
  categories: Category[];
};

type Vars = Record<string, string | undefined>;

const interpolate = (label: string, vars: Vars) =>
  label.replace(/\$\{(\w+)\}/g, (_, k) => (vars?.[k] ?? "").toString());

export function flattenIntentions(spread: Spread, vars?: Vars) {
  const list: { id: string; label: string }[] = [];
  for (const cat of spread.categories) {
    for (const i of cat.intentions) {
      const label = vars ? interpolate(i.label, vars) : i.label;
      list.push({ id: i.id, label });
    }
  }
  return list;
}
