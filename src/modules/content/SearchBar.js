import { debounce } from "../../util.js";

export function mountSearchBar(container, { onQuery, placeholder }) {
  container.innerHTML = `<input type="search" class="content-search" placeholder="${placeholder}" data-q />`;
  const input = container.querySelector("[data-q]");
  const debounced = debounce((v) => onQuery(v), 200);
  input.addEventListener("input", () => debounced(input.value));
  return {
    setValue(v) {
      input.value = v;
      onQuery(v);
    },
    focus() {
      input.focus();
    },
    getInput: () => input,
  };
}
