document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('profile-page');
  const select = document.querySelector('#profile, select[name="profile"]');
  const radios = [...document.querySelectorAll('input[type="radio"][name="profile"]')];
  if (!select && !radios.length) return;
  const storageKey = 'bnp-workspaces:selected-profile';

  const icons = {
    python: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-4 0-4 1.8-4 4v2h8v1H6c-2.2 0-3 1.8-3 4s.8 4 3 4h2v-3.5c0-2 1.3-3.5 3.5-3.5H16c2.2 0 4-1.8 4-4s-1.8-4-4-4h-4Z"/><circle cx="11" cy="6" r=".8"/><path d="M12 21c4 0 4-1.8 4-4v-2H8v-1h10c2.2 0 3-1.8 3-4s-.8-4-3-4h-2v3.5c0 2-1.3 3.5-3.5 3.5H8c-2.2 0-4 1.8-4 4s1.8 4 4 4h4Z"/><circle cx="13" cy="18" r=".8"/></svg>',
    datascience: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v5c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 10v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5M5 15v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/></svg>',
    node: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 8.7 5v10L12 22l-8.7-5V7L12 2Z"/><path d="M8.5 9.2v5.1c0 1.1.8 1.7 1.8 1.7s1.7-.6 1.7-1.7V8m3 2.5c.4-.7 1.1-1 1.9-1 1 0 1.8.5 1.8 1.3 0 2-3.7 1.1-3.7 3.3 0 .9.8 1.5 1.9 1.5.9 0 1.6-.4 2-1"/></svg>',
    java: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h8v5a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-5ZM16 11h1.5a2 2 0 0 1 0 4H16M6 21h12M10 7c3-1 4-2.3 2-4m1 5c3-1 4-2.3 2-4"/></svg>',
    cuda: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9V7m0 10v-2m3-3h2M7 12h2m5.1-2.1 1.4-1.4m-7 7 1.4-1.4m4.2 0 1.4 1.4m-7-7 1.4 1.4M2 9h2m-2 3h2m-2 3h2m16-6h2m-2 3h2m-2 3h2"/></svg>',
    workspace: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="m7 9 3 3-3 3m5 0h5M9 21h6"/></svg>',
  };

  const metadata = {
    python: { icon: icons.python, tone: 'green', category: 'Development', tags: ['Python 3.12', 'Git', '2 CPU', '4 GB RAM'] },
    datascience: { icon: icons.datascience, tone: 'mint', category: 'Data', tags: ['Pandas', 'SciPy', '4 CPU', '8 GB RAM'] },
    node: { icon: icons.node, tone: 'blue', category: 'Development', tags: ['Node.js 22', 'TypeScript', '2 CPU', '4 GB RAM'] },
    java: { icon: icons.java, tone: 'orange', category: 'Development', tags: ['JDK 21', 'Maven', '4 CPU', '8 GB RAM'] },
    cuda: { icon: icons.cuda, tone: 'gold', category: 'Artificial intelligence', tags: ['PyTorch', 'CUDA 12', '8 CPU', '1 GPU'] },
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
      icon: icons.workspace, tone: 'green', category: 'Workspace', tags: [],
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
    row.innerHTML = `<span class="row-icon">${data.icon}</span><span class="row-copy"><strong>${data.title}</strong><small>${data.category} · ${data.tags.slice(-2).join(' · ')}</small></span><span class="row-index">0${index + 1}</span><span class="row-arrow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></span>`;
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
    detail.innerHTML = `<div class="detail-top"><span class="detail-label">Selected profile</span><span class="detail-status"><i></i> Available</span></div><div class="detail-heading"><div class="detail-icon">${data.icon}</div><div><p class="detail-category">${data.category}</p><h2>${data.title}</h2></div></div><p class="detail-description">${data.description || 'An isolated, ready-to-use VS Code environment.'}</p><div class="detail-tags">${data.tags.map(tag => `<span>${tag}</span>`).join('')}</div><div class="detail-note"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></span><p><strong>Persistent storage</strong><small>Your files are preserved between sessions.</small></p></div>`;
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
