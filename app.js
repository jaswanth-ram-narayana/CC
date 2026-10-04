const tabs = document.querySelectorAll('.project-tab');
const panels = document.querySelectorAll('.project-panel');

function selectProject(project) {
  tabs.forEach((tab) => {
    const selected = tab.dataset.project === project;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });

  panels.forEach((panel) => {
    const selected = panel.id === `panel-${project}`;
    panel.classList.toggle('hidden', !selected);
    if (selected) {
      panel.style.animation = 'none';
      requestAnimationFrame(() => { panel.style.animation = ''; });
    }
  });
}

tabs.forEach((tab) => tab.addEventListener('click', () => selectProject(tab.dataset.project)));

document.querySelector('#launch-ecg').addEventListener('click', () => {
  alert('ECG workspace is ready to connect to the FastAPI analysis endpoint.');
});
document.querySelector('#launch-protein').addEventListener('click', () => {
  alert('Protein workspace is ready to connect to the prediction job endpoint.');
});
