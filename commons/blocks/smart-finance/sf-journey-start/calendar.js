import { html } from '../../../scripts/vendor/htm-preact.js';
import { useState, useEffect } from '../../../scripts/vendor/preact-hooks.js';

const Calendar = ({ inputValue, onDOBSelect }) => {
  const today = new Date();
  const minDate = new Date(today.setFullYear(today.getFullYear() - 18));
  const [currentView, setCurrentView] = useState('days');
  const [currentDate, setCurrentDate] = useState(minDate);

  useEffect(() => {
    setCurrentDate(new Date(new Date().setFullYear(new Date().getFullYear() - 18)));
  }, []);

  useEffect(() => {
    if (inputValue) {
      const [day, month, year] = inputValue.split('-').map(Number);
      const inputDate = new Date(year, month - 1, day);
      if (!Number.isNaN(inputDate)) {
        setCurrentDate(inputDate);
      }
    }
  }, [inputValue]);

  const handlePrev = () => {
    if (currentView === 'days') {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    } else if (currentView === 'months') {
      setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() - 1)));
    } else if (currentView === 'years') {
      setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() - 10)));
    } else if (currentView === 'decades') {
      setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() - 100)));
    } else if (currentView === 'centuries') {
      setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() - 1000)));
    }
  };

  const handleNext = () => {
    if (currentView === 'days') {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    } else if (currentView === 'months') {
      setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)));
    } else if (currentView === 'years') {
      setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() + 10)));
    } else if (currentView === 'decades') {
      setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() + 100)));
    } else if (currentView === 'centuries') {
      setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() + 1000)));
    }
  };

  const switchToMonthsView = () => setCurrentView('months');
  const switchToYearsView = () => setCurrentView('years');
  const switchToDecadesView = () => setCurrentView('decades');
  const switchToCenturiesView = () => setCurrentView('centuries');

  // Helper functions to get date details
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const formatMonthYear = (date) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDayClick = (e) => {
    const date = formatDate(new Date(e.currentTarget.getAttribute('data-date')));
    onDOBSelect(date);
  };

  const handleMonthClick = (e) => {
    const date = new Date(e.currentTarget.getAttribute('data-date'));
    setCurrentDate(date);
    // Switch to year view after selecting a month
    setCurrentView('days');
  };

  const handleYearClick = (e) => {
    const date = new Date(e.currentTarget.getAttribute('data-date'));
    setCurrentDate(date);
    // Switch to decade view after selecting a year
    setCurrentView('months');
  };

  const handleDecadeClick = (e) => {
    const date = new Date(e.currentTarget.getAttribute('data-date'));
    setCurrentDate(date);
    // Switch to century view after selecting a decade
    setCurrentView('years');
  };

  const handleCenturyClick = (e) => {
    const date = new Date(e.currentTarget.getAttribute('data-date'));
    setCurrentDate(date);
    setCurrentView('decades');
  };
  const renderDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const totalDays = getDaysInMonth(currentDate);
    const days = [];
    let row = [];

    for (let i = 0; i < firstDay; i += 1) {
      row.push(html`<td class="empty"></td>`);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isDisabled = date > minDate;
      const isHighlighted = date.toDateString() === currentDate.toDateString() ? 'highlight' : '';
      row.push(
        html`<td class="${isDisabled ? 'disabled' : 'allowed'}${isHighlighted}" data-date=${date.toISOString()} onClick=${(e) => !isDisabled && handleDayClick(e)}>${day}</td>`,
      );

      // If the row is full (7 days), push it and reset
      if (row.length === 7) {
        days.push(html`<tr>${row}</tr>`);
        row = [];
      }
    }

    // Add any remaining cells in the last row
    if (row.length > 0) {
      while (row.length < 7) {
        row.push(html`<td class="empty"></td>`);
      }
      days.push(html`<tr>${row}</tr>`);
    }

    return html`
    <tbody>
      ${days}
    </tbody>
  `;
  };

  const renderMonths = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const rows = [];
    let row = [];

    months.forEach((month, index) => {
      const abbreviatedMonth = month.substring(0, 3);
      const date = new Date(currentDate.getFullYear(), index, 1);
      const isDisabled = date > minDate;
      row.push(
        html`<td class=${isDisabled ? 'disabled' : ''} data-date=${date.toISOString()} onClick=${(e) => !isDisabled && handleMonthClick(e)}>${abbreviatedMonth}</td>`,
      );

      if (row.length === 4) {
        rows.push(html`<tr>${row}</tr>`);
        row = [];
      }
    });

    if (row.length > 0) {
      while (row.length < 4) {
        row.push(html`<td class="empty"></td>`);
      }
      rows.push(html`<tr>${row}</tr>`);
    }

    return html`
    <tbody>
      ${rows}
    </tbody>
  `;
  };

  const renderYears = () => {
    const startYear = Math.floor(currentDate.getFullYear() / 10) * 10 - 1;
    const endYear = startYear + 12;

    const years = [];
    let row = [];

    for (let i = startYear; i < endYear; i += 1) {
      const date = new Date(i, 0, 1);
      const isDisabled = date > minDate;
      row.push(
        html`<td class=${isDisabled ? 'disabled' : ''} data-date=${date.toISOString()} onClick=${(e) => !isDisabled && handleYearClick(e)}>${i}</td>`,
      );

      if (row.length === 4) {
        years.push(html`<tr>${row}</tr>`);
        row = [];
      }
    }

    if (row.length > 0) {
      while (row.length < 4) {
        row.push(html`<td class="empty"></td>`);
      }
      years.push(html`<tr>${row}</tr>`);
    }

    return html`
    <tbody>
      ${years}
    </tbody>
  `;
  };

  const renderDecades = () => {
    const startDecade = Math.floor(currentDate.getFullYear() / 100) * 100 - 10;
    const endDecade = startDecade + 120;

    const decades = [];
    let row = [];

    for (let i = startDecade; i < endDecade; i += 10) {
      const date = new Date(i, 0, 1);
      const isDisabled = date > minDate;
      row.push(
        html`<td class=${isDisabled ? 'disabled' : ''} data-date=${date.toISOString()} onClick=${(e) => !isDisabled && handleDecadeClick(e)}>${i}</td>`,
      );

      // If the row is full (4 decades), push it and reset
      if (row.length === 4) {
        decades.push(html`<tr>${row}</tr>`);
        row = [];
      }
    }

    // Add any remaining cells in the last row
    if (row.length > 0) {
      while (row.length < 4) {
        row.push(html`<td class="empty"></td>`);
      }
      decades.push(html`<tr>${row}</tr>`);
    }

    return html`
    <tbody>
      ${decades}
    </tbody>
  `;
  };

  const renderCenturies = () => {
    const startCentury = Math.floor(currentDate.getFullYear() / 1000) * 1000 - 100;
    const endCentury = startCentury + 1200;

    const centuries = [];
    let row = [];

    // Generate century cells
    for (let i = startCentury; i < endCentury; i += 100) {
      const date = new Date(i, 0, 1);
      const isDisabled = date > minDate;
      row.push(
        html`<td class=${isDisabled ? 'disabled' : ''} data-date=${date.toISOString()} onClick=${(e) => !isDisabled && handleCenturyClick(e)}>${i}</td>`,
      );

      // If the row is full (4 centuries), push it and reset
      if (row.length === 4) {
        centuries.push(html`<tr>${row}</tr>`);
        row = [];
      }
    }

    // Add any remaining cells in the last row
    if (row.length > 0) {
      while (row.length < 4) {
        row.push(html`<td class="empty"></td>`);
      }
      centuries.push(html`<tr>${row}</tr>`);
    }

    return html`
    <tbody>
      ${centuries}
    </tbody>
  `;
  };

  return html`
    <div class="datepicker">
      
      <!-- Days View (initial load view) -->
      <div class="datepicker-days" style=${currentView === 'days' ? 'display: block;' : 'display: none;'}>
        <table class="table-condensed">
          <thead>
            <tr>
              <th class="prev" onClick=${handlePrev}>«</th>
              <th colspan="5" class="datepicker-switch" onClick=${switchToMonthsView}>${formatMonthYear(currentDate)}</th>
              <th class="next" onClick=${handleNext}>»</th>
            </tr>
            <tr>
              <th class="dow">Su</th><th class="dow">Mo</th><th class="dow">Tu</th><th class="dow">We</th><th class="dow">Th</th><th class="dow">Fr</th><th class="dow">Sa</th>
            </tr>
          </thead>
          ${renderDays()}
        </table>
      </div>
      
      <!-- Months View -->
      <div class="datepicker-months" style=${currentView === 'months' ? 'display: block;' : 'display: none;'}>
        <table class="table-condensed">
          <thead>
            <tr>
              <th class="prev" onClick=${handlePrev}>«</th>
              <th colspan="2" class="datepicker-switch" onClick=${switchToYearsView}>${currentDate.getFullYear()}</th>
              <th class="next" onClick=${handleNext}>»</th>
            </tr>
          </thead>
          ${renderMonths()}
        </table>
      </div>

      <!-- Years View -->
      <div class="datepicker-years" style=${currentView === 'years' ? 'display: block;' : 'display: none;'}>
        <table class="table-condensed">
          <thead>
            <tr>
              <th class="prev" onClick=${handlePrev}>«</th>
              <th colspan="2" class="datepicker-switch" onClick=${switchToDecadesView}>${Math.floor(currentDate.getFullYear() / 10) * 10}-${Math.floor(currentDate.getFullYear() / 10) * 10 + 9}</th>
              <th class="next" onClick=${handleNext}>»</th>
            </tr>
          </thead>
          ${renderYears()}
        </table>
      </div>

      <!-- Decades View -->
      <div class="datepicker-decades" style=${currentView === 'decades' ? 'display: block;' : 'display: none;'}>
        <table class="table-condensed">
          <thead>
            <tr>
              <th class="prev" onClick=${handlePrev}>«</th>
              <th colspan="2" class="datepicker-switch" onClick=${switchToCenturiesView}>${Math.floor(currentDate.getFullYear() / 100) * 100}-${Math.floor(currentDate.getFullYear() / 100) * 100 + 99}</th>
              <th class="next" onClick=${handleNext}>»</th>
            </tr>
          </thead>
          ${renderDecades()}
        </table>
      </div>

      <!-- Centuries View -->
      <div class="datepicker-centuries" style=${currentView === 'centuries' ? 'display: block;' : 'display: none;'}>
        <table class="table-condensed">
          <thead>
            <tr>
              <th class="prev" onClick=${handlePrev}>«</th>
              <th colspan="2" class="datepicker-switch">${Math.floor(currentDate.getFullYear() / 1000) * 1000}-${Math.floor(currentDate.getFullYear() / 1000) * 1000 + 999}</th>
              <th class="next" onClick=${handleNext}>»</th>
            </tr>
          </thead>
          ${renderCenturies()}
        </table>
      </div>
    </div>
  `;
};

export default Calendar;
