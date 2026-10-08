import './Button.css';

export function createButton({
  label = 'Button',
  variant = 'primary', // primary, secondary, outline, danger, success, ghost, icon
  size = 'md',        // sm, md, lg
  disabled = false,
  icon = null,
  onClick = null
} = {}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `btn btn-${variant} btn-${size}`;
  btn.disabled = disabled;

  if (icon) {
    const span = document.createElement('span');
    span.innerHTML = icon;
    btn.appendChild(span);
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = label;
  btn.appendChild(textSpan);

  if (onClick) {
    btn.addEventListener('click', onClick);
  }

  return btn;
}
