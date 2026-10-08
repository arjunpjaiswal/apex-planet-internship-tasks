import './Card.css';

export function createCard({
  title = '',
  content = '',
  footer = '',
  variant = 'default' // default, elevated, outlined
} = {}) {
  const card = document.createElement('div');
  card.className = `card card-${variant}`;

  if (title) {
    const header = document.createElement('div');
    header.className = 'card-header';
    header.textContent = title;
    card.appendChild(header);
  }

  const body = document.createElement('div');
  body.className = 'card-body';
  body.innerHTML = content;
  card.appendChild(body);

  if (footer) {
    const foot = document.createElement('div');
    foot.className = 'card-footer';
    foot.innerHTML = footer;
    card.appendChild(foot);
  }

  return card;
}
