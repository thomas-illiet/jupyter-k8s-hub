document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('profile-page');
  const select = document.querySelector('#profile, select[name="profile"]');
  const radios = [...document.querySelectorAll('input[type="radio"][name="profile"]')];
  if (!select && !radios.length) return;
  const storageKey = 'bnp-workspaces:selected-profile';

  const metadata = {
    python: { icon: 'Py', tone: 'green', category: 'Development', tags: ['Python 3.12', 'Git', '2 CPU', '4 GB RAM'] },
    datascience: { icon: 'DS', tone: 'mint', category: 'Data', tags: ['Pandas', 'SciPy', '4 CPU', '8 GB RAM'] },
    node: { icon: 'JS', tone: 'blue', category: 'Development', tags: ['Node.js 22', 'TypeScript', '2 CPU', '4 GB RAM'] },
    java: { icon: 'JV', tone: 'orange', category: 'Development', tags: ['JDK 21', 'Maven', '4 CPU', '8 GB RAM'] },
    cuda: { icon: 'AI', tone: 'gold', category: 'Artificial intelligence', tags: ['PyTorch', 'CUDA 12', '8 CPU', '1 GPU'] },
  };

  const controls = select
    ? [...select.options].filter(option => option.value).map(option => ({
        value: option.value,
        title: option.text.split('—')[0].trim(),
        description: option.text.split('—').slice(1).join('—').trim(),
        selected: () => select.value === option.value,
        select: () => {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        },
      }))
    : radios.map(radio => {
        const label = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`);
        return {
          value: radio.value,
          title: label?.querySelector('h3')?.textContent.trim() || radio.value,
          description: label?.querySelector('p')?.textContent.trim() || '',
          selected: () => radio.checked,
          select: () => {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
          },
        };
      });
  try {
    const savedProfile = window.localStorage.getItem(storageKey);
    controls.find(control => control.value === savedProfile)?.select();
  } catch (_) {
    // Storage can be disabled by the browser; profile selection still works.
  }
  const layout = document.createElement('div');
  layout.className = 'profile-picker';
  layout.innerHTML = '<div class="profile-list" role="listbox" aria-label="Available profiles"></div><aside class="profile-detail" aria-live="polite"></aside>';
  const list = layout.querySelector('.profile-list');
  const detail = layout.querySelector('.profile-detail');
  const nativeControl = select?.closest('.form-group, .mb-3, div') || document.querySelector('#kubespawner-profiles-list');
  nativeControl?.classList.add('native-profile-control');

  const readControl = control => {
    const meta = metadata[control.value] || {
      icon: control.title.slice(0, 2).toUpperCase(), tone: 'green', category: 'Workspace', tags: [],
    };
    return { ...meta, ...control };
  };

  controls.forEach((control, index) => {
    const data = readControl(control);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `profile-row tone-${data.tone}`;
    row.dataset.value = control.value;
    row.setAttribute('role', 'option');
    row.innerHTML = `<span class="row-icon">${data.icon}</span><span class="row-copy"><strong>${data.title}</strong><small>${data.category} · ${data.tags.slice(-2).join(' · ')}</small></span><span class="row-index">0${index + 1}</span><span class="row-arrow">›</span>`;
    row.addEventListener('click', control.select);
    list.appendChild(row);
  });

  function update() {
    const control = controls.find(item => item.selected()) || controls[0];
    const data = readControl(control);
    list.querySelectorAll('.profile-row').forEach(row => {
      const selected = row.dataset.value === control.value;
      row.classList.toggle('selected', selected);
      row.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    detail.className = `profile-detail tone-${data.tone}`;
    detail.innerHTML = `<div class="detail-top"><span class="detail-label">Selected profile</span><span class="detail-status"><i></i> Available</span></div><div class="detail-heading"><div class="detail-icon">${data.icon}</div><div><p class="detail-category">${data.category}</p><h2>${data.title}</h2></div></div><p class="detail-description">${data.description || 'An isolated, ready-to-use VS Code environment.'}</p><div class="detail-tags">${data.tags.map(tag => `<span>${tag}</span>`).join('')}</div><div class="detail-note"><span>✓</span><p><strong>Persistent storage</strong><small>Your files are preserved between sessions.</small></p></div>`;
  }

  nativeControl?.insertAdjacentElement('afterend', layout);
  const handleChange = () => {
    const selected = controls.find(control => control.selected()) || controls[0];
    try {
      window.localStorage.setItem(storageKey, selected.value);
    } catch (_) {
      // Keep the UI functional when storage is unavailable.
    }
    update();
  };
  (select ? [select] : radios).forEach(control => control.addEventListener('change', handleChange));
  update();
});
