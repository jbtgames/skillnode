// InputForm.js — Minimal form factory
// Dependencies: none

// REGION: Render
export function mountInputForm(el) {
  const form = document.createElement('form');

  const label = document.createElement('label');
  label.setAttribute('for', 'input-text');
  label.textContent = 'Input';

  const input = document.createElement('input');
  input.id = 'input-text';
  input.name = 'q';
  input.type = 'text';
  input.placeholder = 'Placeholder';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Submit';

  form.append(label, input, submit);
  return form;
}

