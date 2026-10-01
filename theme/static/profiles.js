document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('profile-page');
  const select = document.querySelector('#profile, select[name="profile"]');
  if (!select) return;
  const storageKey = 'bnp-workspaces:selected-profile';

  const metadata = {
    python: { icon: 'Py', tone: 'green', category: 'Development', tags: ['Python 3.12', 'Git', '2 CPU', '4 GB RAM'] },
    datascience: { icon: 'DS', tone: 'mint', category: 'Data', tags: ['Pandas', 'SciPy', '4 CPU', '8 GB RAM'] },
    node: { icon: 'JS', tone: 'blue', category: 'Development', tags: ['Node.js 22', 'TypeScript', '2 CPU', '4 GB RAM'] },
    java: { icon: 'JV', tone: 'orange', category: 'Development', tags: ['JDK 21', 'Maven', '4 CPU', '8 GB RAM'] },
    cuda: { icon: 'AI', tone: 'gold', category: 'Artificial intelligence', tags: ['PyTorch', 'CUDA 12', '8 CPU', '1 GPU'] },
  };

  const options = [...select.options].filter(option => option.value);
  try {
    const savedProfile = window.localStorage.getItem(storageKey);
    if (savedProfile && options.some(option => option.value === savedProfile)) {
      select.value = savedProfile;
    }
  } catch (_) {
    // Storage can be disabled by the browser; profile selection still works.
  }
  const layout = document.createElement('div');
  layout.className = 'profile-picker';
  layout.innerHTML = '<div class="profile-list" role="listbox" aria-label="Available profiles"></div><aside class="profile-detail" aria-live="polite"></aside>';
  const list = layout.querySelector('.profile-list');
  const detail = layout.querySelector('.profile-detail');
  select.closest('.form-group, .mb-3, div')?.classList.add('native-profile-control');

  const readOption = option => {
    const meta = metadata[option.value] || { icon: 'VS', tone: 'green', category: 'Workspace', tags: [] };
    const pieces = option.text.split('—');
    return { ...meta, value: option.value, title: pieces[0].trim(), description: pieces.slice(1).join('—').trim() };
  };

  options.forEach((option, index) => {
    const data = readOption(option);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `profile-row tone-${data.tone}`;
    row.dataset.value = option.value;
    row.setAttribute('role', 'option');
    row.innerHTML = `<span class="row-icon">${data.icon}</span><span class="row-copy"><strong>${data.title}</strong><small>${data.category} · ${data.tags.slice(-2).join(' · ')}</small></span><span class="row-index">0${index + 1}</span><span class="row-arrow">›</span>`;
    row.addEventListener('click', () => {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    list.appendChild(row);
  });

  function update() {
    const option = options.find(item => item.value === select.value) || options[0];
    const data = readOption(option);
    list.querySelectorAll('.profile-row').forEach(row => {
      const selected = row.dataset.value === option.value;
      row.classList.toggle('selected', selected);
      row.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    detail.className = `profile-detail tone-${data.tone}`;
    detail.innerHTML = `<div class="detail-top"><span class="detail-label">Selected profile</span><span class="detail-status"><i></i> Available</span></div><div class="detail-heading"><div class="detail-icon">${data.icon}</div><div><p class="detail-category">${data.category}</p><h2>${data.title}</h2></div></div><p class="detail-description">${data.description || 'An isolated, ready-to-use VS Code environment.'}</p><div class="detail-tags">${data.tags.map(tag => `<span>${tag}</span>`).join('')}</div><div class="detail-note"><span>✓</span><p><strong>Persistent storage</strong><small>Your files are preserved between sessions.</small></p></div>`;
  }

  select.insertAdjacentElement('afterend', layout);
  select.addEventListener('change', () => {
    try {
      window.localStorage.setItem(storageKey, select.value);
    } catch (_) {
      // Keep the UI functional when storage is unavailable.
    }
    update();
  });
  update();
});
