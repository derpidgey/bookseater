function toHours({ months, days, hours }) {
  return months * 30 * 24 + days * 24 + hours;
}

function toTimeString({ months, days, hours }) {
  if (months > 0) return `${months}mo ${days}d ${hours}h`;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function stringToTime(timeString) {
  const timeObject = { months: 0, days: 0, hours: 0 };
  timeString.split(' ').forEach(part => {
    const value = parseInt(part);
    const unit = part.replace(/\d/g, '');

    switch (unit) {
      case 'mo':
        timeObject.months = value;
        break;
      case 'd':
        timeObject.days = value;
        break;
      case 'h':
        timeObject.hours = value;
        break;
      default:
        break;
    }
  });
  return timeObject;
}

function hoursToTime(hours) {
  return {
    months: Math.floor(hours / (30 * 24)),
    days: Math.floor((hours % (30 * 24)) / 24),
    hours: hours % 24
  };
}

function makeDraggable(element) {
  element.style.cursor = 'move';
  element.style.userSelect = 'none';
  element.addEventListener('mousedown', event => {
    const initialX = event.clientX;
    const initialY = event.clientY;
    const rect = element.getBoundingClientRect();
    const initialLeft = rect.left;
    const initialTop = rect.top;
    const docWidth = document.body.clientWidth;
    const pageHeight = window.innerHeight;
    function onMouseMove(event) {
      const deltaX = event.clientX - initialX;
      const deltaY = event.clientY - initialY;
      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;
      newLeft = Math.max(0, Math.min(newLeft, docWidth - rect.width));
      newTop = Math.max(0, Math.min(newTop, pageHeight - rect.height));

      element.style.left = newLeft + 'px';
      element.style.top = newTop + 'px';
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}
