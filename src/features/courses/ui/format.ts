export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count > 1 ? pluralForm : singular}`
}
