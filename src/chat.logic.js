/**
 * Pure Virtual Chat Logic
 */

export function visibleRange(scrollTop, containerHeight, itemHeight = 60, totalItems = 0, buffer = 5) {
  if (totalItems <= 0) {
    return { startIndex: 0, endIndex: 0, offsetY: 0 };
  }

  const rawStart = Math.floor(scrollTop / itemHeight);
  const rawVisibleCount = Math.ceil(containerHeight / itemHeight);

  const startIndex = Math.max(0, rawStart - buffer);
  const endIndex = Math.min(totalItems, rawStart + rawVisibleCount + buffer);
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY };
}

export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function highlight(text = '', query = '') {
  const safeText = escapeHtml(text);
  if (!query || !query.trim()) return safeText;

  const escapedQuery = query.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return safeText.replace(regex, '<mark class="highlight">$1</mark>');
}

export function searchMessages(messages = [], query = '') {
  if (!query || !query.trim()) return messages;
  const q = query.trim().toLowerCase();
  return messages.filter(m =>
    (m.text && m.text.toLowerCase().includes(q)) ||
    (m.sender && m.sender.toLowerCase().includes(q))
  );
}

export function isNearBottom(scrollTop, scrollHeight, clientHeight, threshold = 120) {
  return scrollHeight - (scrollTop + clientHeight) <= threshold;
}

export function groupBySenderAndTime(messages = [], maxGapMinutes = 5) {
  const maxGapMs = maxGapMinutes * 60 * 1000;
  const groups = [];
  let currentGroup = null;

  for (const msg of messages) {
    const msgTime = new Date(msg.timestamp).getTime();

    if (
      currentGroup &&
      currentGroup.sender === msg.sender &&
      msgTime - currentGroup.lastTimestamp <= maxGapMs
    ) {
      currentGroup.messages.push(msg);
      currentGroup.lastTimestamp = msgTime;
    } else {
      currentGroup = {
        sender: msg.sender,
        avatar: msg.avatar,
        firstTimestamp: msgTime,
        lastTimestamp: msgTime,
        messages: [msg]
      };
      groups.push(currentGroup);
    }
  }

  return groups;
}
