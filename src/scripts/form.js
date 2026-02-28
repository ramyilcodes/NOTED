export function showFormError(form, message) {
  if (!form) return;

  let errorEl = form.querySelector(".form-error");
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.className = "form-error text-center accent-text";
    form.prepend(errorEl);
  }

  errorEl.textContent = message;
}

export function clearFormError(form) {
  if (!form) return;
  const errorEl = form.querySelector(".form-error");
  if (errorEl) {
    errorEl.textContent = "";
  }
}
